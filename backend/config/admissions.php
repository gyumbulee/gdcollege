<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Number Format
    |--------------------------------------------------------------------------
    |
    | {session} is replaced with the academic session name's digits only
    | (e.g. "2026/2027" -> "20262027"), {seq} with the zero-padded sequence
    | number. Change this once the College confirms its preferred format —
    | do not hardcode a format assumption anywhere else in the codebase.
    |
    */
    'application_number_format' => env('ADMISSIONS_APPLICATION_NUMBER_FORMAT', 'APP/{session}/{seq}'),
    'application_number_sequence_padding' => 6,

    /*
    |--------------------------------------------------------------------------
    | Required Document Types
    |--------------------------------------------------------------------------
    |
    | Slugs an application must have at least one document of before it can
    | be submitted. Left deliberately minimal until the Admissions Office
    | confirms the real requirement list — see Master Implementation Brief
    | §40 ("Do not hardcode admission requirements").
    |
    */
    'required_document_types' => [
        'olevel_result',
        'passport_photo',
    ],

    'document_types' => [
        'olevel_result' => 'O\'Level Result',
        'passport_photo' => 'Passport Photograph',
        'birth_certificate' => 'Birth Certificate / Age Declaration',
        'local_government_certificate' => 'Local Government Identification',
        'other' => 'Other Supporting Document',
    ],

    'max_document_size_kb' => 2048,

    /*
    |--------------------------------------------------------------------------
    | Application Fee
    |--------------------------------------------------------------------------
    |
    | Intentionally null — no fee amount has been confirmed by Bursary.
    | Payment enforcement itself is wired in Phase 13 (Payment Gateway);
    | until then, submission does not require fee_paid=true. Do not set a
    | placeholder number here "to make the UI look complete" — null
    | correctly renders as "amount to be confirmed" in the applicant UI.
    |
    */
    'application_fee_amount' => env('ADMISSIONS_APPLICATION_FEE_AMOUNT'), // in kobo, once confirmed
    'application_fee_required_before_submission' => false,

];
