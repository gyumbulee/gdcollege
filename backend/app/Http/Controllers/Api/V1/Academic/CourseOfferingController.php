<?php

namespace App\Http\Controllers\Api\V1\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\CourseOfferingRequest;
use App\Http\Responses\ApiResponse;
use App\Models\CourseOffering;
use Illuminate\Http\Request;

class CourseOfferingController extends Controller
{
    use ApiResponse;

    /** Common relations every offering listing needs, kept in one place. */
    private const WITH = ['course', 'academicSession', 'semester', 'programme', 'level', 'lecturer'];

    public function index(Request $request)
    {
        $query = CourseOffering::with(self::WITH);

        foreach (['academic_session_id', 'semester_id', 'programme_id', 'level_id', 'lecturer_id'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->integer($filter));
            }
        }

        return $this->success($query->orderBy('id', 'desc')->get());
    }

    public function store(CourseOfferingRequest $request)
    {
        $offering = CourseOffering::create($request->validated());

        return $this->success($offering->load(self::WITH), 'Course offering created.', 201);
    }

    public function show(CourseOffering $courseOffering)
    {
        return $this->success($courseOffering->load(self::WITH));
    }

    public function update(CourseOfferingRequest $request, CourseOffering $courseOffering)
    {
        $courseOffering->update($request->validated());

        return $this->success($courseOffering->load(self::WITH), 'Course offering updated.');
    }

    public function destroy(CourseOffering $courseOffering)
    {
        $courseOffering->delete();

        return $this->success([], 'Course offering deleted.');
    }
}
