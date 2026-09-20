<?php

namespace App\Services;

use App\Models\Application;
use App\Models\FinancialTransaction;
use App\Models\Invoice;
use App\Models\Payment;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\Payments\PaymentVerificationResult;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * §21: "Never trust the frontend payment response as final proof of
 * payment... Callbacks/webhooks must be idempotent." This is the ONLY
 * code path in the platform that is allowed to move a Payment to
 * SUCCESSFUL and touch an Invoice's amount_paid/balance/status — called
 * either from the webhook endpoint or from a staff/student "check status"
 * action, both of which end up here, both of which re-verify against the
 * gateway's own API (never trusting whatever the caller claims).
 */
class PaymentVerificationService
{
    public function __construct(
        private readonly PaymentGatewayManager $gateways,
        private readonly AuditLogger $audit,
        private readonly NotificationDispatcher $notifications,
    ) {
    }

    /**
     * @throws RuntimeException if no Payment matches the reference at all
     */
    public function verifyAndApply(string $reference): Payment
    {
        $payment = Payment::where('reference', $reference)
            ->orWhere('gateway_reference', $reference)
            ->first();

        if (! $payment) {
            throw new RuntimeException("No payment found for reference [{$reference}].");
        }

        // Idempotency: a payment already marked SUCCESSFUL is never
        // re-applied to its invoice a second time, no matter how many
        // times a webhook fires or a status check is retried.
        if ($payment->status === Payment::STATUS_SUCCESSFUL) {
            return $payment;
        }

        $result = $this->gateways->driver($payment->gateway)->verify($payment->gateway_reference ?? $payment->reference);

        return DB::transaction(function () use ($payment, $result) {
            // Lock the row for the duration of this transaction so two
            // concurrent verification attempts (e.g. a webhook and a
            // manual "check status" click landing at the same instant)
            // can't both pass the STATUS_SUCCESSFUL check above and then
            // both apply the credit.
            $payment = Payment::whereKey($payment->id)->lockForUpdate()->first();

            if ($payment->status === Payment::STATUS_SUCCESSFUL) {
                return $payment;
            }

            if (! $result->successful) {
                $payment->update(['status' => Payment::STATUS_FAILED, 'gateway_response' => $result->raw]);
                $this->audit->log('payments.verify.failed', $payment);

                return $payment;
            }

            // Amount mismatch is treated the same as a failed
            // verification — never credit an invoice more (or less) than
            // what the provider itself confirms was actually paid.
            if ($result->amount !== null && round($result->amount, 2) !== round((float) $payment->amount, 2)) {
                $payment->update(['status' => Payment::STATUS_FAILED, 'gateway_response' => $result->raw]);
                $this->audit->log('payments.verify.amount_mismatch', $payment, [
                    'expected' => (float) $payment->amount,
                ], ['reported' => $result->amount]);

                return $payment;
            }

            $old = $payment->only(['status', 'gateway_reference']);

            $payment->update([
                'status' => Payment::STATUS_SUCCESSFUL,
                'gateway_reference' => $result->gatewayReference ?? $payment->gateway_reference,
                'paid_at' => now(),
                'verified_at' => now(),
                'gateway_response' => $result->raw,
            ]);

            if ($payment->invoice_id) {
                $this->applyToInvoice($payment);
            } elseif ($payment->application_id) {
                $this->applyToApplication($payment);
            }

            $this->audit->log('payments.verify', $payment, $old, $payment->only(['status', 'gateway_reference']));

            if ($payment->student?->user_id) {
                $this->notifications->toUser(
                    $payment->student->user_id,
                    'payments.confirmed',
                    'Payment confirmed',
                    'Your payment of ₦'.number_format((float) $payment->amount, 2).' has been confirmed.',
                    '/student/fees'
                );
            } elseif ($payment->application?->applicant?->user_id) {
                $this->notifications->toUser(
                    $payment->application->applicant->user_id,
                    'payments.confirmed',
                    'Application fee confirmed',
                    'Your application fee payment of ₦'.number_format((float) $payment->amount, 2).' has been confirmed.',
                    '/admissions/application'
                );
            }

            return $payment;
        });
    }

