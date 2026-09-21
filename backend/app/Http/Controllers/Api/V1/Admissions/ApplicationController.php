<?php

namespace App\Http\Controllers\Api\V1\Admissions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admissions\CreateApplicationRequest;
use App\Http\Resources\ApplicationResource;
use App\Http\Resources\PaymentResource;
use App\Http\Requests\Admissions\UpdateApplicationRequest;
use App\Http\Responses\ApiResponse;
use App\Models\AcademicSession;
use App\Models\Application;
use App\Models\Payment;
use App\Services\ApplicationNumberGenerator;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\PaymentReferenceGenerator;
use App\Services\PaymentVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use RuntimeException;

class ApplicationController extends Controller
{
    use ApiResponse;

    private const WITH = ['applicant.user', 'academicSession', 'programme.department.school', 'educationRecords', 'documents'];

    /** The authenticated applicant's own applications only. */
    public function index()
    {
        $applications = Application::with(self::WITH)
            ->whereHas('applicant', fn ($q) => $q->where('user_id', Auth::id()))
            ->orderByDesc('id')
            ->get();

        return $this->success(ApplicationResource::collection($applications));
    }

    public function store(CreateApplicationRequest $request, ApplicationNumberGenerator $numbers)
    {
        $session = AcademicSession::current();

        if (! $session) {
            return $this->fail('No academic session is currently open for admissions.', [], 422);
        }

        if (! $session->isAcceptingApplications()) {
            $message = match (true) {
                $session->admissions_open_at && now()->lt($session->admissions_open_at)
                    => 'Applications for the '.$session->name.' session open on '.$session->admissions_open_at->format('j M Y, g:i a').'.',
                $session->admissions_close_at && now()->gt($session->admissions_close_at)
                    => 'Applications for the '.$session->name.' session closed on '.$session->admissions_close_at->format('j M Y, g:i a').'.',
                default => 'Applications are not currently open for the '.$session->name.' session.',
            };

            return $this->fail($message, [], 422);
        }

        $applicant = Auth::user()->applicant;

        $application = DB::transaction(function () use ($applicant, $session, $request, $numbers) {
            return Application::create([
                'applicant_id' => $applicant->id,
                'academic_session_id' => $session->id,
                'programme_id' => $request->input('programme_id'),
                'application_number' => $numbers->generate($session),
                'status' => Application::STATUS_DRAFT,
            ]);
        });

        return $this->success(new ApplicationResource($application->load(self::WITH)), 'Application started.', 201);
    }

    public function show(Application $application)
    {
        $this->authorize('view', $application);

        return $this->success(new ApplicationResource($application->load(self::WITH)));
    }

    public function update(UpdateApplicationRequest $request, Application $application)
    {
        $this->authorize('update', $application);

        DB::transaction(function () use ($request, $application) {
            $applicantFields = $request->safe()->only([
                'date_of_birth', 'gender', 'nationality', 'state_of_origin',
                'lga', 'address', 'next_of_kin_name', 'next_of_kin_phone',
                'next_of_kin_relationship', 'next_of_kin_address',
            ]);
            if (! empty($applicantFields)) {
                $application->applicant->update($applicantFields);
            }

            if ($request->filled('phone')) {
                $application->applicant->user->update(['phone' => $request->input('phone')]);
            }

            if ($request->has('programme_id')) {
                $application->update(['programme_id' => $request->input('programme_id')]);
            }
        });

        return $this->success(new ApplicationResource($application->fresh(self::WITH)), 'Application updated.');
    }

    /**
     * Transitions DRAFT -> SUBMITTED. The backend, not the frontend, decides
     * whether an application is complete (Master Implementation Brief §6)
     * — every check below is server-side and re-checked regardless of what
     * the wizard UI already validated client-side.
     */
    public function submit(Request $request, Application $application)
    {
        $this->authorize('submit', $application);

        $missing = $this->completenessErrors($application);

        if (! empty($missing)) {
            return $this->fail('This application is not yet complete.', $missing, 422);
        }

        $application->update([
            'status' => Application::STATUS_SUBMITTED,
            'submitted_at' => now(),
        ]);

        return $this->success(new ApplicationResource($application->fresh(self::WITH)), 'Application submitted.');
    }

