<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Level;
use App\Models\Role;
use App\Models\Student;
use App\Models\StudentEnrolment;
use Illuminate\Support\Facades\DB;

/**
 * Converts an admitted application into a student account. Deliberately
 * idempotent (Master Implementation Brief §7, §36): repeating this call
 * for the same application must never create a second student — it just
 * returns the existing one. This is what makes it safe for a staff member
 * to double-click "Convert" or retry after a timeout.
 */
class AdmissionConversionService
{
    public function __construct(
        private readonly MatricNumberGenerator $matricNumbers,
    ) {
    }

    public function convert(Application $application): Student
    {
        return DB::transaction(function () use ($application) {
            $existing = Student::where('application_id', $application->id)->first();
            if ($existing) {
                return $existing;
            }

            if ($application->status !== Application::STATUS_ADMITTED) {
                throw new \RuntimeException('Only an ADMITTED application can be converted to a student.');
            }

            if (! $application->programme_id) {
                throw new \RuntimeException('Application has no programme selected — cannot convert.');
            }

            $user = $application->applicant->user;
            $studentRole = Role::where('slug', 'student')->firstOrFail();
            $user->roles()->syncWithoutDetaching([$studentRole->id]);

            /** Entry level = the lowest sort_order level configured (e.g. ND I). */
            $entryLevel = Level::orderBy('sort_order')->first();

            $student = Student::create([
                'user_id' => $user->id,
                'application_id' => $application->id,
                'matric_number' => $this->matricNumbers->generate($application->academicSession),
                'programme_id' => $application->programme_id,
                'current_level_id' => $entryLevel?->id,
                'admission_academic_session_id' => $application->academic_session_id,
                'status' => Student::STATUS_ACTIVE,
            ]);

            if ($entryLevel) {
                StudentEnrolment::create([
                    'student_id' => $student->id,
                    'academic_session_id' => $application->academic_session_id,
                    'programme_id' => $application->programme_id,
                    'level_id' => $entryLevel->id,
                    'status' => StudentEnrolment::STATUS_ACTIVE,
                ]);
            }

            return $student;
        });
    }
}
