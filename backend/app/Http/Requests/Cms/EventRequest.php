<?php

namespace App\Http\Requests\Cms;

use Illuminate\Foundation\Http\FormRequest;

class EventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * `sometimes` on every field — including title/starts_at, which read
     * as though they should be unconditionally required — because this
     * same FormRequest backs both store() (where the frontend always
     * sends them) and update() (where a quick "just toggle status"
     * PATCH sends only `status`). Plain `required` here would reject
     * that PATCH for omitting fields it was never trying to change.
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string'],
            'starts_at' => ['sometimes', 'required', 'date'],
            'ends_at' => ['sometimes', 'nullable', 'date', 'after_or_equal:starts_at'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:DRAFT,PUBLISHED'],
            'cover_image' => ['sometimes', 'nullable', 'image', 'max:4096'],
        ];
    }
}
