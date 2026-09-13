<?php

namespace App\Http\Controllers\Api\V1\Hod;

use App\Http\Controllers\Api\V1\Hod\Concerns\ResolvesHodDepartment;
use App\Http\Controllers\Controller;
use App\Http\Resources\CourseOfferingResource;
use App\Http\Responses\ApiResponse;
use App\Models\CourseOffering;
use Illuminate\Http\Request;

/**
 * HOD Portal — the department's programmes and course offerings (§17).
 * Read-only: creating/editing programmes/courses/offerings stays under
 * the Academic Structure endpoints (`academic_structure.manage` /
 * `courses.*`) — an HOD isn't given write authority over the academic
 * catalogue itself, only over registration/result decisions within it.
 */
class HodAcademicController extends Controller
{
    use ApiResponse, ResolvesHodDepartment;

    public function programmes(Request $request)
    {
        $department = $this->resolveHodDepartment($request, $error);
        if (! $department) {
            return $error;
        }

        return $this->success(
            $department->programmes()->orderBy('name')->get(['id', 'name', 'award_type', 'duration_levels', 'is_active'])
        );
    }

    public function courseOfferings(Request $request)
    {
        $department = $this->resolveHodDepartment($request, $error);
        if (! $department) {
            return $error;
        }

        $programmeIds = $department->programmes()->pluck('id');

        $offerings = CourseOffering::with(['course', 'level', 'programme', 'semester', 'academicSession', 'lecturer'])
            ->whereIn('programme_id', $programmeIds)
            ->when($request->filled('academic_session_id'), fn ($q) => $q->where('academic_session_id', $request->input('academic_session_id')))
            ->when($request->filled('semester_id'), fn ($q) => $q->where('semester_id', $request->input('semester_id')))
            ->orderBy('id')
            ->paginate($request->integer('per_page', 25));

        return $this->success(CourseOfferingResource::collection($offerings));
    }
}
