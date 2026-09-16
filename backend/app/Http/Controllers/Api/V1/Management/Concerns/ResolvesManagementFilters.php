<?php

namespace App\Http\Controllers\Api\V1\Management\Concerns;

use App\Models\Programme;
use App\Models\Student;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;

/**
 * Shared by ManagementDashboardController and ManagementReportController so
 * the dashboard's KPIs and the exportable report of the same filtered set
 * never drift apart. Filters are exactly §29's list: Session, School,
 * Department, Programme, Level.
 */
trait ResolvesManagementFilters
{
    private function resolveFilters(Request $request): array
    {
        $sessionId = $request->integer('academic_session_id') ?: null;
        $schoolId = $request->integer('school_id') ?: null;
        $departmentId = $request->integer('department_id') ?: null;
        $programmeId = $request->integer('programme_id') ?: null;
        $levelId = $request->integer('level_id') ?: null;

        $programmeIds = null;
        if ($schoolId || $departmentId || $programmeId) {
            $programmeIds = Programme::query()
                ->when($programmeId, fn ($q) => $q->where('id', $programmeId))
                ->when($departmentId, fn ($q) => $q->where('department_id', $departmentId))
                ->when($schoolId && ! $departmentId, fn ($q) => $q->whereHas(
                    'department',
                    fn ($q2) => $q2->where('school_id', $schoolId)
                ))
                ->pluck('id');
        }

        return [
            'session_id' => $sessionId,
            'school_id' => $schoolId,
            'department_id' => $departmentId,
            'programme_id' => $programmeId,
            'level_id' => $levelId,
            'programme_ids' => $programmeIds,
            'echo' => [
                'academic_session_id' => $sessionId,
                'school_id' => $schoolId,
                'department_id' => $departmentId,
                'programme_id' => $programmeId,
                'level_id' => $levelId,
            ],
        ];
    }

    private function scopedStudents(array $filters): Builder
    {
        return Student::query()
            ->when($filters['programme_ids'], fn ($q, $ids) => $q->whereIn('programme_id', $ids))
            ->when($filters['level_id'], fn ($q, $id) => $q->where('current_level_id', $id))
            ->when($filters['session_id'], fn ($q, $id) => $q->where('admission_academic_session_id', $id));
    }
}
