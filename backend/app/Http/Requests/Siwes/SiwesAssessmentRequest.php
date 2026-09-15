<?php

namespace App\Http\Requests\Siwes;

use Illuminate\Foundation\Http\FormRequest;

class SiwesAssessmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'assessment_score' => ['required', 'integer', 'min:0', 'max:100'],
            'assessment_remark' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
