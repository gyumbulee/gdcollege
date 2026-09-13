<?php

namespace App\Http\Controllers\Api\V1\Results;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResultResource;
use App\Http\Responses\ApiResponse;
use App\Models\Result;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

/**
 * Staff side of the result pipeline: SUBMITTED -[review]-> REVIEWED
 * -[verify]-> VERIFIED -[approve]-> APPROVED -[publish]-> PUBLISHED. Each
 * transition is its own permission (results.review/verify/approve/publish
 * — the spec's own §4 slugs), so a given staff member typically holds
 * only the ones matching their stage (HOD reviews; Academic Officer
 * verifies/approves/publishes — see RolePermissionSeeder).
 *
 * Department scoping (Phase 9): the `review` transition is the HOD stage
 * (see RolePermissionSeeder — only `hod` holds `results.review`), so it's
 * the one gated by ResultPolicy@review against role_user's department
 * scope. verify/approve/publish belong to the institution-wide Academic
 * Officer role and stay unscoped, matching CourseRegistrationPolicy's
 * approach for registrations.
 */
class StaffResultReviewController extends Controller
{
    use ApiResponse;

    private const WITH = ['student.user', 'courseOffering.course', 'courseOffering.programme'];

    public function index(Request $request)
    {
        $query = Result::with(self::WITH);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        } else {
            $query->where('status', '!=', Result::STATUS_DRAFT);
        }

        if ($request->filled('course_offering_id')) {
            $query->where('course_offering_id', $request->input('course_offering_id'));
        }

        // Department scoping (Phase 9) — see StaffCourseRegistrationController.
        $scopeIds = $request->user()->departmentScopeIds();
        if (! empty($scopeIds)) {
            $query->whereHas('courseOffering.programme', fn ($q) => $q->whereIn('department_id', $scopeIds));
        }

        return $this->success(ResultResource::collection(
            $query->orderByDesc('submitted_at')->paginate($request->integer('per_page', 50))
        ));
    }

    public function review(Result $result, AuditLogger $audit)
    {
        $this->authorize('review', $result);

        return $this->transition($result, Result::STATUS_SUBMITTED, Result::STATUS_REVIEWED, 'reviewed_by', 'reviewed_at', $audit, 'results.review');
    }

    public function verify(Result $result, AuditLogger $audit)
    {
        return $this->transition($result, Result::STATUS_REVIEWED, Result::STATUS_VERIFIED, 'verified_by', 'verified_at', $audit, 'results.verify');
    }

    public function approve(Result $result, AuditLogger $audit)
    {
        return $this->transition($result, Result::STATUS_VERIFIED, Result::STATUS_APPROVED, 'approved_by', 'approved_at', $audit, 'results.approve');
    }

    /** Publication is the terminal, locked state — visible to the student from here on. */
    public function publish(Result $result, AuditLogger $audit)
    {
        if ($result->status !== Result::STATUS_APPROVED) {
            return $this->fail('Only an APPROVED result can be published.', [], 422);
        }

        $result->update(['status' => Result::STATUS_PUBLISHED, 'published_at' => now()]);
        $audit->log('results.publish', $result);

        return $this->success(new ResultResource($result->fresh(self::WITH)), 'Result published.');
    }

    private function transition(Result $result, string $from, string $to, string $byField, string $atField, AuditLogger $audit, string $auditAction)
    {
        if ($result->status !== $from) {
            return $this->fail("Result must be {$from} for this action.", [], 422);
        }

        $result->update([
            'status' => $to,
            $byField => auth()->id(),
            $atField => now(),
        ]);

        $audit->log($auditAction, $result);

        return $this->success(new ResultResource($result->fresh(self::WITH)), 'Result updated.');
    }
}
