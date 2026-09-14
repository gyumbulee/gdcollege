<?php

namespace App\Http\Controllers\Api\V1\Clearance;

use App\Http\Controllers\Controller;
use App\Http\Resources\ClearanceRequestResource;
use App\Http\Responses\ApiResponse;
use App\Services\AuditLogger;
use App\Services\ClearanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class StudentClearanceController extends Controller
{
    use ApiResponse;

    public function show(Request $request)
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record is linked to this account.', [], 404);
        }

        $clearance = $student->clearanceRequests()->with('items')->latest()->first();

        return $this->success($clearance ? new ClearanceRequestResource($clearance) : null);
    }

    public function request(Request $request, ClearanceService $service, AuditLogger $audit)
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record is linked to this account.', [], 404);
        }

        $validated = $request->validate(['academic_session_id' => ['nullable', 'exists:academic_sessions,id']]);

        $clearance = $service->request($student, $validated['academic_session_id'] ?? $student->admission_academic_session_id);
        $clearance->load('items');

        $audit->log('clearance.request', $clearance);

        return $this->success(new ClearanceRequestResource($clearance), 'Clearance requested.', 201);
    }
}
