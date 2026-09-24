<?php

namespace App\Http\Controllers\Api\V1\Students;

use App\Http\Controllers\Controller;
use App\Http\Requests\Students\UpdateStudentStatusRequest;
use App\Http\Resources\StudentResource;
use App\Http\Responses\ApiResponse;
use App\Models\ClearanceRequest;
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
     * Phase 11: transitioning to GRADUATED additionally requires a
     * COMPLETED ClearanceRequest (§16 — graduation is gated on
     * clearance, not just an admin's say-so).
     */
    public function updateStatus(UpdateStudentStatusRequest $request, Student $student, AuditLogger $audit)
    {
        // $request->string() returns a Stringable, not a plain string —
        // comparing it with === against a string constant is always
        // false (different types). Found this while adding graduated_at
        // below: the clearance gate right here had the same bug and was
        // silently never enforced — an admin could set GRADUATED with no
        // completed clearance at all, the check just never fired.
        $newStatus = $request->input('status');

        if ($newStatus === Student::STATUS_GRADUATED) {
            $cleared = ClearanceRequest::where('student_id', $student->id)
                ->where('status', ClearanceRequest::STATUS_COMPLETED)
                ->exists();

            if (! $cleared) {
                return $this->fail('This student has no COMPLETED clearance on record — graduation requires clearance first.', [], 422);
            }
        }

        $old = $student->status;
        $student->update([
            'status' => $newStatus,
            // Set the moment this transition actually happens (not
            // backdated, not the clearance-completion date) when moving
            // TO graduated; cleared if a status is later corrected away
            // from GRADUATED, so graduated_at never lingers on a
            // student who technically isn't graduated anymore — see
            // ManagementDashboardController::graduationStats().
            'graduated_at' => match (true) {
                $newStatus === Student::STATUS_GRADUATED => now(),
                (string) $old === Student::STATUS_GRADUATED => null,
                default => $student->graduated_at,
            },
        ]);

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
