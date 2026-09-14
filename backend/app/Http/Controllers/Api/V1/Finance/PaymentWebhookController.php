<?php

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\PaymentVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * §21: "Callbacks/webhooks must be idempotent." This endpoint is
 * deliberately thin — it only (1) checks the calling gateway's signature,
 * (2) pulls out a reference, and (3) hands off to
 * PaymentVerificationService, which independently re-verifies against
 * the gateway's own API rather than trusting this payload's contents.
 * That re-verification is what makes replays/spoofed bodies harmless
 * even if a signature were somehow forged — belt and suspenders.
 */
class PaymentWebhookController extends Controller
{
    use ApiResponse;

    public function handle(string $gateway, Request $request, PaymentGatewayManager $gateways, PaymentVerificationService $verification)
    {
        $driver = $gateways->driver($gateway);

        if (! $driver->verifyWebhookSignature($request)) {
            Log::warning('payments.webhook.invalid_signature', ['gateway' => $gateway]);

            return $this->fail('Invalid webhook signature.', [], 401);
        }

        $reference = $request->input('reference')
            ?? $request->input('data.reference')
            ?? $request->input('tx_ref')
            ?? $request->input('data.tx_ref');

        if (! $reference) {
            return $this->fail('Webhook payload did not include a recognizable reference.', [], 422);
        }

        try {
            $payment = $verification->verifyAndApply($reference);
        } catch (RuntimeException $e) {
            Log::warning('payments.webhook.unresolved_reference', ['gateway' => $gateway, 'reference' => $reference, 'error' => $e->getMessage()]);

            // Still 200: a webhook retry storm from the gateway for a
            // reference we'll never recognize should not be treated as
            // "our endpoint is broken" by the gateway's retry logic.
            return $this->success(null, 'Acknowledged.');
        }

        return $this->success(['status' => $payment->status], 'Webhook processed.');
    }
}
