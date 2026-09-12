<?php

namespace App\Services;

use App\Models\CourseOffering;
use App\Models\CourseRegistration;
use App\Models\Semester;
use App\Models\Student;
use Illuminate\Support\Collection;

/**
 * Validates a proposed set of course-offering IDs for a student's
 * registration. Every rule the spec calls for (§11) is checked here, in
 * one place, so both "save draft" and "submit" go through the identical
 * logic — no route can bypass a rule another route enforces.
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

        // Prerequisites. See config('course_registration.prerequisite_check')
        // for why this checks "previously registered", not "passed" —
        // Results (Phase 8) doesn't exist yet.
        $previouslyRegisteredCourseIds = $student->courseRegistrations()
            ->whereIn('status', [CourseRegistration::STATUS_APPROVED, CourseRegistration::STATUS_SUBMITTED])
            ->with('items.courseOffering')
            ->get()
            ->pluck('items')
            ->flatten()
            ->pluck('courseOffering.course_id')
            ->unique();

        foreach ($offerings as $offering) {
            $missingPrereqs = $offering->course->prerequisites->reject(
                fn ($prereq) => $previouslyRegisteredCourseIds->contains($prereq->id)
            );
            if ($missingPrereqs->isNotEmpty()) {
                $errors['prerequisites'][] = "{$offering->course->code} requires: "
                    . $missingPrereqs->pluck('code')->implode(', ') . ' first.';
            }
        }

        return $errors;
    }
}
