<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UserRoleAssignRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'role_slug' => ['required', 'string', 'exists:roles,slug'],
            'department_id' => ['nullable', 'exists:departments,id'],
        ];
    }
}
