<?php

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Http\Responses\ApiResponse;
use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\Student;
use App\Services\AuditLogger;
use App\Services\InvoiceGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * Staff (Bursary Officer) side of invoicing. Generation is deliberately
 * explicit — a staff member picks the student and fee structure — rather
 * than an automatic bulk-generate-for-everyone action, which would risk
 * silently invoicing students against a fee structure nobody has
 * reviewed for that particular case yet.
 */
class InvoiceController extends Controller
{
    use ApiResponse;

    private const WITH = ['student.user', 'academicSession', 'feeStructure', 'items', 'payments'];

    public function index(Request $request)
    {
        $query = Invoice::with(self::WITH);

        foreach (['student_id', 'academic_session_id', 'status'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        return $this->success(InvoiceResource::collection(
            $query->orderByDesc('id')->paginate($request->integer('per_page', 25))
        ));
    }

    public function store(Request $request, InvoiceGenerationService $service, AuditLogger $audit)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'fee_structure_id' => ['required', 'exists:fee_structures,id'],
            'semester_id' => ['nullable', 'exists:semesters,id'],
        ]);

        $student = Student::findOrFail($validated['student_id']);
        $structure = FeeStructure::findOrFail($validated['fee_structure_id']);

        $invoice = $service->generate($student, $structure, $validated['semester_id'] ?? null, Auth::id());
        $invoice->load(self::WITH);

        $audit->log('invoices.generate', $invoice, null, $invoice->only(['invoice_number', 'total_amount']));

        return $this->success(new InvoiceResource($invoice), 'Invoice generated.', 201);
    }

    public function show(Invoice $invoice)
    {
        return $this->success(new InvoiceResource($invoice->load(self::WITH)));
    }

    public function void(Request $request, Invoice $invoice, AuditLogger $audit)
    {
        $validated = $request->validate(['reason' => ['required', 'string', 'max:1000']]);

        if ($invoice->amount_paid > 0) {
            return $this->fail('An invoice with payments already applied cannot be voided — process a refund instead.', [], 422);
        }

        $old = $invoice->only(['status']);
        $invoice->update([
            'status' => Invoice::STATUS_VOID,
            'voided_at' => now(),
            'void_reason' => $validated['reason'],
        ]);

        $audit->log('invoices.void', $invoice, $old, $invoice->only(['status', 'void_reason']));

        return $this->success(new InvoiceResource($invoice), 'Invoice voided.');
    }
}
