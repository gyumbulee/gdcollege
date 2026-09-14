<?php

namespace App\Services\Payments;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

/**
 * Real driver against Flutterwave's v3 Payments API. Untested in this
 * sandbox (no outbound network access to api.flutterwave.com here — see
 * docs/PROJECT_STATUS.md) but written against Flutterwave's documented
 * request/response shapes: confirm against a live secret key before
 * production use.
 */
class FlutterwaveGateway implements PaymentGatewayContract
{
    private function client()
    {
        return Http::withToken(config('payments.gateways.flutterwave.secret_key'))
            ->baseUrl(config('payments.gateways.flutterwave.base_url'));
    }

    public function initialize(Payment $payment): array
    {
        $response = $this->client()->post('/payments', [
            'tx_ref' => $payment->reference,
            'amount' => (string) $payment->amount,
            'currency' => 'NGN',
            'customer' => ['email' => $payment->student->user->email],
        ])->throw()->json();

        return [
            'authorization_url' => $response['data']['link'] ?? null,
            'gateway_reference' => $payment->reference,
        ];
    }

    public function verify(string $reference): PaymentVerificationResult
    {
        $response = $this->client()
            ->get('/transactions/verify_by_reference', ['tx_ref' => $reference])
            ->throw()->json();
        $data = $response['data'] ?? [];

        return new PaymentVerificationResult(
            successful: ($data['status'] ?? null) === 'successful',
            gatewayReference: isset($data['id']) ? (string) $data['id'] : $reference,
            amount: $data['amount'] ?? null,
            raw: $response,
        );
    }

    /**
     * Flutterwave signs webhooks with a static secret hash (configured
     * in their dashboard) sent verbatim in the `verif-hash` header — not
     * an HMAC of the body, unlike Paystack.
     */
    public function verifyWebhookSignature(Request $request): bool
    {
        $expected = (string) config('payments.gateways.flutterwave.webhook_hash');

        return $expected !== '' && hash_equals($expected, (string) $request->header('verif-hash'));
    }
}
