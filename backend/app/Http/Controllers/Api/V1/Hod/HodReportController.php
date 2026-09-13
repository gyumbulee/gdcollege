<?php

namespace App\Http\Controllers\Api\V1\Hod;

use App\Http\Controllers\Api\V1\Hod\Concerns\ResolvesHodDepartment;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseRegistration;
use App\Models\Result;
use App\Models\Student;
use Illuminate\Http\Request;

/**
 * HOD Portal — department reports (§17). Kept intentionally simple
 * (status-breakdown counts, not a report-builder) — a fuller reporting
 * surface belongs to Phase 20 (Management Dashboard & Reporting), which
 * spans the whole institution rather than one department.
 */
class HodReportController extends Controller
{
    use ApiResponse, ResolvesHodDepartment;

    public function index(Request $request)
    {
        $department = $this->resolveHodDepartment($request, $error);
        if (! $department) {
            return $error;
        }

        $programmeIds = $department->programmes()->pluck('id');

        $studentsByStatus = Student::whereIn('programme_id', $programmeIds)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $registrationsByStatus = CourseRegistration::whereHas(
            'student',
            fn ($q) => $q->whereIn('programme_id', $programmeIds)
        )->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $resultsByStatus = Result::whereHas(
            'courseOffering',
            fn ($q) => $q->whereIn('programme_id', $programmeIds)
        )->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        return $this->success([
            'department' => ['id' => $department->id, 'name' => $department->name],
            'students_by_status' => $studentsByStatus,
            'registrations_by_status' => $registrationsByStatus,
            'results_by_status' => $resultsByStatus,
        ]);
    }
}
