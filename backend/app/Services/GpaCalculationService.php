<?php

namespace App\Services;

use App\Models\Result;
use Illuminate\Support\Collection;

/**
 * Quality-point GPA/CGPA aggregation, per the platform spec's §14 formula:
 *
 *   Quality Points = Grade Point × Credit Unit
 *   GPA = Total Quality Points / Applicable Credits
 *
 * This did not exist anywhere in the codebase before Phase 13 — Results
 * (Phase 8) only ever computed a per-course total/grade via GradeCalculator,
 * never rolled results up into a student-level GPA. Building it here because
 * the Management Dashboard's "Academic Performance" KPI needs it; it is
 * intentionally the simplest correct reading of §14, not a finished
 * implementation of §14 in full:
 *
 *   - It averages every PUBLISHED result the student has, unweighted by
 *     session/level. It does NOT implement "repeated/carryover course
 *     treatment" (§14 says this must be configurable, and no institutional
 *     policy for it has been supplied — e.g. whether a repeated course's
 *     old attempt is excluded from the average or both attempts count).
 *     Until that policy exists, a carried-over course's earlier failing
 *     attempt is counted alongside the repeat, which is the more
 *     conservative (not the more flattering) reading.
 *   - It does not yet feed §15 Academic Progression (GOOD_STANDING /
 *     PROBATION / AT_RISK) — that also needs an institutional policy that
 *     hasn't been supplied, so Student has no progression-status field yet.
 *     Documented as an open gap in docs/PROJECT_STATUS.md rather than
 *     guessed at here.
 */
class GpaCalculationService
{
    /**
     * Cumulative GPA for one student, across every PUBLISHED result with a
     * recorded grade point and a course with configured credit units. Null
     * if the student has no such results yet.
     */
    public function cumulativeGpaForStudent(int $studentId): ?float
    {
        $results = Result::query()
            ->where('student_id', $studentId)
            ->where('status', Result::STATUS_PUBLISHED)
            ->whereNotNull('grade_point')
            ->with('courseOffering.course')
            ->get();

        return $this->weightedAverage($results);
    }

    /**
     * Institution-wide (or pre-filtered, via $studentIds/$courseOfferingScope)
     * snapshot for the Management Dashboard: average CGPA across students who
     * have at least one published, gradable result, plus the grade
     * distribution among those results.
     *
     * @param  Collection<int,int>|array<int>  $studentIds
     * @param  \Closure|null  $courseOfferingScope  Optional query constraint applied via whereHas('courseOffering', ...) — used to further narrow by programme/level/session filters selected on the dashboard.
     */
    public function snapshotForStudents(Collection|array $studentIds, ?\Closure $courseOfferingScope = null): array
    {
        $studentIds = $studentIds instanceof Collection ? $studentIds->all() : $studentIds;

        if (empty($studentIds)) {
            return [
                'average_cgpa' => null,
                'students_with_published_results' => 0,
                'grade_distribution' => [],
            ];
        }

        $query = Result::query()
            ->whereIn('student_id', $studentIds)
            ->where('status', Result::STATUS_PUBLISHED)
            ->whereNotNull('grade_point');

        if ($courseOfferingScope) {
            $query->whereHas('courseOffering', $courseOfferingScope);
        }

        $results = $query->with('courseOffering.course')->get();

        $perStudentGpa = $results
            ->groupBy('student_id')
            ->map(fn (Collection $rows) => $this->weightedAverage($rows))
            ->filter(fn ($gpa) => $gpa !== null);

        return [
            'average_cgpa' => $perStudentGpa->isEmpty() ? null : round((float) $perStudentGpa->avg(), 2),
            'students_with_published_results' => $perStudentGpa->count(),
            'grade_distribution' => $results->groupBy('grade')->map->count()->sortKeys(),
        ];
    }

    /** @param  Collection<int,Result>  $results */
    private function weightedAverage(Collection $results): ?float
    {
        $totalPoints = 0.0;
        $totalUnits = 0;

        foreach ($results as $result) {
            $units = $result->courseOffering?->course?->credit_units;

            if (! $units || $result->grade_point === null) {
                continue;
            }

            $totalPoints += ((float) $result->grade_point) * $units;
            $totalUnits += $units;
        }

        return $totalUnits > 0 ? round($totalPoints / $totalUnits, 2) : null;
    }
}
