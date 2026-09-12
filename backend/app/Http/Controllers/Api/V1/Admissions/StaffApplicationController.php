<?php

namespace App\Http\Controllers\Api\V1\Admissions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admissions\DecisionRequest;
use App\Http\Resources\ApplicationResource;
use App\Http\Responses\ApiResponse;
use App\Models\Admission;
use App\Models\Application;
use App\Services\AdmissionConversionService;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

/**
 * Staff side of admissions — the counterpart to the applicant-facing
 * ApplicationController from Phase 4. Every action here requires a
 * `applications.*` permission (see routes/api.php); ownership is
 * irrelevant here (staff act on ANY application, unlike applicants).
 */
class StaffApplicationController extends Controller
{
    use ApiResponse;

    private const WITH = [
        'applicant.user', 'academicSession', 'programme.department.school',
        'educationRecords', 'documents', 'admission.decidedBy', 'student',
    ];

    public function index(Request $request)
    {
        $query = Application::with(self::WITH);

        foreach (['status', 'academic_session_id', 'programme_id'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        // Applications still in DRAFT are the applicant's private working
        // copy — staff review only starts once SUBMITTED.
        if (! $request->filled('status')) {
            $query->where('status', '!=', Application::STATUS_DRAFT);
        }

        return $this->success(ApplicationResource::collection(
            $query->orderByDesc('submitted_at')->paginate($request->integer('per_page', 25))
        ));
    }

    public function show(Application $application)
    {
        return $this->success(new ApplicationResource($application->load(self::WITH)));
    }

    public function review(Application $application, AuditLogger $audit)
    {
        if ($application->status !== Application::STATUS_SUBMITTED) {
            return $this->fail('Application must be SUBMITTED for this action.', [], 422);
        }

        $application->update(['status' => Application::STATUS_UNDER_REVIEW]);
        $audit->log('applications.review', $application);

        return $this->success(new ApplicationResource($application->fresh(self::WITH)), 'Marked under review.');
    }

    public function shortlist(Application $application, AuditLogger $audit)
    {
        if ($application->status !== Application::STATUS_UNDER_REVIEW) {
            return $this->fail('Application must be UNDER_REVIEW for this action.', [], 422);
        }

        $application->update(['status' => Application::STATUS_SHORTLISTED]);
        $audit->log('applications.shortlist', $application);

        return $this->success(new ApplicationResource($application->fresh(self::WITH)), 'Application shortlisted.');
    }

    /**
     * Records an ADMIT/HOLD/REJECT decision. Upserts the Admission row so
     * a decision can be corrected (e.g. HOLD -> ADMIT) without leaving
     * stale duplicate rows — the audit log, not row history, is the trail
     * of who decided what and when.
     */
    public function decide(DecisionRequest $request, Application $application, AuditLogger $audit)
    {
        if (! in_array($application->status, [
            Application::STATUS_UNDER_REVIEW, Application::STATUS_SHORTLISTED, Application::STATUS_ON_HOLD,
        ], true)) {
            return $this->fail('This application is not at a stage where a decision can be made.', [], 422);
        }

        $statusMap = [
            Admission::DECISION_ADMIT => Application::STATUS_ADMITTED,
            Admission::DECISION_HOLD => Application::STATUS_ON_HOLD,
            Admission::DECISION_REJECT => Application::STATUS_REJECTED,
        ];

        DB::transaction(function () use ($request, $application, $statusMap) {
            Admission::updateOrCreate(
                ['application_id' => $application->id],
                [
                    'decision' => $request->string('decision'),
                    'decision_reason' => $request->input('decision_reason'),
                    'decided_by' => Auth::id(),
                    'decided_at' => now(),
                ]
            );

            $application->update(['status' => $statusMap[$request->string('decision')->value()]]);
        });

        $audit->log(
            'applications.' . strtolower($request->string('decision')),
            $application,
            null,
            ['decision' => $request->input('decision'), 'reason' => $request->input('decision_reason')]
        );

        return $this->success(new ApplicationResource($application->fresh(self::WITH)), 'Decision recorded.');
    }

    /** Idempotent — see AdmissionConversionService. Safe to call twice. */
    public function convert(Application $application, AdmissionConversionService $converter, AuditLogger $audit)
    {
        try {
            $student = $converter->convert($application->fresh(['applicant.user', 'academicSession']));
        } catch (\RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        $audit->log('student.converted', $student);

        return $this->success(
            ['matric_number' => $student->matric_number, 'student_id' => $student->id],
            'Student account ready.'
        );
    }
}
