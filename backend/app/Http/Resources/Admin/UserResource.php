<?php

namespace App\Http\Resources\Admin;

use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->map(fn (Role $role) => [
                'slug' => $role->slug,
                'name' => $role->name,
                'scope_type' => $role->pivot->scope_type,
                'scope_id' => $role->pivot->scope_id,
            ])),
            'created_at' => $this->created_at,
        ];
    }
}
