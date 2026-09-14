<?php

namespace App\Http\Controllers\Api\V1\Documents;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\IssuedDocument;

/**
 * §22: "Public verification: /verify/{verificationCode}. Do not expose
 * private files publicly." Looks up by verification_code (never
 * document_number — see that column's migration comment) and returns
 * only IssuedDocument::toPublicArray(), never the full `content`
 * snapshot.
 */
class PublicDocumentVerificationController extends Controller
{
    use ApiResponse;

    public function show(string $code)
    {
        $document = IssuedDocument::where('verification_code', strtoupper($code))->first();

        if (! $document) {
            return $this->fail('No document found for this verification code.', [], 404);
        }

        return $this->success($document->toPublicArray());
    }
}
