<?php

namespace App\Http\Requests\Results;

use Illuminate\Foundation\Http\FormRequest;

class RejectResultRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return ['reason' => ['nullable', 'string', 'max:1000']];
    }
}
