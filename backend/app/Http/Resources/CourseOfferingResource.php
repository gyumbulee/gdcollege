<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseOfferingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'capacity' => $this->capacity,
            'course' => $this->whenLoaded('course', fn () => [
                'id' => $this->course->id,
                'code' => $this->course->code,
                'title' => $this->course->title,
                'credit_units' => $this->course->credit_units,
            ]),
            'level' => $this->whenLoaded('level', fn () => ['id' => $this->level->id, 'name' => $this->level->name]),
            'programme' => $this->whenLoaded('programme', fn () => ['id' => $this->programme->id, 'name' => $this->programme->name]),
            'semester' => $this->whenLoaded('semester', fn () => ['id' => $this->semester->id, 'name' => $this->semester->name]),
            'academic_session' => $this->whenLoaded('academicSession', fn () => ['id' => $this->academicSession->id, 'name' => $this->academicSession->name]),
            'lecturer' => $this->whenLoaded('lecturer', fn () => $this->lecturer ? ['id' => $this->lecturer->id, 'name' => $this->lecturer->name] : null),
        ];
    }
}
