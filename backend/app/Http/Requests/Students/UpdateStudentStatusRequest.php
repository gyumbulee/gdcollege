<?php

namespace App\Http\Requests\Students;

use App\Models\Student;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([
                Student::STATUS_ACTIVE, Student::STATUS_DEFERRED, Student::STATUS_SUSPENDED,
                Student::STATUS_WITHDRAWN, Student::STATUS_EXPELLED, Student::STATUS_GRADUATED,
            ])],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
