<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SiwesRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'organization_name' => $this->organization_name,
            'organization_address' => $this->organization_address,
            'supervisor_name' => $this->supervisor_name,
            'supervisor_phone' => $this->supervisor_phone,
            'supervisor_email' => $this->supervisor_email,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'status' => $this->status,
            'assessment_score' => $this->assessment_score,
            'assessment_remark' => $this->assessment_remark,
            'assessed_at' => $this->assessed_at,
            'student' => $this->whenLoaded('student', fn () => $this->student ? [
                'id' => $this->student->id,
                'matric_number' => $this->student->matric_number,
                'name' => $this->student->relationLoaded('user') ? $this->student->user->name : null,
            ] : null),
        ];
    }
}
