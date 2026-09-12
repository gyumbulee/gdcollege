<?php

namespace App\Http\Controllers\Api\V1\Results;

use App\Http\Controllers\Controller;
use App\Http\Resources\CourseOfferingResource;
use App\Http\Responses\ApiResponse;
use App\Models\CourseOffering;
use App\Models\CourseRegistration;
use Illuminate\Support\Facades\Auth;

class LecturerCourseController extends Controller
{
    use ApiResponse;

    /** The authenticated lecturer's assigned course offerings. */
    public function index()
    {
        $offerings = CourseOffering::with(['course', 'academicSession', 'semester', 'programme', 'level'])
            ->where('lecturer_id', Auth::id())
            ->orderByDesc('id')
            ->get();

        return $this->success(CourseOfferingResource::collection($offerings));
    }

    /** The roster: students with an APPROVED registration for this offering. */
    public function roster(CourseOffering $courseOffering)
    {
        $this->authorize('manageResults', $courseOffering);

        $students = CourseRegistration::query()
            ->where('status', CourseRegistration::STATUS_APPROVED)
            ->whereHas('items', fn ($q) => $q->where('course_offering_id', $courseOffering->id))
            ->with('student.user')
            ->get()
            ->pluck('student')
            ->unique('id')
            ->values();

        return $this->success($students->map(fn ($s) => [
            'id' => $s->id,
            'matric_number' => $s->matric_number,
            'name' => $s->user->name,
        ]));
    }
}
