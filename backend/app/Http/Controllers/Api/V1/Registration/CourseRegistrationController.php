<?php

namespace App\Http\Controllers\Api\V1\Registration;

use App\Http\Controllers\Controller;
use App\Http\Requests\Registration\UpdateRegistrationItemsRequest;
use App\Http\Resources\CourseRegistrationResource;
use App\Http\Responses\ApiResponse;
use App\Models\AcademicSession;
use App\Models\CourseOffering;
use App\Models\CourseRegistration;
use App\Models\Semester;
use App\Services\CourseRegistrationService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class CourseRegistrationController extends Controller
{
    use ApiResponse;

    private const WITH = ['academicSession', 'semester', 'student.user', 'items.courseOffering.course', 'items.courseOffering.level'];

    /** The authenticated student's own registrations, across all semesters. */
    public function index()
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record found for this account.', [], 404);
        }

        $registrations = CourseRegistration::with(self::WITH)
            ->where('student_id', $student->id)
            ->orderByDesc('id')
            ->get();

        return $this->success(CourseRegistrationResource::collection($registrations));
    }

    /**
     * Gets-or-creates the DRAFT registration for the current semester —
     * mirrors ApplicationController::store()'s pattern from Phase 4.
     */
    public function store()
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record found for this account.', [], 404);
        }

        $session = AcademicSession::current();
        $semester = $session ? Semester::where('academic_session_id', $session->id)->where('is_current', true)->first() : null;

        if (! $session || ! $semester) {
            return $this->fail('No academic session/semester is currently open.', [], 422);
        }

        $registration = CourseRegistration::firstOrCreate(
            ['student_id' => $student->id, 'semester_id' => $semester->id],
            ['academic_session_id' => $session->id, 'status' => CourseRegistration::STATUS_DRAFT]
        );

        return $this->success(new CourseRegistrationResource($registration->load(self::WITH)), 'Registration ready.', 201);
    }

    public function show(CourseRegistration $courseRegistration)
    {
        $this->authorize('view', $courseRegistration);

        return $this->success(new CourseRegistrationResource($courseRegistration->load(self::WITH)));
    }

    /**
     * Replaces the full set of registered course offerings — same
     * "replace, don't diff" pattern as Phase 4's education records, and
     * validated by the SAME CourseRegistrationService used at submit time
     * so there's exactly one source of truth for what's allowed.
     */
    public function update(UpdateRegistrationItemsRequest $request, CourseRegistration $courseRegistration, CourseRegistrationService $validator)
    {
        $this->authorize('update', $courseRegistration);

        $offerings = CourseOffering::with(['course.prerequisites', 'level'])
            ->whereIn('id', $request->input('course_offering_ids', []))
            ->get();

        $errors = $validator->validate($courseRegistration->student, $courseRegistration->semester, $offerings);
        // Credit/window/prerequisite errors are warnings at draft-save time
        // (only "duplicate" and "wrong programme" block saving a draft) —
        // full enforcement happens at submit().
        $blocking = array_intersect_key($errors, array_flip(['course_offering_ids']));
        if (! empty($blocking)) {
            return $this->fail('Could not save these course selections.', $blocking, 422);
        }

        DB::transaction(function () use ($courseRegistration, $offerings) {
            $courseRegistration->items()->delete();
            foreach ($offerings as $offering) {
                $courseRegistration->items()->create([
                    'course_offering_id' => $offering->id,
                    'is_carryover' => $offering->level_id !== $courseRegistration->student->current_level_id,
                ]);
            }
        });

        return $this->success(new CourseRegistrationResource($courseRegistration->fresh(self::WITH)), 'Course selections saved.');
    }

    /** Backend re-validates everything — never trusts the wizard's client-side checks. */
    public function submit(CourseRegistration $courseRegistration, CourseRegistrationService $validator)
    {
        $this->authorize('submit', $courseRegistration);

        $offerings = $courseRegistration->items()->with('courseOffering.course.prerequisites')->get()
            ->map(fn ($item) => $item->courseOffering);

        $errors = $validator->validate($courseRegistration->student, $courseRegistration->semester, collect($offerings));
        if (! empty($errors)) {
            return $this->fail('This registration is not yet valid for submission.', $errors, 422);
        }

        $courseRegistration->update([
            'status' => CourseRegistration::STATUS_SUBMITTED,
            'submitted_at' => now(),
        ]);

        return $this->success(new CourseRegistrationResource($courseRegistration->fresh(self::WITH)), 'Registration submitted.');
    }
}
