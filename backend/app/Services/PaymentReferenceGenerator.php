<?php

namespace App\Services;

use App\Models\Payment;
use Illuminate\Support\Str;

/**
 * §21: "Payment references must be unique." This is OUR reference — the
 * one the webhook handler looks payments up by — independent of whatever
 * reference format a given gateway assigns. Collision probability from
 * Str::random() alone is negligible, but the retry loop plus the table's
 * own unique constraint is the actual guarantee, not the randomness.
 */
class PaymentReferenceGenerator
{
    public function generate(): string
    {
        do {
            $reference = 'GDCW-PAY-'.strtoupper(Str::random(10));
        } while (Payment::where('reference', $reference)->exists());

        return $reference;
    }
}
