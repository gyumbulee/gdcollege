<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InvoiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'invoice_number' => $this->invoice_number,
            'status' => $this->status,
            'total_amount' => (float) $this->total_amount,
            'amount_paid' => (float) $this->amount_paid,
            'balance' => (float) $this->balance,
            'due_date' => $this->due_date,
            'void_reason' => $this->void_reason,
            'created_at' => $this->created_at,
            'student' => $this->whenLoaded('student', fn () => $this->student ? [
                'id' => $this->student->id,
                'matric_number' => $this->student->matric_number,
                'name' => $this->student->relationLoaded('user') ? $this->student->user->name : null,
            ] : null),
            'academic_session' => $this->whenLoaded('academicSession', fn () => $this->academicSession ? [
                'id' => $this->academicSession->id,
                'name' => $this->academicSession->name,
            ] : null),
            'fee_structure' => $this->whenLoaded('feeStructure', fn () => $this->feeStructure ? [
                'id' => $this->feeStructure->id,
                'name' => $this->feeStructure->name,
            ] : null),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'name' => $item->name,
                'amount' => (float) $item->amount,
                'discount_amount' => (float) $item->discount_amount,
                'waived_amount' => (float) $item->waived_amount,
                'net_amount' => $item->netAmount(),
            ])),
            'payments' => $this->whenLoaded('payments', fn () => $this->payments->map(fn ($payment) => [
                'id' => $payment->id,
                'reference' => $payment->reference,
                'gateway' => $payment->gateway,
                'amount' => (float) $payment->amount,
                'status' => $payment->status,
                'paid_at' => $payment->paid_at,
            ])),
        ];
    }
}
