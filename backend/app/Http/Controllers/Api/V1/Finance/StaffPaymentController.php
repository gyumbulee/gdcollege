<?php

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Http\Responses\ApiResponse;
use App\Models\Payment;
use App\Services\PaymentVerificationService;
use Illuminate\Http\Request;
use RuntimeException;

class StaffPaymentController extends Controller
{
    use ApiResponse;

    private const WITH = ['student.user', 'invoice'];

    public function index(Request $request)
    {
        $query = Payment::with(self::WITH);

        foreach (['status', 'gateway', 'student_id'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        return $this->success(PaymentResource::collection(
            $query->orderByDesc('id')->paginate($request->integer('per_page', 25))
        ));
    }

    public function show(Payment $payment)
    {
        return $this->success(new PaymentResource($payment->load(self::WITH)));
    }

    /**
     * Manual re-check — for a payment stuck PENDING (e.g. the student
     * paid but the webhook never arrived). Goes through the exact same
     * PaymentVerificationService path a webhook would, so there is only
     * ever one way a payment becomes SUCCESSFUL.
     */
    public function verify(Payment $payment, PaymentVerificationService $verification)
    {
        try {
            $payment = $verification->verifyAndApply($payment->reference);
        } catch (RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        return $this->success(new PaymentResource($payment->load(self::WITH)), 'Payment re-checked.');
    }

    public function refund(Request $request, Payment $payment, PaymentVerificationService $verification)
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:0.01', 'max:'.(float) $payment->amount],
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        try {
            $payment = $verification->refund($payment, (float) $validated['amount'], $validated['reason']);
        } catch (RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        return $this->success(new PaymentResource($payment->load(self::WITH)), 'Refund recorded.');
    }
}
