<?php

namespace App\Http\Requests\Clearance;

use App\Models\ClearanceItem;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClearanceDecisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'decision' => ['required', Rule::in([ClearanceItem::STATUS_APPROVED, ClearanceItem::STATUS_REJECTED])],
            'remark' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
