<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'category' => $this->category,
            'subject' => $this->subject,
            'description' => $this->description,
            'priority' => $this->priority,
            'status' => $this->status,
            'created_at' => $this->created_at,
            'user' => $this->whenLoaded('user', fn () => $this->user ? [
                'id' => $this->user->id, 'name' => $this->user->name, 'email' => $this->user->email,
            ] : null),
            'assigned_to' => $this->whenLoaded('assignedTo', fn () => $this->assignedTo ? [
                'id' => $this->assignedTo->id, 'name' => $this->assignedTo->name,
            ] : null),
            'messages' => $this->whenLoaded('messages', fn () => $this->messages->map(fn ($m) => [
                'id' => $m->id,
                'message' => $m->message,
                'is_staff_reply' => $m->is_staff_reply,
                'attachment_name' => $m->attachment_name,
                'created_at' => $m->created_at,
                'user' => $m->relationLoaded('user') && $m->user ? ['id' => $m->user->id, 'name' => $m->user->name] : null,
            ])),
        ];
    }
}
