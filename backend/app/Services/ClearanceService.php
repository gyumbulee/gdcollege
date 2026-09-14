<?php

namespace App\Services;

use App\Models\ClearanceItem;
use App\Models\ClearanceRequest;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ClearanceService
{
    /**
     * One request per student is active at a time — repeating the
     * request returns the existing one rather than creating a duplicate
     * pipeline (same idempotency pattern as AdmissionConversionService/
     * InvoiceGenerationService).
     */
    public function request(Student $student, ?int $academicSessionId): ClearanceRequest
    {
        $existing = ClearanceRequest::where('student_id', $student->id)
            ->whereIn('status', [ClearanceRequest::STATUS_PENDING, ClearanceRequest::STATUS_IN_PROGRESS])
            ->first();

        if ($existing) {
            return $existing;
        }

        return DB::transaction(function () use ($student, $academicSessionId) {
            $request = ClearanceRequest::create([
                'student_id' => $student->id,
                'academic_session_id' => $academicSessionId,
                'status' => ClearanceRequest::STATUS_PENDING,
            ]);

            foreach (ClearanceRequest::STAGES as $stage) {
                $request->items()->create(['stage' => $stage, 'status' => ClearanceItem::STATUS_PENDING]);
            }

            return $request;
        });
    }

    public function decide(ClearanceItem $item, User $staff, string $decision, ?string $remark): ClearanceItem
    {
        if (! in_array($decision, [ClearanceItem::STATUS_APPROVED, ClearanceItem::STATUS_REJECTED], true)) {
            throw new RuntimeException('Decision must be APPROVED or REJECTED.');
        }

        if ($item->status !== ClearanceItem::STATUS_PENDING) {
            throw new RuntimeException('This clearance stage has already been decided.');
        }

        return DB::transaction(function () use ($item, $staff, $decision, $remark) {
            $item->update([
                'status' => $decision,
                'remark' => $remark,
                'approved_by' => $staff->id,
                'approved_at' => now(),
            ]);

            $item->clearanceRequest->recomputeStatus();

            return $item->fresh();
        });
    }
}
