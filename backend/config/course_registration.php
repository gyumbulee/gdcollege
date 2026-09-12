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
    | Until Phase 8 (Results) exists, there's no pass/fail data to check a
    | prerequisite against — so this checks only that the prerequisite
    | course was previously REGISTERED (any status), not passed. Flip the
    | strictness here once real result data exists; do not silently treat
    | "registered" as "passed" in reporting.
    |
    */
    'prerequisite_check' => 'registered_previously', // -> 'passed_previously' once Phase 8 lands

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
