<?php

namespace App\Services;

use App\Models\AcademicSession;
use App\Models\MatricNumberCounter;
use Illuminate\Support\Facades\DB;

class MatricNumberGenerator
{
    public function generate(AcademicSession $session): string
    {
        return DB::transaction(function () use ($session) {
            $counter = MatricNumberCounter::lockForUpdate()
                ->firstOrCreate(['academic_session_id' => $session->id], ['next_sequence' => 1]);

            $sequence = $counter->next_sequence;
            $counter->increment('next_sequence');

            $padding = config('students.matric_number_sequence_padding', 5);
            $sessionDigits = preg_replace('/\D/', '', $session->name);

            return str_replace(
                ['{session}', '{seq}'],
                [$sessionDigits, str_pad((string) $sequence, $padding, '0', STR_PAD_LEFT)],
                config('students.matric_number_format', 'GDCW/{session}/{seq}')
            );
        });
    }
}
