<?php

namespace App\Http\Controllers\Api\V1\Documents;

use App\Http\Controllers\Controller;
use App\Http\Requests\Documents\DocumentRequestDecisionRequest;
use App\Http\Resources\DocumentRequestResource;
use App\Http\Resources\IssuedDocumentResource;
use App\Models\ClearanceRequest;
use App\Models\DocumentRequest;
use App\Models\DocumentTemplate;
use App\Models\IssuedDocument;
use App\Models\Result;
use App\Http\Responses\ApiResponse;
use App\Services\AuditLogger;
use App\Services\DocumentIssuanceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use RuntimeException;

class StaffDocumentController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = DocumentRequest::with(['student.user']);

        foreach (['status', 'type', 'student_id'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        return $this->success(DocumentRequestResource::collection(
            $query->orderByDesc('id')->paginate($request->integer('per_page', 25))
        ));
    }

    public function show(DocumentRequest $documentRequest)
    {
        return $this->success(new DocumentRequestResource($documentRequest->load(['student.user', 'issuedDocument'])));
    }

    /**
     * Moves REQUESTED → READY (or → REJECTED). READY does not itself
     * issue the document — see issue() — so a Registrar can mark
     * something ready to go without that action alone creating the
     * public verification record.
     */
    public function process(DocumentRequestDecisionRequest $request, DocumentRequest $documentRequest, AuditLogger $audit)
    {
        if ($documentRequest->status !== DocumentRequest::STATUS_REQUESTED
            && $documentRequest->status !== DocumentRequest::STATUS_PROCESSING) {
            return $this->fail('This request has already been processed.', [], 422);
        }

        $decision = $request->input('decision');
        $old = $documentRequest->only(['status']);

        if ($decision === 'reject') {
            $documentRequest->update([
                'status' => DocumentRequest::STATUS_REJECTED,
                'rejection_reason' => $request->validated('reason'),
                'processed_by' => Auth::id(),
                'processed_at' => now(),
            ]);
        } else {
            // Phase 11's clearance gate applies here too: a CLEARANCE_CERTIFICATE
            // request can only be marked READY once clearance is actually COMPLETED.
            if ($documentRequest->type === DocumentTemplate::TYPE_CLEARANCE_CERTIFICATE) {
                $cleared = ClearanceRequest::where('student_id', $documentRequest->student_id)
                    ->where('status', ClearanceRequest::STATUS_COMPLETED)
                    ->exists();

                if (! $cleared) {
                    return $this->fail('This student has no COMPLETED clearance on record yet.', [], 422);
                }
            }

            $documentRequest->update(['status' => DocumentRequest::STATUS_READY]);
        }

        $audit->log('documents.request.process', $documentRequest, $old, $documentRequest->only(['status']));

        return $this->success(new DocumentRequestResource($documentRequest->fresh()), 'Request updated.');
    }

    /**
     * Issues a READY request. Builds the content snapshot here (rather
     * than in DocumentIssuanceService, which only knows how to build
     * snapshots for the INSTANT types) from the student's actual
     * academic/clearance history at the moment of issuance.
     */
    public function issue(DocumentRequest $documentRequest, DocumentIssuanceService $service, AuditLogger $audit)
    {
        $content = match ($documentRequest->type) {
            DocumentTemplate::TYPE_TRANSCRIPT, DocumentTemplate::TYPE_STATEMENT_OF_RESULT => $this->academicHistoryContent($documentRequest),
            DocumentTemplate::TYPE_CLEARANCE_CERTIFICATE => $this->clearanceContent($documentRequest),
            default => [],
        };

        try {
            $document = $service->issueFromRequest($documentRequest, $content, Auth::user());
        } catch (RuntimeException $e) {
            return $this->fail($e->getMessage(), [], 422);
        }

        $audit->log('documents.issue', $document, null, $document->only(['type', 'document_number']));

        return $this->success(new IssuedDocumentResource($document), 'Document issued.', 201);
    }

    public function revoke(Request $request, IssuedDocument $issuedDocument, AuditLogger $audit)
    {
        $validated = $request->validate(['reason' => ['required', 'string', 'max:1000']]);

        $old = $issuedDocument->only(['status']);
        $issuedDocument->update(['status' => IssuedDocument::STATUS_REVOKED, 'revoked_reason' => $validated['reason']]);

        $audit->log('documents.revoke', $issuedDocument, $old, $issuedDocument->only(['status', 'revoked_reason']));

        return $this->success(new IssuedDocumentResource($issuedDocument), 'Document revoked.');
    }

    private function academicHistoryContent(DocumentRequest $documentRequest): array
    {
        $student = $documentRequest->student()->with('user', 'programme.department')->first();

        $results = Result::where('student_id', $student->id)
            ->where('status', Result::STATUS_PUBLISHED)
            ->with('courseOffering.course', 'courseOffering.academicSession', 'courseOffering.semester')
            ->get();

        return [
            'student_name' => $student->user->name,
            'matric_number' => $student->matric_number,
            'programme' => $student->programme?->name,
            'department' => $student->programme?->department?->name,
            'results' => $results->map(fn (Result $r) => [
                'academic_session' => $r->courseOffering->academicSession->name,
                'semester' => $r->courseOffering->semester->name,
                'code' => $r->courseOffering->course->code,
                'title' => $r->courseOffering->course->title,
                'credit_units' => $r->courseOffering->course->credit_units,
                'grade' => $r->grade,
                'grade_point' => (float) $r->grade_point,
            ])->all(),
        ];
    }

    private function clearanceContent(DocumentRequest $documentRequest): array
    {
        $clearance = ClearanceRequest::where('student_id', $documentRequest->student_id)
            ->where('status', ClearanceRequest::STATUS_COMPLETED)
            ->with('items', 'student.user')
            ->latest()
            ->first();

        return [
            'student_name' => $clearance?->student?->user?->name,
            'matric_number' => $clearance?->student?->matric_number,
            'completed_at' => $clearance?->completed_at,
            'stages' => $clearance?->items->map(fn ($item) => [
                'stage' => $item->stage, 'status' => $item->status, 'approved_at' => $item->approved_at,
            ])->all() ?? [],
        ];
    }
}
