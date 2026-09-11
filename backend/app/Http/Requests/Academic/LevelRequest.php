<?php

namespace App\Http\Requests\Academic;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class LevelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $levelId = $this->route('level')?->id;

        return [
            'name' => ['required', 'string', 'max:50', Rule::unique('levels', 'name')->ignore($levelId)],
            'sort_order' => ['integer', 'min:1'],
        ];
    }
}
