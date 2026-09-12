<?php

namespace App\Http\Requests\Registration;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRegistrationItemsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'course_offering_ids' => ['present', 'array'],
            'course_offering_ids.*' => ['exists:course_offerings,id'],
        ];
    }
}
