<?php

namespace App\Http\Controllers\Api\V1\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\CourseRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Course::with('courseType');

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(fn ($q) => $q->where('code', 'like', "%{$term}%")->orWhere('title', 'like', "%{$term}%"));
        }

        return $this->success($query->orderBy('code')->paginate($request->integer('per_page', 25)));
    }

    public function store(CourseRequest $request)
    {
        $course = DB::transaction(function () use ($request) {
            $course = Course::create($request->safe()->except('prerequisite_course_ids'));

            if ($request->filled('prerequisite_course_ids')) {
                $course->prerequisites()->sync($request->input('prerequisite_course_ids'));
            }

            return $course;
        });

        return $this->success($course->load('prerequisites'), 'Course created.', 201);
    }

    public function show(Course $course)
    {
        return $this->success($course->load(['courseType', 'prerequisites', 'requiredFor']));
    }

    public function update(CourseRequest $request, Course $course)
    {
        DB::transaction(function () use ($request, $course) {
            $course->update($request->safe()->except('prerequisite_course_ids'));

            if ($request->has('prerequisite_course_ids')) {
                $course->prerequisites()->sync($request->input('prerequisite_course_ids', []));
            }
        });

        return $this->success($course->fresh(['courseType', 'prerequisites']), 'Course updated.');
    }

    public function destroy(Course $course)
    {
        $course->delete();

        return $this->success([], 'Course deleted.');
    }
}
