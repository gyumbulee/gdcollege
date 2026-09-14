<?php

namespace App\Services\Payments;

use App\Models\Payment;
use Illuminate\Http\Request;

interface PaymentGatewayContract
{
    /**
     * Start a payment attempt with the provider. Returns whatever the
     * frontend needs to hand off to the gateway (e.g. an authorization
     * URL to redirect to) — never a "success" of any kind; initializing
     * a payment is not the same as it having been paid.
     *
     * @return array{authorization_url: ?string, gateway_reference: ?string}
     */
    public function initialize(Payment $payment): array;

    /**
     * Server-side verification against the provider's own API — the ONLY
     * thing allowed to mark a payment SUCCESSFUL (§21: "Never trust the
     * frontend payment response as final proof of payment").
     */
    public function verify(string $reference): PaymentVerificationResult;

    /**
     * Validate that an incoming webhook request really came from this
     * provider, using whatever scheme that provider uses (HMAC signature
     * header, static verif-hash, etc.) — checked BEFORE the payload is
     * trusted enough to even look up a reference.
     */
    public function verifyWebhookSignature(Request $request): bool;
}
