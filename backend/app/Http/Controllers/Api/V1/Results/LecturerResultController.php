<?php

namespace App\Http\Controllers\Api\V1\Results;

use App\Http\Controllers\Controller;
use App\Http\Requests\Results\UpsertResultScoresRequest;
use App\Http\Resources\ResultResource;
use App\Http\Responses\ApiResponse;
use App\Models\CourseOffering;
use App\Models\Result;
use App\Services\GradeCalculator;
use Illuminate\Support\Facades\DB;

class LecturerResultController extends Controller
{
    use ApiResponse;

    private const WITH = ['student.user', 'courseOffering.course'];

    public function index(CourseOffering $courseOffering)
    {
        $this->authorize('manageResults', $courseOffering);

        $results = Result::with(self::WITH)->where('course_offering_id', $courseOffering->id)->get();

        return $this->success(ResultResource::collection($results));
    }

    /**
     * Bulk upsert (save draft) for a whole roster at once — see
     * UpsertResultScoresRequest. Computes total_score/grade immediately
     * so the lecturer sees it before submitting, but the row stays DRAFT
     * (editable) until submit() locks it.
     */
    public function upsert(UpsertResultScoresRequest $request, CourseOffering $courseOffering, GradeCalculator $calculator)
    {
        $this->authorize('manageResults', $courseOffering);

        $errors = [];
        foreach ($request->input('scores', []) as $i => $row) {
            $rowErrors = $calculator->validateComponentScores($row['component_scores']);
            if (! empty($rowErrors)) {
                $errors["scores.{$i}"] = $rowErrors;
            }
        }
        if (! empty($errors)) {
            return $this->fail('Some scores are invalid.', $errors, 422);
        }

        $results = DB::transaction(function () use ($request, $courseOffering, $calculator) {
            $saved = [];
            foreach ($request->input('scores', []) as $row) {
                $existing = Result::where('course_offering_id', $courseOffering->id)
                    ->where('student_id', $row['student_id'])->first();

                if ($existing && ! $existing->isEditableByLecturer()) {
                    // Already submitted — skip silently rather than error the
                    // whole batch over one locked row.
                    $saved[] = $existing;
                    continue;
                }

                $total = $calculator->total($row['component_scores']);
                $scale = $calculator->grade($total);

                $saved[] = Result::updateOrCreate(
                    ['course_offering_id' => $courseOffering->id, 'student_id' => $row['student_id']],
                    [
                        'component_scores' => $row['component_scores'],
                        'total_score' => $total,
                        'grade' => $scale?->grade,
                        'grade_point' => $scale?->grade_point,
                        'status' => Result::STATUS_DRAFT,
                    ]
                );
            }

            return $saved;
        });

        return $this->success(ResultResource::collection(
            Result::with(self::WITH)->whereIn('id', collect($results)->pluck('id'))->get()
        ), 'Scores saved.');
    }

    /**
     * Submits every DRAFT result for this offering at once — after this,
     * normal lecturer editing is disabled (§16), matching the spec
     * exactly. Already-submitted rows are left untouched (idempotent).
     */
    public function submit(CourseOffering $courseOffering)
    {
        $this->authorize('manageResults', $courseOffering);

        $updated = Result::where('course_offering_id', $courseOffering->id)
            ->where('status', Result::STATUS_DRAFT)
            ->update(['status' => Result::STATUS_SUBMITTED, 'submitted_at' => now()]);

        if ($updated === 0) {
            return $this->fail('No draft results to submit for this course.', [], 422);
        }

        $results = Result::with(self::WITH)->where('course_offering_id', $courseOffering->id)->get();

        return $this->success(ResultResource::collection($results), "Submitted {$updated} result(s) for review.");
    }
}
