<?php

namespace App\Http\Requests\Documents;

use App\Models\DocumentTemplate;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentRequestCreateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in([
                DocumentTemplate::TYPE_TRANSCRIPT,
                DocumentTemplate::TYPE_STATEMENT_OF_RESULT,
                DocumentTemplate::TYPE_CLEARANCE_CERTIFICATE,
            ])],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
