<?php

namespace App\Http\Controllers\Api\V1\Management;

use App\Http\Controllers\Api\V1\Management\Concerns\ResolvesManagementFilters;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Admission;
use App\Models\Application;
use App\Models\CourseOffering;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Student;
use App\Models\User;
use App\Services\GpaCalculationService;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

/**
 * Executive dashboard (Phase 13 — Management & Reporting; §29/§38 of the
 * platform spec). Read-only, institution-wide, filterable by session /
 * school / department / programme / level — never scoped to "my
 * department" the way HOD's dashboard is.
 *
 * Deliberately gated by the `reports.view` permission rather than
 * `role:management`, so it inherits the same super-admin bypass every
 * other permission-gated route gets (EnsureRole has no such bypass — see
 * its docblock) and so ICT/Super Administrator can review it without
 * needing a second role grant.
 *
 * Management holds only view-level permissions in RolePermissionSeeder
 * (`students.view`, `applications.view`, `payments.view`, `invoices.view`,
 * `results.view`, `audit_logs.view`, now `reports.view`) — no `.manage`
 * permissions — which is the enforcement of §29's "Management must not
 * automatically receive system-administration privileges."
 */
class ManagementDashboardController extends Controller
{
    use ApiResponse, ResolvesManagementFilters;

    public function index(Request $request, GpaCalculationService $gpa)
    {
        $filters = $this->resolveFilters($request);

        return $this->success([
            'filters_applied' => $filters['echo'],
            'students' => $this->studentStats($filters),
            'admissions' => $this->admissionStats($filters),
            'staff' => $this->staffStats($filters),
            'finance' => $this->financeStats($filters),
            'academic_performance' => $this->academicPerformance($filters, $gpa),
            'graduation' => $this->graduationStats($filters),
        ]);
    }

    private function studentStats(array $filters): array
    {
        $base = $this->scopedStudents($filters);

        $byStatus = (clone $base)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        $byLevel = (clone $base)->join('levels', 'levels.id', '=', 'students.current_level_id')
            ->selectRaw('levels.name as level, count(*) as total')
            ->groupBy('levels.name')
            ->orderBy('levels.name')
            ->pluck('total', 'level');

        $byProgramme = (clone $base)->join('programmes', 'programmes.id', '=', 'students.programme_id')
            ->selectRaw('programmes.id, programmes.name as programme, count(*) as total')
            ->groupBy('programmes.id', 'programmes.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['programme_id' => $row->id, 'programme' => $row->programme, 'total' => (int) $row->total]);

        $bySchool = (clone $base)
            ->join('programmes', 'programmes.id', '=', 'students.programme_id')
            ->join('departments', 'departments.id', '=', 'programmes.department_id')
            ->join('schools', 'schools.id', '=', 'departments.school_id')
            ->selectRaw('schools.id, schools.name as school, count(*) as total')
            ->groupBy('schools.id', 'schools.name')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['school_id' => $row->id, 'school' => $row->school, 'total' => (int) $row->total]);

        return [
            'total' => (clone $base)->count(),
            'active' => (clone $base)->where('status', Student::STATUS_ACTIVE)->count(),
            'by_status' => $byStatus,
            'by_level' => $byLevel,
            'by_programme' => $byProgramme,
            'by_school' => $bySchool,
        ];
    }

    private function admissionStats(array $filters): array
    {
        $applications = Application::query()
            ->when($filters['session_id'], fn ($q, $id) => $q->where('academic_session_id', $id))
            ->when($filters['programme_ids'], fn ($q, $ids) => $q->whereIn('programme_id', $ids));

        $totalApplications = (clone $applications)->count();
        $totalApplicants = (clone $applications)->distinct('applicant_id')->count('applicant_id');

        $byStatus = (clone $applications)->selectRaw('status, count(*) as total')->groupBy('status')->pluck('total', 'status');

        $applicationIds = (clone $applications)->pluck('id');

        $byDecision = Admission::query()
            ->whereIn('application_id', $applicationIds)
            ->selectRaw('decision, count(*) as total')
            ->groupBy('decision')
            ->pluck('total', 'decision');

        $trend = Application::query()
            ->when($filters['programme_ids'], fn ($q, $ids) => $q->whereIn('programme_id', $ids))
            ->join('academic_sessions', 'academic_sessions.id', '=', 'applications.academic_session_id')
            ->selectRaw('academic_sessions.name as session, count(*) as total')
            ->groupBy('academic_sessions.name')
            ->orderBy('academic_sessions.name')
            ->pluck('total', 'session');

        return [
            'total_applicants' => $totalApplicants,
            'total_applications' => $totalApplications,
            'by_status' => $byStatus,
            'by_decision' => $byDecision,
            'admissions_trend_by_session' => $trend,
        ];
    }

