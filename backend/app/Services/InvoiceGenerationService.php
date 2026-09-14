<?php

namespace App\Services;

use App\Models\FeeStructure;
use App\Models\Invoice;
use App\Models\Student;
use Illuminate\Support\Facades\DB;
use RuntimeException;

/**
 * Turns a FeeStructure into an actual Invoice + InvoiceItems for a
 * specific student — §20's "Fees should depend on: Academic Session,
 * Programme, Level, Fee Structure." Nothing here invents an amount:
 * every InvoiceItem is a snapshot of an already-configured FeeItem.
 */
class InvoiceGenerationService
{
    public function __construct(
        private readonly InvoiceNumberGenerator $invoiceNumbers,
    ) {
    }

    /**
     * Finds the best-matching active FeeStructure for this student's
     * (session, programme, level) — preferring the most specific match
     * (both programme AND level match) over a broader one (session-wide),
     * per FeeStructure::specificity(). Returns null if nothing matches,
     * rather than guessing at a fee.
     */
    public function resolveStructure(Student $student, int $academicSessionId): ?FeeStructure
    {
        return FeeStructure::where('academic_session_id', $academicSessionId)
            ->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('programme_id')->orWhere('programme_id', $student->programme_id))
            ->where(fn ($q) => $q->whereNull('level_id')->orWhere('level_id', $student->current_level_id))
            ->get()
            ->sortByDesc(fn (FeeStructure $structure) => $structure->specificity())
            ->first();
    }

    /**
     * Generates (and returns) an invoice for $student from $structure.
     * Refuses to create a second invoice for the same student against
     * the same structure (idempotent, mirroring AdmissionConversionService's
     * "never create a duplicate" rule) — returns the existing one instead.
     */
    public function generate(Student $student, FeeStructure $structure, ?int $semesterId, ?int $generatedByUserId): Invoice
    {
        $existing = Invoice::where('student_id', $student->id)
            ->where('fee_structure_id', $structure->id)
            ->where('status', '!=', Invoice::STATUS_VOID)
            ->first();

        if ($existing) {
            return $existing;
        }

        $items = $structure->items()->where('is_active', true)->get();

        if ($items->isEmpty()) {
            throw new RuntimeException('This fee structure has no active fee items to invoice.');
        }

        return DB::transaction(function () use ($student, $structure, $semesterId, $generatedByUserId, $items) {
            $total = $items->sum('amount');

            $invoice = Invoice::create([
                'invoice_number' => $this->invoiceNumbers->generate($structure->academicSession),
                'student_id' => $student->id,
                'academic_session_id' => $structure->academic_session_id,
                'semester_id' => $semesterId,
                'fee_structure_id' => $structure->id,
                'status' => Invoice::STATUS_PENDING,
                'total_amount' => $total,
                'amount_paid' => 0,
                'balance' => $total,
                'generated_by' => $generatedByUserId,
            ]);

            foreach ($items as $item) {
                $invoice->items()->create([
                    'fee_item_id' => $item->id,
                    'name' => $item->name,
                    'amount' => $item->amount,
                ]);
            }

            return $invoice;
        });
    }
}
