<?php

namespace App\Http\Controllers\Api\V1\Registry;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\ClearanceRequest;
use App\Models\DocumentRequest;
use App\Models\Student;

/**
 * Kept intentionally lightweight, same as HodDashboardController/
 * FinancialReportController — a "what needs attention" summary, not a
 * report-builder (that's Phase 20).
 */
class RegistrarController extends Controller
{
    use ApiResponse;

    public function dashboard()
    {
        return $this->success([
            'active_students' => Student::where('status', Student::STATUS_ACTIVE)->count(),
            'pending_document_requests' => DocumentRequest::whereIn('status', [
                DocumentRequest::STATUS_REQUESTED, DocumentRequest::STATUS_PROCESSING,
            ])->count(),
            'ready_document_requests' => DocumentRequest::where('status', DocumentRequest::STATUS_READY)->count(),
            'clearance_in_progress' => ClearanceRequest::whereIn('status', [
                ClearanceRequest::STATUS_PENDING, ClearanceRequest::STATUS_IN_PROGRESS,
            ])->count(),
            'clearance_completed' => ClearanceRequest::where('status', ClearanceRequest::STATUS_COMPLETED)->count(),
            'students_by_status' => Student::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
        ]);
    }
}
