<?php

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Invoice;
use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Kept intentionally simple — collections/outstanding/status breakdowns,
 * not a report-builder. The full institution-wide reporting surface is
 * Phase 20 (Management Dashboard); this is the Bursary-specific "what
 * does today's cash position look like" view.
 */
class FinancialReportController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Invoice::query();
        if ($request->filled('academic_session_id')) {
            $query->where('academic_session_id', $request->input('academic_session_id'));
        }

        $invoicesByStatus = (clone $query)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        return $this->success([
            'total_invoiced' => (float) (clone $query)->where('status', '!=', Invoice::STATUS_VOID)->sum('total_amount'),
            'total_collected' => (float) (clone $query)->where('status', '!=', Invoice::STATUS_VOID)->sum('amount_paid'),
            'total_outstanding' => (float) (clone $query)->where('status', '!=', Invoice::STATUS_VOID)->sum('balance'),
            'invoices_by_status' => $invoicesByStatus,
            'payments_by_status' => Payment::selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status'),
            'payments_by_gateway' => Payment::where('status', Payment::STATUS_SUCCESSFUL)
                ->selectRaw('gateway, count(*) as total, sum(amount) as amount')
                ->groupBy('gateway')
                ->get()
                ->map(fn ($row) => ['gateway' => $row->gateway, 'count' => $row->total, 'amount' => (float) $row->amount]),
        ]);
    }
}
