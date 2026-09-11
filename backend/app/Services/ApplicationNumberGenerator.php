<?php

namespace App\Services;

use App\Models\AcademicSession;
use App\Models\ApplicationNumberCounter;
use Illuminate\Support\Facades\DB;

/**
 * Generates application numbers using a locked per-session counter row, so
 * two simultaneous submissions in the same session never get the same
 * number — the same concurrency-safety the spec asks for with
 * matriculation numbers (§36). Format is configurable via
 * config/admissions.php, not hardcoded.
 */
class ApplicationNumberGenerator
{
    public function generate(AcademicSession $session): string
    {
        return DB::transaction(function () use ($session) {
            $counter = ApplicationNumberCounter::lockForUpdate()
                ->firstOrCreate(['academic_session_id' => $session->id], ['next_sequence' => 1]);

            $sequence = $counter->next_sequence;
            $counter->increment('next_sequence');

            $padding = config('admissions.application_number_sequence_padding', 6);
            $sessionDigits = preg_replace('/\D/', '', $session->name);

            return str_replace(
                ['{session}', '{seq}'],
                [$sessionDigits, str_pad((string) $sequence, $padding, '0', STR_PAD_LEFT)],
                config('admissions.application_number_format', 'APP/{session}/{seq}')
            );
        });
    }
}
