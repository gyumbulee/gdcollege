<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Credit Load Limits
    |--------------------------------------------------------------------------
    |
    | Sensible defaults only — the College should confirm its real policy
    | via Phase 21's system settings once that exists. Do not treat these
    | numbers as authoritative institutional policy.
    |
    */
    'min_credit_units' => env('REGISTRATION_MIN_CREDITS', 12),
    'max_credit_units' => env('REGISTRATION_MAX_CREDITS', 24),

    /*
    |--------------------------------------------------------------------------
    | Prerequisite Enforcement
    |--------------------------------------------------------------------------
    |
    | Phase 8 (Results) now exists, so prerequisites are checked against
    | real PUBLISHED results rather than "was this course ever
    | registered". 'registered_previously' is kept as a fallback mode —
    | useful for an environment where Results isn't populated yet — but
    | 'passed_previously' is the spec-accurate default now that pass/fail
    | data actually exists (see CourseRegistrationService).
    |
    */
    'prerequisite_check' => 'passed_previously', // or 'registered_previously' as a fallback

    /*
    |--------------------------------------------------------------------------
    | Passing Grade Point
    |--------------------------------------------------------------------------
    |
    | Used by both prerequisite satisfaction and carryover detection to
    | decide whether a PUBLISHED result counts as a pass. Not a fabricated
    | policy: it matches the seeded grading scale's own convention
    | (ResultConfigSeeder — F = 0.00 grade points) and the spec's §14
    | quality-points formula, where a non-passing grade contributes no
    | quality points. Adjust here if the institution's real grading scale
    | uses a different passing threshold.
    |
    */
    'passing_grade_point' => (float) env('REGISTRATION_PASSING_GRADE_POINT', 0.0),

    /*
    |--------------------------------------------------------------------------
    | Late Registration
    |--------------------------------------------------------------------------
    |
    | No late fee is enforced (Finance doesn't exist yet — Phase 9/12/13).
    | This only controls whether registration is blocked outright once a
    | semester's registration_closes_at has passed.
    |
    */
    'allow_registration_after_close' => false,

];
