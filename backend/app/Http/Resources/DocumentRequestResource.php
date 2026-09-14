<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'status' => $this->status,
            'notes' => $this->notes,
            'rejection_reason' => $this->rejection_reason,
            'created_at' => $this->created_at,
            'processed_at' => $this->processed_at,
            'student' => $this->whenLoaded('student', fn () => $this->student ? [
                'id' => $this->student->id,
                'matric_number' => $this->student->matric_number,
                'name' => $this->student->relationLoaded('user') ? $this->student->user->name : null,
            ] : null),
            'issued_document' => $this->whenLoaded('issuedDocument', fn () => $this->issuedDocument ? [
                'id' => $this->issuedDocument->id,
                'document_number' => $this->issuedDocument->document_number,
                'verification_code' => $this->issuedDocument->verification_code,
            ] : null),
        ];
    }
}
