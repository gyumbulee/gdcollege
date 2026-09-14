<?php

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Http\Responses\ApiResponse;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\PaymentReferenceGenerator;
use App\Services\PaymentVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * A student starting/checking a payment against their own invoice.
 * `initiate()` only ever creates a PENDING payment and asks the gateway
 * for a checkout URL — it is never the thing that marks a payment paid
 * (§21). `status()` lets the frontend poll after returning from a
 * gateway's checkout page without waiting on the webhook, but even that
 * poll goes through PaymentVerificationService's real re-verification,
 * never trusting query-string params a redirect could carry.
 */
class PaymentController extends Controller
{
    use ApiResponse;

    public function initiate(Request $request, Invoice $invoice, PaymentReferenceGenerator $references, PaymentGatewayManager $gateways)
    {
        $student = Auth::user()->student;
        abort_unless($student && $invoice->student_id === $student->id, 403);

        if ($invoice->status === Invoice::STATUS_VOID) {
            return $this->fail('This invoice has been voided.', [], 422);
        }

        if ((float) $invoice->balance <= 0) {
            return $this->fail('This invoice has no outstanding balance.', [], 422);
        }

        $validated = $request->validate([
            'gateway' => ['sometimes', 'string', 'in:'.implode(',', array_keys(config('payments.gateways')))],
            'amount' => ['sometimes', 'numeric', 'min:0.01', 'max:'.(float) $invoice->balance],
        ]);

        $gatewayName = $validated['gateway'] ?? config('payments.default');
        $amount = $validated['amount'] ?? (float) $invoice->balance;

        $payment = Payment::create([
            'reference' => $references->generate(),
            'invoice_id' => $invoice->id,
            'student_id' => $student->id,
            'gateway' => $gatewayName,
            'amount' => $amount,
            'status' => Payment::STATUS_PENDING,
        ]);

        try {
            $init = $gateways->driver($gatewayName)->initialize($payment);
        } catch (\Throwable $e) {
            Log::error('payments.initialize.failed', ['payment_id' => $payment->id, 'error' => $e->getMessage()]);
            $payment->update(['status' => Payment::STATUS_FAILED]);

            return $this->fail('Could not start this payment with the selected gateway. Please try again.', [], 502);
        }

        $payment->update(['gateway_reference' => $init['gateway_reference'] ?? null]);

        return $this->success([
            'payment' => new PaymentResource($payment->fresh(['student.user', 'invoice'])),
            'authorization_url' => $init['authorization_url'],
        ], 'Payment initiated.', 201);
    }

    public function status(Payment $payment, PaymentVerificationService $verification)
    {
        $student = Auth::user()->student;
        abort_unless($student && $payment->student_id === $student->id, 403);

        try {
            $payment = $verification->verifyAndApply($payment->reference);
        } catch (RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        return $this->success(new PaymentResource($payment->load(['student.user', 'invoice'])));
    }
}
