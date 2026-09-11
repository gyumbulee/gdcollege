<?php

namespace App\Http\Controllers\Api\V1\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\DepartmentRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Department;
use Illuminate\Http\Request;

class DepartmentController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Department::with('school')->withCount('programmes');

        if ($request->filled('school_id')) {
            $query->where('school_id', $request->integer('school_id'));
        }

        return $this->success($query->orderBy('name')->get());
    }

    public function store(DepartmentRequest $request)
    {
        $department = Department::create($request->validated());

        return $this->success($department, 'Department created.', 201);
    }

    public function show(Department $department)
    {
        return $this->success($department->load(['school', 'programmes', 'hod']));
    }

    public function update(DepartmentRequest $request, Department $department)
    {
        $department->update($request->validated());

        return $this->success($department, 'Department updated.');
    }

    public function destroy(Department $department)
    {
        $department->delete();

        return $this->success([], 'Department deleted.');
    }
}
