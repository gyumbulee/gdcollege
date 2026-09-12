<?php

namespace App\Http\Controllers\Api\V1\Students;

use App\Http\Controllers\Controller;
use App\Http\Requests\Students\UpdateStudentStatusRequest;
use App\Http\Resources\StudentResource;
use App\Http\Responses\ApiResponse;
use App\Models\Student;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    use ApiResponse;

    private const WITH = ['user', 'programme.department.school', 'currentLevel', 'admissionSession'];
    private const WITH_FULL = [...self::WITH, 'enrolments.academicSession', 'enrolments.level', 'enrolments.programme', 'programmeHistories.fromProgramme', 'programmeHistories.toProgramme'];

    /**
     * Search covers name, matric number, phone, and email per the spec's
     * global-search example (§31) — programme/department filters are
     * separate query params rather than folded into free-text search.
     */
    public function index(Request $request)
    {
        $query = Student::with(self::WITH);

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($q) use ($term) {
                $q->where('matric_number', 'like', "%{$term}%")
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$term}%")
                        ->orWhere('email', 'like', "%{$term}%")
                        ->orWhere('phone', 'like', "%{$term}%"));
            });
        }

        foreach (['programme_id', 'status'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        return $this->success(StudentResource::collection(
            $query->orderBy('matric_number')->paginate($request->integer('per_page', 25))
        ));
    }

    public function show(Student $student)
    {
        return $this->success(new StudentResource($student->load(self::WITH_FULL)));
    }

    /**
     * Every status change is authorized (students.status.change permission,
     * enforced at the route level) and audited — never a silent update.
     */
    public function updateStatus(UpdateStudentStatusRequest $request, Student $student, AuditLogger $audit)
    {
        $old = $student->status;
        $student->update(['status' => $request->string('status')]);

        $audit->log(
            'student.status.changed',
            $student,
            ['status' => $old],
            ['status' => $request->input('status'), 'reason' => $request->input('reason')]
        );

        return $this->success(new StudentResource($student->fresh(self::WITH)), 'Student status updated.');
    }

    /** GET /student/me — matches the spec's own API example (§33). */
    public function me(Request $request)
    {
        $student = $request->user()->student()->with(self::WITH_FULL)->first();

        if (! $student) {
            return $this->fail('No student record found for this account.', [], 404);
        }

        return $this->success(new StudentResource($student));
    }
}
