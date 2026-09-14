<?php

namespace App\Http\Requests\Finance;

use Illuminate\Foundation\Http\FormRequest;

class FeeItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => ['nullable', 'string', 'max:50'],
            'amount' => ['required', 'numeric', 'min:0'],
            'is_mandatory' => ['sometimes', 'boolean'],
            'is_active' => ['sometimes', 'boolean'],
            'description' => ['nullable', 'string'],
        ];
    }
}
