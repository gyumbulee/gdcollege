<?php

namespace App\Http\Controllers\Api\V1\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\SemesterRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SemesterController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Semester::with('academicSession');

        if ($request->filled('academic_session_id')) {
            $query->where('academic_session_id', $request->integer('academic_session_id'));
        }

        return $this->success($query->orderBy('sort_order')->get());
    }

    public function store(SemesterRequest $request)
    {
        $semester = $this->saveWithSingleCurrent($request->validated());

        return $this->success($semester, 'Semester created.', 201);
    }

    public function show(Semester $semester)
    {
        return $this->success($semester->load('academicSession'));
    }

    public function update(SemesterRequest $request, Semester $semester)
    {
        $semester = $this->saveWithSingleCurrent($request->validated(), $semester);

        return $this->success($semester, 'Semester updated.');
    }

    public function destroy(Semester $semester)
    {
        $semester->delete();

        return $this->success([], 'Semester deleted.');
    }

    /** Same single-current-per-session rule as AcademicSessionController. */
    private function saveWithSingleCurrent(array $data, ?Semester $semester = null): Semester
    {
        return DB::transaction(function () use ($data, $semester) {
            if (! empty($data['is_current'])) {
                Semester::where('academic_session_id', $data['academic_session_id'])
                    ->where('is_current', true)
                    ->update(['is_current' => false]);
            }

            if ($semester) {
                $semester->update($data);

                return $semester;
            }

            return Semester::create($data);
        });
    }
}
