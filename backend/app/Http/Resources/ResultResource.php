<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'component_scores' => $this->component_scores,
            'total_score' => $this->total_score,
            'grade' => $this->grade,
            'grade_point' => $this->grade_point,
            'submitted_at' => $this->submitted_at,
            'published_at' => $this->published_at,
            'student' => $this->whenLoaded('student', fn () => $this->student ? [
                'id' => $this->student->id,
                'matric_number' => $this->student->matric_number,
                'name' => $this->student->relationLoaded('user') ? $this->student->user->name : null,
            ] : null),
            'course_offering' => $this->whenLoaded('courseOffering', fn () => $this->courseOffering ? [
                'id' => $this->courseOffering->id,
                'course' => $this->courseOffering->relationLoaded('course') ? [
                    'code' => $this->courseOffering->course->code,
                    'title' => $this->courseOffering->course->title,
                ] : null,
            ] : null),
        ];
    }
}
