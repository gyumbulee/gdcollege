<?php

namespace App\Http\Requests\Results;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Bulk save for a whole course offering's roster at once — one row per
 * student, matching the spec's result-entry table (§16: Matric No |
 * Student | CA | Exam | Total | Grade). Component max-score validation
 * happens in GradeCalculator, not here, since the valid component names
 * are DB-configured, not fixed at request-validation time.
 */
class UpsertResultScoresRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'scores' => ['present', 'array'],
            'scores.*.student_id' => ['required', 'exists:students,id'],
            'scores.*.component_scores' => ['required', 'array'],
        ];
    }
}
