<?php

namespace App\Services;

use App\Models\CourseOffering;
use App\Models\CourseRegistration;
use App\Models\Result;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Support\Collection;

/**
 * Validates a proposed set of course-offering IDs for a student's
 * registration. Every rule the spec calls for (§11) is checked here, in
 * one place, so both "save draft" and "submit" go through the identical
 * logic — no route can bypass a rule another route enforces.
 *
 * Also owns carryover detection (isCarryover()) for the same reason —
 * one source of truth for "has this student really failed this course
 * before", read from Phase 8's Result data rather than duplicated ad hoc
 * in a controller.
 */
class CourseRegistrationService
{
    /** @return array<string, string[]> empty if fully valid */
    public function validate(Student $student, Semester $semester, Collection $offerings): array
    {
        $errors = [];

        if ($offerings->isEmpty()) {
            $errors['course_offering_ids'] = ['Select at least one course.'];
        }

        // Duplicate prevention: the DB unique constraint backs this up,
        // but checking here gives a clear message instead of a 500.
        if ($offerings->pluck('id')->unique()->count() !== $offerings->count()) {
            $errors['course_offering_ids'][] = 'The same course was selected more than once.';
        }

        // Programme match — an offering must belong to the student's own
        // programme. Level may differ (that's what makes it a carryover).
        $wrongProgramme = $offerings->first(fn (CourseOffering $o) => $o->programme_id !== $student->programme_id);
        if ($wrongProgramme) {
            $errors['course_offering_ids'][] = "{$wrongProgramme->course->code} does not belong to your programme.";
        }

        // Credit load.
        $totalCredits = $offerings->sum(fn (CourseOffering $o) => $o->course->credit_units);
        $min = config('course_registration.min_credit_units');
        $max = config('course_registration.max_credit_units');
        if ($totalCredits < $min) {
            $errors['credits'] = ["Total credit units ({$totalCredits}) is below the minimum of {$min}."];
        } elseif ($totalCredits > $max) {
            $errors['credits'] = ["Total credit units ({$totalCredits}) exceeds the maximum of {$max}."];
        }

        // Registration window.
        $now = now();
        if ($semester->registration_opens_at && $now->lt($semester->registration_opens_at)) {
            $errors['window'] = ['Registration has not opened for this semester yet.'];
        }
        if (
            $semester->registration_closes_at
            && $now->gt($semester->registration_closes_at)
            && ! config('course_registration.allow_registration_after_close')
        ) {
            $errors['window'] = ['Registration has closed for this semester.'];
        }

        // Prerequisites — see config('course_registration.prerequisite_check').
        $satisfiedCourseIds = config('course_registration.prerequisite_check') === 'passed_previously'
            ? $this->passedCourseIds($student)
            : $this->previouslyRegisteredCourseIds($student);

        foreach ($offerings as $offering) {
            $missingPrereqs = $offering->course->prerequisites->reject(
                fn ($prereq) => $satisfiedCourseIds->contains($prereq->id)
            );
            if ($missingPrereqs->isNotEmpty()) {
                $errors['prerequisites'][] = "{$offering->course->code} requires: "
                    . $missingPrereqs->pluck('code')->implode(', ') . ' first.';
            }
        }

        return $errors;
    }

    /**
     * Course IDs the student has a real, PUBLISHED, passing result for
     * (§12: only published results count — they're the locked, final
     * state). This is the spec-accurate prerequisite/carryover check now
     * that Phase 8 exists, replacing the old "was it ever registered"
     * proxy.
     */
    private function passedCourseIds(Student $student): Collection
    {
        return Result::where('student_id', $student->id)
            ->where('status', Result::STATUS_PUBLISHED)
            ->where('grade_point', '>', config('course_registration.passing_grade_point'))
            ->with('courseOffering:id,course_id')
            ->get()
            ->pluck('courseOffering.course_id')
            ->unique();
    }

    /** Legacy fallback — see the 'registered_previously' config option. */
    private function previouslyRegisteredCourseIds(Student $student): Collection
    {
        return $student->courseRegistrations()
            ->whereIn('status', [CourseRegistration::STATUS_APPROVED, CourseRegistration::STATUS_SUBMITTED])
            ->with('items.courseOffering')
            ->get()
            ->pluck('items')
            ->flatten()
            ->pluck('courseOffering.course_id')
            ->unique();
    }

    /**
     * True carryover (§11/§36): the student previously sat this exact
     * course and has a PUBLISHED, non-passing result for it — not the
     * Phase 7 proxy of "this offering's level differs from the student's
     * current level" (which produced false positives/negatives whenever
     * a student's level and their carryover course's level happened to
     * coincide, or a genuinely new elective was offered at another level).
     */
    public function isCarryover(Student $student, CourseOffering $offering): bool
    {
        return Result::where('student_id', $student->id)
            ->where('status', Result::STATUS_PUBLISHED)
            ->where('grade_point', '<=', config('course_registration.passing_grade_point'))
            ->whereHas('courseOffering', fn ($q) => $q->where('course_id', $offering->course_id))
            ->exists();
    }
}
