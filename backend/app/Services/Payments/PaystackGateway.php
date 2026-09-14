<?php

namespace App\Services\Payments;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

/**
 * Real driver against Paystack's Transactions API. Untested in this
 * sandbox (no outbound network access to api.paystack.co here — see
 * docs/PROJECT_STATUS.md) but written against Paystack's documented
 * request/response shapes, not a stub: confirm against a live secret key
 * before production use, the same as any third-party integration would
 * need before going live regardless of who wrote it.
 */
class PaystackGateway implements PaymentGatewayContract
{
    private function client()
    {
        return Http::withToken(config('payments.gateways.paystack.secret_key'))
            ->baseUrl(config('payments.gateways.paystack.base_url'));
    }

    public function initialize(Payment $payment): array
    {
        $response = $this->client()->post('/transaction/initialize', [
            'email' => $payment->student->user->email,
            'amount' => (int) round(((float) $payment->amount) * 100), // Paystack expects kobo
            'reference' => $payment->reference,
        ])->throw()->json();

        return [
            'authorization_url' => $response['data']['authorization_url'] ?? null,
            'gateway_reference' => $response['data']['reference'] ?? $payment->reference,
        ];
    }

    public function verify(string $reference): PaymentVerificationResult
    {
        $response = $this->client()->get("/transaction/verify/{$reference}")->throw()->json();
        $data = $response['data'] ?? [];

        return new PaymentVerificationResult(
            successful: ($data['status'] ?? null) === 'success',
            gatewayReference: $data['reference'] ?? $reference,
            amount: isset($data['amount']) ? $data['amount'] / 100 : null,
            raw: $response,
        );
    }

    public function verifyWebhookSignature(Request $request): bool
    {
        $expected = hash_hmac('sha512', $request->getContent(), (string) config('payments.gateways.paystack.secret_key'));

        return hash_equals($expected, (string) $request->header('x-paystack-signature'));
    }
}
