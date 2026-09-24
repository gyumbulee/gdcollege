<?php

namespace App\Http\Controllers\Api\V1\Registration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Registration\RegistrationDecisionRequest;
use App\Http\Resources\CourseRegistrationResource;
use App\Http\Responses\ApiResponse;
use App\Models\CourseRegistration;
use App\Services\AuditLogger;
use App\Services\NotificationDispatcher;
use Illuminate\Http\Request;

/**
 * Staff (HOD/Academic Officer) side of registration approval.
 *
 * Department scoping: an HOD with a role_user.scope_type='department' row
 * (Phase 1) can only approve/reject registrations for students in that
 * department — enforced by CourseRegistrationPolicy@approve/reject (Phase
 * 9). A user with no department scope configured is unrestricted by scope
 * (the `course_registrations.approve` permission middleware already
 * gated the ability).
 */
class StaffCourseRegistrationController extends Controller
{
    use ApiResponse;

    private const WITH = ['academicSession', 'semester', 'student.user', 'student.programme', 'items.courseOffering.course', 'items.courseOffering.level'];

    public function index(Request $request)
    {
        $query = CourseRegistration::with(self::WITH);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        } else {
            $query->where('status', '!=', CourseRegistration::STATUS_DRAFT);
        }

        // Department scoping (Phase 9): mirrors CourseRegistrationPolicy@approve
        // — an HOD scoped to a department only sees that department's
        // registrations here; unscoped accounts (or non-HOD roles holding
        // course_registrations.view) are unrestricted.
        $scopeIds = $request->user()->departmentScopeIds();
        if (! empty($scopeIds)) {
            $query->whereHas('student.programme', fn ($q) => $q->whereIn('department_id', $scopeIds));
        }

        return $this->success(CourseRegistrationResource::collection(
            $query->orderByDesc('submitted_at')->paginate($request->integer('per_page', 25))
        ));
    }

    public function show(CourseRegistration $courseRegistration)
    {
        return $this->success(new CourseRegistrationResource($courseRegistration->load(self::WITH)));
    }

    public function approve(CourseRegistration $courseRegistration, AuditLogger $audit, NotificationDispatcher $notifications)
    {
        $this->authorize('approve', $courseRegistration);

        if ($courseRegistration->status !== CourseRegistration::STATUS_SUBMITTED) {
            return $this->fail('Only a SUBMITTED registration can be approved.', [], 422);
        }

        $courseRegistration->update([
            'status' => CourseRegistration::STATUS_APPROVED,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        $audit->log('course_registrations.approve', $courseRegistration);

        $notifications->toUser(
            $courseRegistration->student->user_id,
            'course_registrations.approved',
            'Course registration approved',
            'Your course registration has been approved.',
            '/student/registration'
        );

        return $this->success(new CourseRegistrationResource($courseRegistration->fresh(self::WITH)), 'Registration approved.');
    }

    public function reject(RegistrationDecisionRequest $request, CourseRegistration $courseRegistration, AuditLogger $audit, NotificationDispatcher $notifications)
    {
        $this->authorize('reject', $courseRegistration);

        if ($courseRegistration->status !== CourseRegistration::STATUS_SUBMITTED) {
            return $this->fail('Only a SUBMITTED registration can be returned.', [], 422);
        }

        $courseRegistration->update([
            'status' => CourseRegistration::STATUS_REJECTED,
            'rejection_reason' => $request->input('reason'),
        ]);

        $audit->log('course_registrations.reject', $courseRegistration, null, ['reason' => $request->input('reason')]);

        $notifications->toUser(
            $courseRegistration->student->user_id,
            'course_registrations.rejected',
            'Course registration returned',
            $request->input('reason') ? 'Returned: '.$request->input('reason') : 'Your course registration was returned for changes.',
            '/student/registration'
        );

        return $this->success(new CourseRegistrationResource($courseRegistration->fresh(self::WITH)), 'Registration returned to student.');
    }
}
