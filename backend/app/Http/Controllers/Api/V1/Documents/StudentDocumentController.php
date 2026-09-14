<?php

namespace App\Http\Controllers\Api\V1\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\DocumentRequestCreateRequest;
use App\Http\Resources\DocumentRequestResource;
use App\Http\Resources\IssuedDocumentResource;
use App\Http\Responses\ApiResponse;
use App\Models\AcademicSession;
use App\Models\CourseRegistration;
use App\Models\DocumentRequest;
use App\Models\Payment;
use App\Models\Semester;
use App\Services\AuditLogger;
use App\Services\DocumentIssuanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

/**
 * A student's own document self-service (§6/§20 portal features):
 * instant generation for the types that need no staff review, and
 * requests for the ones that do. Ownership-scoped throughout — no
 * `documents.*` permission is needed here, same pattern as invoices/
 * results/course registrations.
 */
class StudentDocumentController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record is linked to this account.', [], 404);
        }

        return $this->success(IssuedDocumentResource::collection(
            $student->issuedDocuments()->orderByDesc('id')->get()
        ));
    }

    public function requests(Request $request)
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record is linked to this account.', [], 404);
        }

        return $this->success(DocumentRequestResource::collection(
            $student->documentRequests()->with('issuedDocument')->orderByDesc('id')->get()
        ));
    }

    /** POST /student/documents/request — TRANSCRIPT / STATEMENT_OF_RESULT / CLEARANCE_CERTIFICATE. */
    public function request(DocumentRequestCreateRequest $request, AuditLogger $audit)
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record is linked to this account.', [], 404);
        }

        $documentRequest = DocumentRequest::create([
            'student_id' => $student->id,
            'type' => $request->validated('type'),
            'notes' => $request->validated('notes'),
            'status' => DocumentRequest::STATUS_REQUESTED,
            'requested_by' => Auth::id(),
        ]);

        $audit->log('documents.request', $documentRequest);

        return $this->success(new DocumentRequestResource($documentRequest), 'Document requested.', 201);
    }

    /** POST /student/documents/admission-letter */
    public function admissionLetter(DocumentIssuanceService $service, AuditLogger $audit)
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record is linked to this account.', [], 404);
        }

        try {
            $document = $service->issueAdmissionLetter($student, Auth::user());
        } catch (RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        $audit->log('documents.issue', $document, null, $document->only(['type', 'document_number']));

        return $this->success(new IssuedDocumentResource($document), 'Admission letter generated.', 201);
    }

    /** POST /student/documents/registration-slip/{courseRegistration} */
    public function registrationSlip(CourseRegistration $courseRegistration, DocumentIssuanceService $service, AuditLogger $audit)
    {
        $student = Auth::user()->student;
        abort_unless($student && $courseRegistration->student_id === $student->id, 403);

        try {
            $document = $service->issueCourseRegistrationSlip($courseRegistration, Auth::user());
        } catch (RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        $audit->log('documents.issue', $document, null, $document->only(['type', 'document_number']));

        return $this->success(new IssuedDocumentResource($document), 'Registration slip generated.', 201);
    }

    /** POST /student/documents/result-slip {academic_session_id, semester_id?} */
    public function resultSlip(Request $request, DocumentIssuanceService $service, AuditLogger $audit)
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record is linked to this account.', [], 404);
        }

        $validated = $request->validate([
            'academic_session_id' => ['required', 'exists:academic_sessions,id'],
            'semester_id' => ['nullable', 'exists:semesters,id'],
        ]);

        $session = AcademicSession::findOrFail($validated['academic_session_id']);
        $semester = isset($validated['semester_id']) ? Semester::find($validated['semester_id']) : null;

        try {
            $document = $service->issueResultSlip($student, $session, $semester, Auth::user());
        } catch (RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        $audit->log('documents.issue', $document, null, $document->only(['type', 'document_number']));

        return $this->success(new IssuedDocumentResource($document), 'Result slip generated.', 201);
    }

    /** POST /student/documents/receipt/{payment} */
    public function paymentReceipt(Payment $payment, DocumentIssuanceService $service, AuditLogger $audit)
    {
        $student = Auth::user()->student;
        abort_unless($student && $payment->student_id === $student->id, 403);

        try {
            $document = $service->issuePaymentReceipt($payment, Auth::user());
        } catch (RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        $audit->log('documents.issue', $document, null, $document->only(['type', 'document_number']));

        return $this->success(new IssuedDocumentResource($document), 'Receipt generated.', 201);
    }
}
