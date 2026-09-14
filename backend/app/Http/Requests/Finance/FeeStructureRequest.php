<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class FeeStructureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'academic_session_id' => ['required', 'exists:academic_sessions,id'],
            'programme_id' => ['nullable', 'exists:programmes,id'],
            'level_id' => ['nullable', 'exists:levels,id'],
            'description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            // Optional: create the structure with its items in one call.
            'items' => ['sometimes', 'array'],
            'items.*.name' => ['required_with:items', 'string', 'max:255'],
            'items.*.code' => ['nullable', 'string', 'max:50'],
            'items.*.amount' => ['required_with:items', 'numeric', 'min:0'],
            'items.*.is_mandatory' => ['sometimes', 'boolean'],
        ];
    }
}