    /**
     * Starts an application-fee payment attempt. Mirrors
     * Finance\PaymentController::initiate() exactly, except the Payment
     * is linked to this Application instead of an Invoice/Student (see
     * the payments.application_id migration) — everything downstream
     * (gateway initialize, server-side verify, webhook, audit) is the
     * same code path either way.
     */
    public function pay(Request $request, Application $application, PaymentReferenceGenerator $references, PaymentGatewayManager $gateways)
    {
        $this->authorize('pay', $application);

        $amount = (float) config('admissions.application_fee_amount');
        if ($amount <= 0) {
            return $this->fail('The application fee amount has not been configured yet.', [], 422);
        }

        $validated = $request->validate([
            'gateway' => ['sometimes', 'string', 'in:'.implode(',', array_keys(config('payments.gateways')))],
        ]);
        $gatewayName = $validated['gateway'] ?? config('payments.default');

        $payment = DB::transaction(function () use ($application, $amount, $gatewayName, $references) {
            if ($application->status === Application::STATUS_DRAFT) {
                $application->update(['status' => Application::STATUS_PAYMENT_PENDING]);
            }

            return Payment::create([
                'reference' => $references->generate(),
                'application_id' => $application->id,
                'gateway' => $gatewayName,
                'amount' => $amount,
                'status' => Payment::STATUS_PENDING,
            ]);
        });

        try {
            $init = $gateways->driver($gatewayName)->initialize($payment);
        } catch (\Throwable $e) {
            Log::error('payments.initialize.failed', ['payment_id' => $payment->id, 'error' => $e->getMessage()]);
            $payment->update(['status' => Payment::STATUS_FAILED]);

            return $this->fail('Could not start this payment with the selected gateway. Please try again.', [], 502);
        }

        $payment->update(['gateway_reference' => $init['gateway_reference'] ?? null]);

        return $this->success([
            'payment' => new PaymentResource($payment->fresh()),
            'authorization_url' => $init['authorization_url'],
        ], 'Application fee payment initiated.', 201);
    }

    /**
     * Lets the frontend poll/confirm a payment after returning from a
     * gateway's checkout (or after "Simulate Payment" on the test
     * gateway) without waiting on the webhook — same re-verification
     * guarantee as Finance\PaymentController::status(), never trusting
     * the request itself as proof of payment.
     */
    public function paymentStatus(Payment $payment, PaymentVerificationService $verification)
    {
        abort_unless(
            $payment->application_id && $payment->application->applicant->user_id === Auth::id(),
            403
        );

        try {
            $payment = $verification->verifyAndApply($payment->reference);
        } catch (RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        return $this->success(new ApplicationResource($payment->application->fresh(self::WITH)));
    }

    /** @return array<string, string[]> */
    private function completenessErrors(Application $application): array
    {
        $errors = [];
        $applicant = $application->applicant;

        if (! $application->programme_id) {
            $errors['programme_id'] = ['Select a programme.'];
        }

        foreach (['date_of_birth', 'gender', 'address', 'next_of_kin_name', 'next_of_kin_phone'] as $field) {
            if (empty($applicant->{$field})) {
                $errors[$field] = ["This is required before submitting."];
            }
        }

        if ($application->educationRecords()->count() === 0) {
            $errors['education_records'] = ['Add at least one educational history record.'];
        }

        $uploadedTypes = $application->documents()->pluck('document_type')->all();
        $missingDocs = array_diff(config('admissions.required_document_types', []), $uploadedTypes);
        if (! empty($missingDocs)) {
            $errors['documents'] = array_map(
                fn ($type) => 'Upload your ' . (config("admissions.document_types.{$type}") ?? $type) . '.',
                array_values($missingDocs)
            );
        }

        // Application fee: only enforced while
        // admissions.application_fee_required_before_submission is on
        // (see config/admissions.php — a clearly-marked demo amount
        // until Bursary confirms the real figure). fee_paid is only
        // ever flipped by PaymentVerificationService after server-side
        // gateway verification — see ApplicationController::pay().
        if (config('admissions.application_fee_required_before_submission') && ! $application->fee_paid) {
            $errors['fee'] = ['Pay the application fee before submitting.'];
        }

        return $errors;
    }
}
