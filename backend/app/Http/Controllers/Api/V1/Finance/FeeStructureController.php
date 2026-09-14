<?php

namespace App\Http\Controllers\Api\V1\Finance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Finance\FeeItemRequest;
use App\Http\Requests\Finance\FeeStructureRequest;
use App\Http\Responses\ApiResponse;
use App\Models\FeeItem;
use App\Models\FeeStructure;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * §20/§40: fees are never hardcoded — every amount here comes from what
 * the Bursary Officer configures. Gated by `fee_structures.manage`
 * (view access for other finance reads goes through `invoices.view`/
 * `payments.view` instead, since browsing structures to build an invoice
 * is part of that workflow, not fee-structure administration itself).
 */
class FeeStructureController extends Controller
{
    use ApiResponse;

    private const WITH = ['academicSession', 'programme', 'level', 'items'];

    public function index(Request $request)
    {
        $query = FeeStructure::with(self::WITH);

        foreach (['academic_session_id', 'programme_id', 'level_id'] as $filter) {
            if ($request->filled($filter)) {
                $query->where($filter, $request->input($filter));
            }
        }

        return $this->success(
            $query->orderByDesc('id')->get()->map(fn (FeeStructure $s) => $this->present($s))
        );
    }

    public function store(FeeStructureRequest $request, AuditLogger $audit)
    {
        $structure = DB::transaction(function () use ($request) {
            $structure = FeeStructure::create($request->safe()->except('items'));

            foreach ($request->input('items', []) as $item) {
                $structure->items()->create($item);
            }

            return $structure->load(self::WITH);
        });

        $audit->log('fee_structures.create', $structure, null, $structure->toArray());

        return $this->success($this->present($structure), 'Fee structure created.', 201);
    }

    public function show(FeeStructure $feeStructure)
    {
        return $this->success($this->present($feeStructure->load(self::WITH)));
    }

    public function update(FeeStructureRequest $request, FeeStructure $feeStructure, AuditLogger $audit)
    {
        $old = $feeStructure->only(['name', 'is_active', 'description']);
        $feeStructure->update($request->safe()->except('items'));

        $audit->log('fee_structures.update', $feeStructure, $old, $feeStructure->only(['name', 'is_active', 'description']));

        return $this->success($this->present($feeStructure->load(self::WITH)), 'Fee structure updated.');
    }

    /**
     * Deactivate, don't delete — §35: institutional records shouldn't be
     * casually hard-deleted, and invoices already generated from this
     * structure must keep their historical fee_item snapshot regardless.
     */
    public function destroy(FeeStructure $feeStructure, AuditLogger $audit)
    {
        $feeStructure->update(['is_active' => false]);
        $audit->log('fee_structures.deactivate', $feeStructure);

        return $this->success(null, 'Fee structure deactivated.');
    }

    public function addItem(FeeItemRequest $request, FeeStructure $feeStructure, AuditLogger $audit)
    {
        $item = $feeStructure->items()->create($request->validated());
        $audit->log('fee_structures.item.create', $item, null, $item->toArray());

        return $this->success($item, 'Fee item added.', 201);
    }

    public function updateItem(FeeItemRequest $request, FeeStructure $feeStructure, FeeItem $item, AuditLogger $audit)
    {
        abort_unless($item->fee_structure_id === $feeStructure->id, 404);

        $old = $item->only(['name', 'amount', 'is_active']);
        $item->update($request->validated());
        $audit->log('fee_structures.item.update', $item, $old, $item->only(['name', 'amount', 'is_active']));

        return $this->success($item, 'Fee item updated.');
    }

    public function removeItem(FeeStructure $feeStructure, FeeItem $item, AuditLogger $audit)
    {
        abort_unless($item->fee_structure_id === $feeStructure->id, 404);

        $item->update(['is_active' => false]);
        $audit->log('fee_structures.item.deactivate', $item);

        return $this->success(null, 'Fee item deactivated.');
    }

    private function present(FeeStructure $structure): array
    {
        return [
            'id' => $structure->id,
            'name' => $structure->name,
            'description' => $structure->description,
            'is_active' => $structure->is_active,
            'total_amount' => $structure->totalAmount(),
            'academic_session' => $structure->academicSession ? [
                'id' => $structure->academicSession->id, 'name' => $structure->academicSession->name,
            ] : null,
            'programme' => $structure->programme ? ['id' => $structure->programme->id, 'name' => $structure->programme->name] : null,
            'level' => $structure->level ? ['id' => $structure->level->id, 'name' => $structure->level->name] : null,
            'items' => $structure->items->map(fn (FeeItem $item) => [
                'id' => $item->id,
                'name' => $item->name,
                'code' => $item->code,
                'amount' => (float) $item->amount,
                'is_mandatory' => $item->is_mandatory,
                'is_active' => $item->is_active,
            ]),
        ];
    }
}
