<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CourseRegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'rejection_reason' => $this->rejection_reason,
            'submitted_at' => $this->submitted_at,
            'approved_at' => $this->approved_at,
            'academic_session' => $this->whenLoaded('academicSession', fn () => $this->academicSession ? [
                'id' => $this->academicSession->id,
                'name' => $this->academicSession->name,
            ] : null),
            'semester' => $this->whenLoaded('semester', fn () => $this->semester ? [
                'id' => $this->semester->id,
                'name' => $this->semester->name,
            ] : null),
            'student' => $this->whenLoaded('student', fn () => $this->student ? [
                'id' => $this->student->id,
                'matric_number' => $this->student->matric_number,
                'name' => $this->student->relationLoaded('user') ? $this->student->user->name : null,
            ] : null),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'is_carryover' => $item->is_carryover,
                'course_offering_id' => $item->course_offering_id,
                'course' => $item->relationLoaded('courseOffering') && $item->courseOffering->relationLoaded('course') ? [
                    'code' => $item->courseOffering->course->code,
                    'title' => $item->courseOffering->course->title,
                    'credit_units' => $item->courseOffering->course->credit_units,
                ] : null,
                'level' => $item->relationLoaded('courseOffering') && $item->courseOffering->relationLoaded('level')
                    ? $item->courseOffering->level->name
                    : null,
            ])),
            'total_credit_units' => $this->whenLoaded('items', fn () => $this->items->sum(
                fn ($item) => $item->relationLoaded('courseOffering') ? $item->courseOffering->course->credit_units : 0
            )),
        ];
    }
}
