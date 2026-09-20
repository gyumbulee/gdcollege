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
    | A SAMPLE/DEMO amount only — no fee has been confirmed by Bursary.
    | Stored in Naira (decimal), same convention as fee_structures/invoices
    | elsewhere in the platform — NOT kobo. ₦2,000.00 lets the full
    | pay -> submit workflow be demoed end-to-end against the 'test'
    | payment gateway (see config/payments.php) without a live processor.
    | Replace ADMISSIONS_APPLICATION_FEE_AMOUNT the moment Bursary
    | confirms the real figure — do not treat this number as official.
    | Set the env var to empty/0 (or flip the flag below to false) to go
    | back to "no fee required" if the institution decides not to charge
    | one.
    |
    */
    'application_fee_amount' => (float) env('ADMISSIONS_APPLICATION_FEE_AMOUNT', 2000), // Naira (sample)
    'application_fee_required_before_submission' => env('ADMISSIONS_APPLICATION_FEE_REQUIRED', true),

];
