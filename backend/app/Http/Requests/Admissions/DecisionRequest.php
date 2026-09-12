<?php

namespace App\Http\Requests\Admissions;

use App\Models\Admission;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DecisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::in([
                Admission::DECISION_ADMIT,
                Admission::DECISION_HOLD,
                Admission::DECISION_REJECT,
            ])],
            'decision_reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
