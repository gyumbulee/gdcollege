<?php

namespace App\Http\Requests\Students;

use Illuminate\Foundation\Http\FormRequest;

class TransferProgrammeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'to_programme_id' => ['required', 'exists:programmes,id'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
