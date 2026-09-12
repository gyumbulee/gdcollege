<?php

namespace App\Http\Controllers\Api\V1\Registration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Registration\RegistrationDecisionRequest;
use App\Http\Resources\CourseRegistrationResource;
use App\Http\Responses\ApiResponse;
use App\Models\CourseRegistration;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

/**
 * Staff (HOD/Academic Officer) side of registration approval.
 *
 * KNOWN SIMPLIFICATION: the spec's role model scopes an HOD to their own
 * department (role_user.scope_type/scope_id, from Phase 1), but that scope
 * is not yet enforced here — any account with `course_registrations.approve`
 * can act on any registration, department-blind. Wiring real department
 * scoping needs a small policy check (registration.student.programme
 * .department_id === the HOD's role_user scope_id) that's straightforward
 * to add once that scoping is exercised elsewhere too, rather than
 * building it once, ad hoc, here.
 */
class StaffCourseRegistrationController extends Controller
{
    use ApiResponse;

    private const WITH = ['academicSession', 'semester', 'student.user', 'items.courseOffering.course', 'items.courseOffering.level'];

    public function index(Request $request)
    {
        $query = CourseRegistration::with(self::WITH);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        } else {
            $query->where('status', '!=', CourseRegistration::STATUS_DRAFT);
        }

        return $this->success(CourseRegistrationResource::collection(
            $query->orderByDesc('submitted_at')->paginate($request->integer('per_page', 25))
        ));
    }

    public function show(CourseRegistration $courseRegistration)
    {
        return $this->success(new CourseRegistrationResource($courseRegistration->load(self::WITH)));
    }

    public function approve(CourseRegistration $courseRegistration, AuditLogger $audit)
    {
        if ($courseRegistration->status !== CourseRegistration::STATUS_SUBMITTED) {
            return $this->fail('Only a SUBMITTED registration can be approved.', [], 422);
        }

        $courseRegistration->update([
            'status' => CourseRegistration::STATUS_APPROVED,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
        ]);

        $audit->log('course_registrations.approve', $courseRegistration);

        return $this->success(new CourseRegistrationResource($courseRegistration->fresh(self::WITH)), 'Registration approved.');
    }

    public function reject(RegistrationDecisionRequest $request, CourseRegistration $courseRegistration, AuditLogger $audit)
    {
        if ($courseRegistration->status !== CourseRegistration::STATUS_SUBMITTED) {
            return $this->fail('Only a SUBMITTED registration can be returned.', [], 422);
        }

        $courseRegistration->update([
            'status' => CourseRegistration::STATUS_REJECTED,
            'rejection_reason' => $request->input('reason'),
        ]);

        $audit->log('course_registrations.reject', $courseRegistration, null, ['reason' => $request->input('reason')]);

        return $this->success(new CourseRegistrationResource($courseRegistration->fresh(self::WITH)), 'Registration returned to student.');
    }
}
