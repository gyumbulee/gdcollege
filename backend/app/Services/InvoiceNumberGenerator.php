<?php

namespace App\Services;

use App\Models\AcademicSession;
use App\Models\InvoiceNumberCounter;
use Illuminate\Support\Facades\DB;

class InvoiceNumberGenerator
{
    public function generate(AcademicSession $session): string
    {
        return DB::transaction(function () use ($session) {
            $counter = InvoiceNumberCounter::lockForUpdate()
                ->firstOrCreate(['academic_session_id' => $session->id], ['next_sequence' => 1]);

            $sequence = $counter->next_sequence;
            $counter->increment('next_sequence');

            $padding = config('payments.invoice_number_sequence_padding', 6);
            $sessionDigits = preg_replace('/\D/', '', $session->name);

            return str_replace(
                ['{session}', '{seq}'],
                [$sessionDigits, str_pad((string) $sequence, $padding, '0', STR_PAD_LEFT)],
                config('payments.invoice_number_format', 'INV/{session}/{seq}')
            );
        });
    }
}
