<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class InstitutionSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'formal_name' => ['sometimes', 'string', 'max:255'],
            'short_name' => ['sometimes', 'string', 'max:100'],
            'motto' => ['sometimes', 'nullable', 'string', 'max:255'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'city' => ['sometimes', 'nullable', 'string', 'max:100'],
            'state' => ['sometimes', 'nullable', 'string', 'max:100'],
            'country' => ['sometimes', 'string', 'max:100'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'logo' => ['sometimes', 'nullable', 'image', 'max:2048'],
            'banner' => ['sometimes', 'nullable', 'image', 'max:4096'],
        ];
    }
}
