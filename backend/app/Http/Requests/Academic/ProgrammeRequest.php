<?php

namespace App\Http\Requests\Academic;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProgrammeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $programmeId = $this->route('programme')?->id;

        return [
            'department_id' => ['required', 'exists:departments,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('programmes', 'slug')->ignore($programmeId)],
            'award_type' => ['required', 'string', 'max:50'],
            'duration_levels' => ['required', 'integer', 'min:1', 'max:10'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ];
    }
}
