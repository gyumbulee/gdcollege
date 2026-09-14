<?php

namespace App\Services;

use App\Models\AcademicSession;
use App\Models\CourseRegistration;
use App\Models\DocumentRequest;
use App\Models\DocumentTemplate;
use App\Models\IssuedDocument;
use App\Models\Payment;
use App\Models\Result;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Every issued document's `content` is a point-in-time snapshot, built
 * here from whatever real records already exist elsewhere in the
 * platform — never hand-entered, never a live join that could silently
 * change after issuance (see IssuedDocument's own migration comment).
 */
class DocumentIssuanceService
{
    public function __construct(
        private readonly DocumentNumberGenerator $numbers,
        private readonly VerificationCodeGenerator $codes,
    ) {
    }

    public function issueAdmissionLetter(Student $student, ?User $issuer): IssuedDocument
    {
        $admission = $student->application?->admission;

        if (! $admission || $admission->decision !== \App\Models\Admission::DECISION_ADMIT) {
            throw new RuntimeException('This student has no ADMIT decision on record to issue a letter for.');
        }

        return $this->issue($student, DocumentTemplate::TYPE_ADMISSION_LETTER, [
            'student_name' => $student->user->name,
            'matric_number' => $student->matric_number,
            'programme' => $student->programme?->name,
            'department' => $student->programme?->department?->name,
            'admission_session' => $student->admissionSession?->name,
            'decision_date' => $admission->decided_at,
        ], $issuer);
    }

    public function issueCourseRegistrationSlip(CourseRegistration $registration, ?User $issuer): IssuedDocument
    {
        if (! in_array($registration->status, [CourseRegistration::STATUS_APPROVED, CourseRegistration::STATUS_SUBMITTED], true)) {
            throw new RuntimeException('Only a submitted or approved registration can be issued as a slip.');
        }

        $registration->loadMissing(['student.user', 'academicSession', 'semester', 'items.courseOffering.course']);

        return $this->issue($registration->student, DocumentTemplate::TYPE_COURSE_REG_SLIP, [
            'student_name' => $registration->student->user->name,
            'matric_number' => $registration->student->matric_number,
            'academic_session' => $registration->academicSession->name,
            'semester' => $registration->semester->name,
            'status' => $registration->status,
            'items' => $registration->items->map(fn ($item) => [
                'code' => $item->courseOffering->course->code,
                'title' => $item->courseOffering->course->title,
                'credit_units' => $item->courseOffering->course->credit_units,
                'is_carryover' => $item->is_carryover,
            ])->all(),
            'total_credit_units' => $registration->items->sum(fn ($item) => $item->courseOffering->course->credit_units),
        ], $issuer);
    }

    public function issueResultSlip(Student $student, AcademicSession $session, ?Semester $semester, ?User $issuer): IssuedDocument
    {
        $results = Result::where('student_id', $student->id)
            ->where('status', Result::STATUS_PUBLISHED)
            ->whereHas('courseOffering', function ($q) use ($session, $semester) {
                $q->where('academic_session_id', $session->id);
                if ($semester) {
                    $q->where('semester_id', $semester->id);
                }
            })
            ->with('courseOffering.course')
            ->get();

        if ($results->isEmpty()) {
            throw new RuntimeException('No published results exist for this student in the selected session/semester.');
        }

        return $this->issue($student, DocumentTemplate::TYPE_RESULT_SLIP, [
            'student_name' => $student->user->name,
            'matric_number' => $student->matric_number,
            'academic_session' => $session->name,
            'semester' => $semester?->name,
            'results' => $results->map(fn (Result $r) => [
                'code' => $r->courseOffering->course->code,
                'title' => $r->courseOffering->course->title,
                'credit_units' => $r->courseOffering->course->credit_units,
                'total_score' => (float) $r->total_score,
                'grade' => $r->grade,
                'grade_point' => (float) $r->grade_point,
            ])->all(),
        ], $issuer);
    }

    public function issuePaymentReceipt(Payment $payment, ?User $issuer): IssuedDocument
    {
        if ($payment->status !== Payment::STATUS_SUCCESSFUL) {
            throw new RuntimeException('Only a SUCCESSFUL payment can have a receipt issued.');
        }

        $payment->loadMissing(['student.user', 'invoice']);

        return $this->issue($payment->student, DocumentTemplate::TYPE_PAYMENT_RECEIPT, [
            'student_name' => $payment->student->user->name,
            'matric_number' => $payment->student->matric_number,
            'reference' => $payment->reference,
            'gateway' => $payment->gateway,
            'amount' => (float) $payment->amount,
            'paid_at' => $payment->paid_at,
            'invoice_number' => $payment->invoice?->invoice_number,
        ], $issuer);
    }

    /**
     * For the non-instant types (TRANSCRIPT, STATEMENT_OF_RESULT,
     * CLEARANCE_CERTIFICATE) — called by staff after a DocumentRequest
     * has been marked READY, with $content built by the controller from
     * the relevant records (full academic history / clearance record).
     */
    public function issueFromRequest(DocumentRequest $request, array $content, User $issuer): IssuedDocument
    {
        if ($request->status !== DocumentRequest::STATUS_READY) {
            throw new RuntimeException('Only a READY request can be issued.');
        }

        $document = $this->issue($request->student, $request->type, $content, $issuer, $request);

        $request->update(['status' => DocumentRequest::STATUS_ISSUED, 'processed_by' => $issuer->id, 'processed_at' => now()]);

        return $document;
    }

    private function issue(Student $student, string $type, array $content, ?User $issuer, ?DocumentRequest $request = null): IssuedDocument
    {
        return DB::transaction(fn () => IssuedDocument::create([
            'document_number' => $this->numbers->generate($type),
            'verification_code' => $this->codes->generate(),
            'type' => $type,
            'student_id' => $student->id,
            'document_request_id' => $request?->id,
            'issued_by' => $issuer?->id,
            'issued_at' => now(),
            'status' => IssuedDocument::STATUS_ACTIVE,
            'content' => $content,
        ]));
    }
}
