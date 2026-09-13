<?php

namespace App\Http\Controllers\Api\V1\Hod;

use App\Http\Controllers\Api\V1\Hod\Concerns\ResolvesHodDepartment;
use App\Http\Controllers\Controller;
use App\Http\Resources\StudentResource;
use App\Http\Responses\ApiResponse;
use App\Models\Student;
use Illuminate\Http\Request;

/** HOD Portal — students belonging to the HOD's own department (§17). */
class HodStudentController extends Controller
{
    use ApiResponse, ResolvesHodDepartment;

    public function index(Request $request)
    {
        $department = $this->resolveHodDepartment($request, $error);
        if (! $department) {
            return $error;
        }

        $programmeIds = $department->programmes()->pluck('id');

        $students = Student::with(['user', 'programme.department.school', 'currentLevel'])
            ->whereIn('programme_id', $programmeIds)
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->input('status')))
            ->orderBy('id')
            ->paginate($request->integer('per_page', 25));

        return $this->success(StudentResource::collection($students));
    }
}
