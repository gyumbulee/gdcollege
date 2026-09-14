<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reference' => $this->reference,
            'gateway' => $this->gateway,
            'gateway_reference' => $this->gateway_reference,
            'amount' => (float) $this->amount,
            'status' => $this->status,
            'paid_at' => $this->paid_at,
            'verified_at' => $this->verified_at,
            'created_at' => $this->created_at,
            'student' => $this->whenLoaded('student', fn () => $this->student ? [
                'id' => $this->student->id,
                'matric_number' => $this->student->matric_number,
                'name' => $this->student->relationLoaded('user') ? $this->student->user->name : null,
            ] : null),
            'invoice' => $this->whenLoaded('invoice', fn () => $this->invoice ? [
                'id' => $this->invoice->id,
                'invoice_number' => $this->invoice->invoice_number,
            ] : null),
        ];
    }
}
