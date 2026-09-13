<?php

namespace App\Http\Controllers\Api\V1\Hod;

use App\Http\Controllers\Api\V1\Hod\Concerns\ResolvesHodDepartment;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseOffering;
use App\Models\CourseRegistration;
use App\Models\Result;
use App\Models\Student;
use Illuminate\Http\Request;

/**
 * HOD Portal (Phase 9) — department overview + the "what needs my
 * attention" summary called for by the spec's §17/§38 HOD dashboard
 * (department students, staff, pending registration, pending results).
 * Every count here is scoped to the HOD's own department, resolved via
 * ResolvesHodDepartment — nothing here is institution-wide.
 */
class HodDashboardController extends Controller
{
    use ApiResponse, ResolvesHodDepartment;

    public function index(Request $request)
    {
        $department = $this->resolveHodDepartment($request, $error);
        if (! $department) {
            return $error;
        }

        $programmeIds = $department->programmes()->pluck('id');

        $studentCount = Student::whereIn('programme_id', $programmeIds)
            ->where('status', Student::STATUS_ACTIVE)
            ->count();

        $staffCount = CourseOffering::whereIn('programme_id', $programmeIds)
            ->whereNotNull('lecturer_id')
            ->distinct('lecturer_id')
            ->count('lecturer_id');

        $pendingRegistrations = CourseRegistration::whereHas(
            'student',
            fn ($q) => $q->whereIn('programme_id', $programmeIds)
        )->where('status', CourseRegistration::STATUS_SUBMITTED)->count();

        $pendingResults = Result::whereHas(
            'courseOffering',
            fn ($q) => $q->whereIn('programme_id', $programmeIds)
        )->where('status', Result::STATUS_SUBMITTED)->count();

        return $this->success([
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
                'school' => $department->school?->name,
            ],
            'students' => $studentCount,
            'staff' => $staffCount,
            'pending_registrations' => $pendingRegistrations,
            'pending_results' => $pendingResults,
        ]);
    }
}
