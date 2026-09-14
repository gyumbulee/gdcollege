<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IssuedDocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'document_number' => $this->document_number,
            'verification_code' => $this->verification_code,
            'type' => $this->type,
            'status' => $this->status,
            'issued_at' => $this->issued_at,
            'revoked_reason' => $this->revoked_reason,
            'content' => $this->content,
            'student' => $this->whenLoaded('student', fn () => $this->student ? [
                'id' => $this->student->id,
                'matric_number' => $this->student->matric_number,
                'name' => $this->student->relationLoaded('user') ? $this->student->user->name : null,
            ] : null),
        ];
    }
}
