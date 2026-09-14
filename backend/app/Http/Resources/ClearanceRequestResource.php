<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClearanceRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'completed_at' => $this->completed_at,
            'created_at' => $this->created_at,
            'student' => $this->whenLoaded('student', fn () => $this->student ? [
                'id' => $this->student->id,
                'matric_number' => $this->student->matric_number,
                'name' => $this->student->relationLoaded('user') ? $this->student->user->name : null,
            ] : null),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'stage' => $item->stage,
                'status' => $item->status,
                'remark' => $item->remark,
                'approved_at' => $item->approved_at,
            ])),
        ];
    }
}
