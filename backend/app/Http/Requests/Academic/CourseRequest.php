<?php

namespace App\Http\Requests\Academic;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $courseId = $this->route('course')?->id;

        return [
            'code' => ['required', 'string', 'max:20', Rule::unique('courses', 'code')->ignore($courseId)],
            'title' => ['required', 'string', 'max:255'],
            'credit_units' => ['required', 'integer', 'min:1', 'max:12'],
            'course_type_id' => ['nullable', 'exists:course_types,id'],
            'description' => ['nullable', 'string'],
            'prerequisite_course_ids' => ['array'],
            'prerequisite_course_ids.*' => ['exists:courses,id'],
        ];
    }
}