    private function applyToInvoice(Payment $payment): void
    {
        /** @var Invoice $invoice */
        $invoice = Invoice::whereKey($payment->invoice_id)->lockForUpdate()->first();

        FinancialTransaction::create([
            'invoice_id' => $invoice->id,
            'payment_id' => $payment->id,
            'student_id' => $payment->student_id,
            'type' => FinancialTransaction::TYPE_PAYMENT,
            'direction' => FinancialTransaction::DIRECTION_CREDIT,
            'amount' => $payment->amount,
            'description' => "Payment via {$payment->gateway} (ref: {$payment->reference})",
        ]);

        $amountPaid = (float) $invoice->amount_paid + (float) $payment->amount;
        $balance = max(0, (float) $invoice->total_amount - $amountPaid);

        $invoice->update([
            'amount_paid' => $amountPaid,
            'balance' => $balance,
            'status' => $balance <= 0 ? Invoice::STATUS_PAID : Invoice::STATUS_PARTIALLY_PAID,
        ]);
    }

    /**
     * Application-fee counterpart to applyToInvoice() — no invoice or
     * student exists yet at this point, so this only flips the
     * application's own fee_paid flag (and, if it's still sitting at
     * DRAFT/PAYMENT_PENDING, advances it to PAYMENT_CONFIRMED) and
     * appends an invoice-less financial_transactions row so the payment
     * still shows up in institutional financial records (§20/§35 —
     * append-only, never silently dropped).
     */
    private function applyToApplication(Payment $payment): void
    {
        /** @var Application $application */
        $application = Application::whereKey($payment->application_id)->lockForUpdate()->first();

        FinancialTransaction::create([
            'payment_id' => $payment->id,
            'type' => FinancialTransaction::TYPE_PAYMENT,
            'direction' => FinancialTransaction::DIRECTION_CREDIT,
            'amount' => $payment->amount,
            'description' => "Application fee via {$payment->gateway} (ref: {$payment->reference}) — {$application->application_number}",
        ]);

        $application->update([
            'fee_paid' => true,
            'status' => in_array($application->status, [Application::STATUS_DRAFT, Application::STATUS_PAYMENT_PENDING], true)
                ? Application::STATUS_PAYMENT_CONFIRMED
                : $application->status,
        ]);
    }

    /**
     * Records a refund: never edits the original PAYMENT transaction —
     * appends a new REFUND row (append-only ledger, §35) and reopens the
     * invoice's balance by the refunded amount.
     */
    public function refund(Payment $payment, float $amount, string $reason): Payment
    {
        if ($payment->status !== Payment::STATUS_SUCCESSFUL) {
            throw new RuntimeException('Only a SUCCESSFUL payment can be refunded.');
        }

        return DB::transaction(function () use ($payment, $amount, $reason) {
            $payment = Payment::whereKey($payment->id)->lockForUpdate()->first();
            $invoice = Invoice::whereKey($payment->invoice_id)->lockForUpdate()->first();

            $old = $payment->only(['status']);
            $payment->update(['status' => Payment::STATUS_REFUNDED]);

            FinancialTransaction::create([
                'invoice_id' => $invoice->id,
                'payment_id' => $payment->id,
                'student_id' => $payment->student_id,
                'type' => FinancialTransaction::TYPE_REFUND,
                'direction' => FinancialTransaction::DIRECTION_DEBIT,
                'amount' => $amount,
                'description' => $reason,
                'performed_by' => auth()->id(),
            ]);

            $amountPaid = max(0, (float) $invoice->amount_paid - $amount);
            $balance = max(0, (float) $invoice->total_amount - $amountPaid);

            $invoice->update([
                'amount_paid' => $amountPaid,
                'balance' => $balance,
                'status' => $balance <= 0 ? Invoice::STATUS_PAID : Invoice::STATUS_PARTIALLY_PAID,
            ]);

            $this->audit->log('payments.refund', $payment, $old, $payment->only(['status']));

            return $payment;
        });
    }
}
