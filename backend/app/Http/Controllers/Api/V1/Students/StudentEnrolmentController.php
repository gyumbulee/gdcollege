<?php

namespace App\Http\Controllers\Api\V1\Students;

use App\Http\Controllers\Controller;
use App\Http\Requests\Students\EnrolStudentRequest;
use App\Http\Resources\StudentResource;
use App\Http\Responses\ApiResponse;
use App\Models\Student;
use App\Models\StudentEnrolment;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\DB;

class StudentEnrolmentController extends Controller
{
    use ApiResponse;

    /**
     * Creates a new session enrolment for a student — e.g. progressing
     * from ND I (2025/2026) to ND II (2026/2027). Never overwrites a
     * prior session's row (unique constraint is one row per
     * student+session; progressing to a NEW session always adds a row).
     * Also advances `students.current_level_id` so quick lookups don't
     * need to derive it from the enrolment history every time.
     */
    public function store(EnrolStudentRequest $request, Student $student, AuditLogger $audit)
    {
        $programmeId = $request->input('programme_id', $student->programme_id);

        $enrolment = DB::transaction(function () use ($request, $student, $programmeId) {
            $enrolment = StudentEnrolment::create([
                'student_id' => $student->id,
                'academic_session_id' => $request->input('academic_session_id'),
                'programme_id' => $programmeId,
                'level_id' => $request->input('level_id'),
                'status' => StudentEnrolment::STATUS_ACTIVE,
            ]);

            $student->update(['current_level_id' => $request->input('level_id')]);

            return $enrolment;
        });

        $audit->log('student.enrolled', $enrolment);

        return $this->success(
            new StudentResource($student->fresh(['enrolments.academicSession', 'enrolments.level', 'enrolments.programme', 'currentLevel'])),
            'Enrolment recorded.',
            201
        );
    }
}
