<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Matric Number Format
    |--------------------------------------------------------------------------
    |
    | {session} = the admitting session's digits only (e.g. "2026/2027" ->
    | "20262027"), {seq} = zero-padded sequence number. Change once the
    | College confirms its real format — do not hardcode a format
    | assumption anywhere else (see Master Implementation Brief §36).
    |
    */
    'matric_number_format' => env('STUDENTS_MATRIC_NUMBER_FORMAT', 'GDCW/{session}/{seq}'),
    'matric_number_sequence_padding' => 5,

];
