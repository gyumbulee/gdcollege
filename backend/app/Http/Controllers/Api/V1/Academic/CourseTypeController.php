<?php

namespace App\Http\Controllers\Api\V1\Academic;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseType;
use Illuminate\Http\Request;

class CourseTypeController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(CourseType::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate(['name' => ['required', 'string', 'max:100', 'unique:course_types,name']]);
        $type = CourseType::create($data);

        return $this->success($type, 'Course type created.', 201);
    }

    public function destroy(CourseType $courseType)
    {
        $courseType->delete();

        return $this->success([], 'Course type deleted.');
    }
}
