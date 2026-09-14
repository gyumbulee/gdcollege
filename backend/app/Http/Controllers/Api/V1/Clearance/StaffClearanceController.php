<?php

namespace App\Http\Controllers\Api\V1\Clearance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Clearance\ClearanceDecisionRequest;
use App\Http\Resources\ClearanceRequestResource;
use App\Http\Responses\ApiResponse;
use App\Models\ClearanceItem;
use App\Models\ClearanceRequest;
use App\Services\AuditLogger;
use App\Services\ClearanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StaffClearanceController extends Controller
{
    use ApiResponse;

    /**
     * Lists clearance requests, with each item annotated by whether the
     * CURRENT staff member's role/department can act on it — so the
     * frontend can show "your stage" vs. "other stages" without a
     * second round trip. `clearance.view` (registrar/management-style
     * roles) sees everything; other clearance.approve holders only see
     * requests that have at least one item they could act on.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $roleSlugs = $user->roles->pluck('slug');
        $canViewAll = $roleSlugs->contains('registrar');

        $query = ClearanceRequest::with(['student.user', 'items']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if (! $canViewAll) {
            $myStages = collect(ClearanceItem::STAGE_ROLES)
                ->filter(fn ($role) => $roleSlugs->contains($role))
                ->keys();

            // Filtered in SQL, before paginate() — not after, which would
            // leave the paginator's total/last_page describing the
            // unfiltered set while items() returned fewer rows.
            $query->whereHas('items', fn ($q) => $q->whereIn('stage', $myStages));

            // Department scoping for the DEPARTMENT stage (HOD) — same
            // "unrestricted when no scope configured" rule as
            // ChecksDepartmentScope, applied here at the list level too.
            if ($myStages->contains('DEPARTMENT')) {
                $scopeIds = $user->departmentScopeIds();
                if (! empty($scopeIds)) {
                    $query->whereHas('student.programme', fn ($q) => $q->whereIn('department_id', $scopeIds));
                }
            }
        }

        return $this->success(ClearanceRequestResource::collection(
            $query->orderByDesc('id')->paginate($request->integer('per_page', 25))
        ));
    }

    public function show(ClearanceRequest $clearanceRequest)
    {
        return $this->success(new ClearanceRequestResource($clearanceRequest->load(['student.user', 'items'])));
    }

    public function decide(ClearanceDecisionRequest $request, ClearanceItem $clearanceItem, ClearanceService $service, AuditLogger $audit)
    {
        $this->authorize('decide', $clearanceItem);

        try {
            $item = $service->decide($clearanceItem, Auth::user(), $request->validated('decision'), $request->validated('remark'));
        } catch (\RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        $audit->log('clearance.decide', $item, null, $item->only(['stage', 'status']));

        return $this->success(new ClearanceRequestResource($item->clearanceRequest->fresh(['student.user', 'items'])), 'Clearance stage updated.');
    }
}
