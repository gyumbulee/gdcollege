<?php

namespace App\Http\Controllers\Api\V1\Admissions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admissions\CreateApplicationRequest;
use App\Http\Resources\ApplicationResource;
use App\Http\Requests\Admissions\UpdateApplicationRequest;
use App\Http\Responses\ApiResponse;
use App\Models\AcademicSession;
use App\Models\Application;
use App\Services\ApplicationNumberGenerator;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

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

        // NOTE: application fee is deliberately NOT enforced here — see
        // config/admissions.php and docs/PROJECT_STATUS.md. Wire in
        // `if (config('admissions.application_fee_required_before_submission')
        //   && ! $application->fee_paid) { $errors['fee'] = [...]; }`
        // once Phase 13 (Payment Gateway) makes fee_paid trustworthy.

        return $errors;
    }
}
