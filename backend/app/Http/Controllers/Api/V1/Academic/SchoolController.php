<?php

namespace App\Http\Controllers\Api\V1\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\SchoolRequest;
use App\Http\Responses\ApiResponse;
use App\Models\School;

class SchoolController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(School::withCount('departments')->orderBy('name')->get());
    }

    public function store(SchoolRequest $request)
    {
        $school = School::create($request->validated());

        return $this->success($school, 'School created.', 201);
    }

    public function show(School $school)
    {
        return $this->success($school->load('departments'));
    }

    public function update(SchoolRequest $request, School $school)
    {
        $school->update($request->validated());

        return $this->success($school, 'School updated.');
    }

    public function destroy(School $school)
    {
        $school->delete();

        return $this->success([], 'School deleted.');
    }
}