    private function staffStats(array $filters): array
    {
        $totalActiveStaff = User::query()
            ->where('status', 'active')
            ->whereHas('roles', fn ($q) => $q->whereNotIn('slug', ['applicant', 'student']))
            ->count();

        $lecturersInScope = CourseOffering::query()
            ->when($filters['programme_ids'], fn ($q, $ids) => $q->whereIn('programme_id', $ids))
            ->when($filters['level_id'], fn ($q, $id) => $q->where('level_id', $id))
            ->when($filters['session_id'], fn ($q, $id) => $q->where('academic_session_id', $id))
            ->whereNotNull('lecturer_id')
            ->distinct('lecturer_id')
            ->count('lecturer_id');

        return [
            'total_active_staff' => $totalActiveStaff,
            'lecturers_in_scope' => $lecturersInScope,
        ];
    }

    private function financeStats(array $filters): array
    {
        $studentIds = $this->scopedStudents($filters)->pluck('id');

        $invoices = Invoice::query()
            ->whereIn('student_id', $studentIds)
            ->when($filters['session_id'], fn ($q, $id) => $q->where('academic_session_id', $id))
            ->where('status', '!=', Invoice::STATUS_VOID);

        $payments = Payment::query()
            ->whereIn('student_id', $studentIds)
            ->where('status', Payment::STATUS_SUCCESSFUL);

        $revenueTrend = (clone $payments)
            ->whereNotNull('paid_at')
            ->where('paid_at', '>=', Carbon::now()->subMonths(5)->startOfMonth())
            ->selectRaw("DATE_FORMAT(paid_at, '%Y-%m') as month, sum(amount) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->get()
            ->map(fn ($row) => ['month' => $row->month, 'amount' => (float) $row->total]);

        return [
            'total_invoiced' => (float) (clone $invoices)->sum('total_amount'),
            'total_collected' => (float) (clone $invoices)->sum('amount_paid'),
            'total_outstanding' => (float) (clone $invoices)->sum('balance'),
            'revenue_trend_last_6_months' => $revenueTrend,
        ];
    }

    private function academicPerformance(array $filters, GpaCalculationService $gpa): array
    {
        $studentIds = $this->scopedStudents($filters)->pluck('id');

        $scope = null;
        if ($filters['programme_ids'] || $filters['level_id'] || $filters['session_id']) {
            $scope = function ($q) use ($filters) {
                $q->when($filters['programme_ids'], fn ($qq, $ids) => $qq->whereIn('programme_id', $ids))
                    ->when($filters['level_id'], fn ($qq, $id) => $qq->where('level_id', $id))
                    ->when($filters['session_id'], fn ($qq, $id) => $qq->where('academic_session_id', $id));
            };
        }

        return $gpa->snapshotForStudents($studentIds, $scope);
    }

    /**
     * `graduated_at` is set the moment a student's status actually
     * changes to GRADUATED (see StudentController::updateStatus()) —
     * this trend is real, not backdated or inferred from a session link.
     */
    private function graduationStats(array $filters): array
    {
        $graduated = (clone $this->scopedStudents($filters))->where('status', Student::STATUS_GRADUATED);

        $byMonth = (clone $graduated)
            ->whereNotNull('graduated_at')
            ->selectRaw("DATE_FORMAT(graduated_at, '%Y-%m') as month, count(*) as total")
            ->groupBy('month')
            ->orderBy('month')
            ->pluck('total', 'month');

        return [
            'total_graduated' => $graduated->count(),
            'trend' => $byMonth,
        ];
    }
}
