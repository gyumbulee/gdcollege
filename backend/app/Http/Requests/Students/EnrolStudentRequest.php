<?php

namespace App\Http\Requests\Students;

use Illuminate\Foundation\Http\FormRequest;

class EnrolStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'academic_session_id' => ['required', 'exists:academic_sessions,id'],
            'level_id' => ['required', 'exists:levels,id'],
            'programme_id' => ['nullable', 'exists:programmes,id'],
        ];
    }
}
