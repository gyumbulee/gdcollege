<?php

namespace App\Services\Payments;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

/**
 * Real driver against Korapay's Checkout API. Untested in this sandbox
 * (no outbound network access to api.korapay.com here — see
 * docs/PROJECT_STATUS.md) but written against Korapay's documented
 * request/response shapes: confirm against a live secret key before
 * production use, same as any third-party integration would need.
 */
class KorapayGateway implements PaymentGatewayContract
{
    private function client()
    {
        return Http::withToken(config('payments.gateways.korapay.secret_key'))
            ->baseUrl(config('payments.gateways.korapay.base_url'));
    }

    public function initialize(Payment $payment): array
    {
        $response = $this->client()->post('/charges/initialize', [
            'amount' => (float) $payment->amount,
            'currency' => 'NGN',
            'reference' => $payment->reference,
            'customer' => [
                'name' => $payment->student->user->name,
                'email' => $payment->student->user->email,
            ],
            'notification_url' => config('payments.gateways.korapay.webhook_url'),
        ])->throw()->json();

        return [
            'authorization_url' => $response['data']['checkout_url'] ?? null,
            'gateway_reference' => $response['data']['reference'] ?? $payment->reference,
        ];
    }

    public function verify(string $reference): PaymentVerificationResult
    {
        $response = $this->client()->get("/charges/{$reference}")->throw()->json();
        $data = $response['data'] ?? [];

        return new PaymentVerificationResult(
            successful: ($data['status'] ?? null) === 'success',
            gatewayReference: $data['reference'] ?? $reference,
            amount: $data['amount'] ?? null,
            raw: $response,
        );
    }

    /**
     * Korapay signs webhooks as HMAC SHA256 of the JSON-encoded `data`
     * object (not the full raw body) using the secret key, sent in the
     * `x-korapay-signature` header.
     */
    public function verifyWebhookSignature(Request $request): bool
    {
        $data = $request->input('data', []);
        $expected = hash_hmac('sha256', json_encode($data), (string) config('payments.gateways.korapay.secret_key'));

        return hash_equals($expected, (string) $request->header('x-korapay-signature'));
    }
}
