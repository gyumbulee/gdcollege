<?php

namespace App\Services;

use App\Models\IssuedDocument;
use Illuminate\Support\Str;

/**
 * The public /verify/{code} route looks documents up by this, not by
 * document_number — deliberately a separate, longer, random value so a
 * predictable sequential document number is never itself sufficient to
 * pull up someone else's document.
 */
class VerificationCodeGenerator
{
    public function generate(): string
    {
        do {
            $code = strtoupper(Str::random(12));
        } while (IssuedDocument::where('verification_code', $code)->exists());

        return $code;
    }
}
