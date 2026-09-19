<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class PostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** `sometimes` throughout, including title/content — see EventRequest's docblock for why: this backs both a full create/edit form and a partial "just toggle status" publish action. */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'excerpt' => ['sometimes', 'nullable', 'string', 'max:500'],
            'content' => ['sometimes', 'required', 'string'],
            'status' => ['sometimes', 'in:DRAFT,PUBLISHED'],
            'cover_image' => ['sometimes', 'nullable', 'image', 'max:4096'],
        ];
    }
}
