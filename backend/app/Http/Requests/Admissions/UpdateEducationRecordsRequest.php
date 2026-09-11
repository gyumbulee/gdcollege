<?php

namespace App\Http\Requests\Admissions;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEducationRecordsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'records' => ['present', 'array'],
            'records.*.exam_body' => ['required', 'string', 'max:50'],
            'records.*.exam_number' => ['nullable', 'string', 'max:50'],
            'records.*.exam_year' => ['required', 'integer', 'min:1990', 'max:' . (int) date('Y')],
            'records.*.school_attended' => ['nullable', 'string', 'max:255'],
            'records.*.subjects' => ['required', 'array', 'min:1'],
            'records.*.subjects.*.subject' => ['required', 'string', 'max:100'],
            'records.*.subjects.*.grade' => ['required', 'string', 'max:10'],
        ];
    }
}
