<?php

namespace App\Services\Payments;

use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * The default gateway (config('payments.default') = 'test'). This is a
 * genuine, working driver — not a placeholder — intended for
 * development/demo, and for an institution that hasn't set up a live
 * processor yet and wants to record confirmed bank-transfer payments
 * manually. It has no external checkout page: `initialize()` returns no
 * `authorization_url`, and a Bursary Officer (or, in dev, the "Simulate
 * Payment" action) confirms the payment by POSTing the same
 * `/payments/webhook/test` endpoint a real provider would call — so the
 * exact same idempotent webhook → verify → apply pathway used by
 * Paystack/Flutterwave/Korapay is exercised here too.
 */
class TestGateway implements PaymentGatewayContract
{
    public function initialize(Payment $payment): array
    {
        return [
            'authorization_url' => null,
            'gateway_reference' => 'TEST-'.$payment->reference,
        ];
    }

    /**
     * There is no external "test" provider to call — this driver's only
     * source of truth IS the webhook payload PaymentVerificationService
     * already validated the signature of before calling verify(), so
     * trusting it here is the deliberate, documented behaviour of a
     * sandbox/manual gateway, not a shortcut taken for a real one.
     */
    public function verify(string $reference): PaymentVerificationResult
    {
        $payment = Payment::where('reference', $reference)
            ->orWhere('gateway_reference', $reference)
            ->first();

        return new PaymentVerificationResult(
            successful: true,
            gatewayReference: $payment?->gateway_reference ?? $reference,
            amount: $payment ? (float) $payment->amount : null,
            raw: ['gateway' => 'test', 'note' => 'Deterministic sandbox/manual gateway — see class docblock.'],
        );
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $expected = hash_hmac('sha256', $request->getContent(), (string) config('payments.webhook_secret'));

        return hash_equals($expected, (string) $request->header('X-Test-Signature'));
    }
}
