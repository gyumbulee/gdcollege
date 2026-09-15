<?php

namespace App\Http\Requests\Siwes;

use Illuminate\Foundation\Http\FormRequest;

class SiwesRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'organization_name' => ['required', 'string', 'max:255'],
            'organization_address' => ['nullable', 'string', 'max:1000'],
            'supervisor_name' => ['nullable', 'string', 'max:255'],
            'supervisor_phone' => ['nullable', 'string', 'max:30'],
            'supervisor_email' => ['nullable', 'email', 'max:255'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
        ];
    }
}
