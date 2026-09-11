<?php

namespace App\Http\Controllers\Api\V1\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\ProgrammeRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Programme;
use Illuminate\Http\Request;

class ProgrammeController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Programme::with('department.school');

        if ($request->filled('department_id')) {
            $query->where('department_id', $request->integer('department_id'));
        }

        if ($request->boolean('active_only')) {
            $query->where('is_active', true);
        }

        return $this->success($query->orderBy('name')->get());
    }

    public function store(ProgrammeRequest $request)
    {
        $programme = Programme::create($request->validated());

        return $this->success($programme, 'Programme created.', 201);
    }

    public function show(Programme $programme)
    {
        return $this->success($programme->load('department.school'));
    }

    public function update(ProgrammeRequest $request, Programme $programme)
    {
        $programme->update($request->validated());

        return $this->success($programme, 'Programme updated.');
    }

    public function destroy(Programme $programme)
    {
        $programme->delete();

        return $this->success([], 'Programme deleted.');
    }
}
