<?php

namespace App\Http\Controllers\Api\V1\Siwes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Siwes\SiwesAssessmentRequest;
use App\Http\Resources\SiwesRecordResource;
use App\Http\Responses\ApiResponse;
use App\Models\SiwesRecord;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class StaffSiwesController extends Controller
{
    use ApiResponse;

    private const WITH = ['student.user'];

    public function index(Request $request)
    {
        $query = SiwesRecord::with(self::WITH);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return $this->success(SiwesRecordResource::collection(
            $query->orderByDesc('id')->paginate($request->integer('per_page', 25))
        ));
    }

    public function show(SiwesRecord $siwesRecord)
    {
        return $this->success(new SiwesRecordResource($siwesRecord->load(self::WITH)));
    }

    public function updateStatus(Request $request, SiwesRecord $siwesRecord, AuditLogger $audit)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in([
                SiwesRecord::STATUS_PENDING, SiwesRecord::STATUS_ACTIVE,
                SiwesRecord::STATUS_COMPLETED, SiwesRecord::STATUS_TERMINATED,
            ])],
        ]);

        $old = $siwesRecord->only(['status']);
        $siwesRecord->update(['status' => $validated['status']]);

        $audit->log('siwes.status.change', $siwesRecord, $old, $siwesRecord->only(['status']));

        return $this->success(new SiwesRecordResource($siwesRecord->fresh(self::WITH)), 'Status updated.');
    }

    public function assess(SiwesAssessmentRequest $request, SiwesRecord $siwesRecord, AuditLogger $audit)
    {
        $old = $siwesRecord->only(['assessment_score', 'assessment_remark']);

        $siwesRecord->update([
            'assessment_score' => $request->validated('assessment_score'),
            'assessment_remark' => $request->validated('assessment_remark'),
            'assessed_by' => Auth::id(),
            'assessed_at' => now(),
        ]);

        $audit->log('siwes.assess', $siwesRecord, $old, $siwesRecord->only(['assessment_score', 'assessment_remark']));

        return $this->success(new SiwesRecordResource($siwesRecord->fresh(self::WITH)), 'Assessment recorded.');
    }
}
