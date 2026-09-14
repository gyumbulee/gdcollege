<?php

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Resources\InvoiceResource;
use App\Http\Responses\ApiResponse;
use App\Models\Invoice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Student-facing, ownership-scoped (mirrors StudentResultController) —
 * no `invoices.view` permission is checked here because none is needed:
 * `role:student` plus "it's your own student_id" is the entire
 * authorization rule, same pattern as course registrations and results.
 */
class StudentInvoiceController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $student = Auth::user()->student;

        if (! $student) {
            return $this->fail('No student record is linked to this account.', [], 404);
        }

        $invoices = Invoice::with(['academicSession', 'feeStructure', 'items', 'payments'])
            ->where('student_id', $student->id)
            ->orderByDesc('id')
            ->get();

        return $this->success([
            'invoices' => InvoiceResource::collection($invoices),
            'total_outstanding' => (float) $invoices->where('status', '!=', Invoice::STATUS_VOID)->sum('balance'),
        ]);
    }

    public function show(Invoice $invoice)
    {
        $student = Auth::user()->student;
        abort_unless($student && $invoice->student_id === $student->id, 403);

        return $this->success(new InvoiceResource(
            $invoice->load(['academicSession', 'feeStructure', 'items', 'payments'])
        ));
    }
}
