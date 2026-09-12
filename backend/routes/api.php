<?php

use App\Http\Controllers\Api\V1\Academic\AcademicSessionController;
use App\Http\Controllers\Api\V1\Academic\CourseController;
use App\Http\Controllers\Api\V1\Academic\CourseOfferingController;
use App\Http\Controllers\Api\V1\Academic\CourseTypeController;
use App\Http\Controllers\Api\V1\Academic\DepartmentController;
use App\Http\Controllers\Api\V1\Academic\LevelController;
use App\Http\Controllers\Api\V1\Academic\ProgrammeController;
use App\Http\Controllers\Api\V1\Academic\SchoolController;
use App\Http\Controllers\Api\V1\Academic\SemesterController;
use App\Http\Controllers\Api\V1\Admissions\AdmissionListController;
use App\Http\Controllers\Api\V1\Admissions\ApplicationController;
use App\Http\Controllers\Api\V1\Admissions\ApplicationDocumentController;
use App\Http\Controllers\Api\V1\Admissions\ApplicationEducationController;
use App\Http\Controllers\Api\V1\Admissions\StaffApplicationController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Registration\CourseRegistrationController;
use App\Http\Controllers\Api\V1\Registration\StaffCourseRegistrationController;
use App\Http\Controllers\Api\V1\Results\LecturerCourseController;
use App\Http\Controllers\Api\V1\Results\LecturerResultController;
use App\Http\Controllers\Api\V1\Results\ResultComponentController;
use App\Http\Controllers\Api\V1\Results\StaffResultReviewController;
use App\Http\Controllers\Api\V1\Results\StudentResultController;
use App\Http\Controllers\Api\V1\Students\StudentController;
use App\Http\Controllers\Api\V1\Students\StudentEnrolmentController;
use App\Http\Controllers\Api\V1\Students\StudentTransferController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All API routes are versioned under /api/v1/, per the platform's API
| conventions. Protected routes use `auth:sanctum` plus, where a specific
| permission is required, the `permission:<slug>` middleware — see
| App\Http\Middleware\EnsurePermission. Never rely on the frontend to
| gate an action; every protected route below must be independently
| authorized here.
|
*/

Route::prefix('v1')->group(function () {
    Route::get('/health', HealthController::class);

    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);

    /*
    |----------------------------------------------------------------------
    | Public academic structure reads (Phase 3 — Public Website)
    |----------------------------------------------------------------------
    | Schools/departments/programmes are public marketing-site content —
    | the spec's own API examples (§33) list these unauthenticated,
    | alongside /applications and /student/* which DO require auth. Course
    | catalogue detail (courses, offerings, sessions/semesters/levels) stays
    | staff-authenticated below; the public site doesn't need it in Phase 3.
    |----------------------------------------------------------------------
    */
    Route::get('/schools', [SchoolController::class, 'index']);
    Route::get('/schools/{school}', [SchoolController::class, 'show']);
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/departments/{department}', [DepartmentController::class, 'show']);
    Route::get('/programmes', [ProgrammeController::class, 'index']);
    Route::get('/programmes/{programme}', [ProgrammeController::class, 'show']);
    Route::get('/admission-list/search', [AdmissionListController::class, 'search']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);

        /*
        |----------------------------------------------------------------
        | Academic Structure (Phase 2) — staff-authenticated management.
        |----------------------------------------------------------------
        | Writes require the `academic_structure.manage` permission — the
        | spec doesn't name a granular permission per entity here, so this
        | single permission covers schools/departments/programmes/
        | sessions/semesters/levels/course-types; review the assignment in
        | RolePermissionSeeder once Phase 21's admin UI exists. `courses.*`
        | reuses the exact permission slugs already defined in the spec's
        | own permission list. (Read access to schools/departments/
        | programmes is public — see above — so only their writes and the
        | rest of the academic catalogue are registered here.)
        |----------------------------------------------------------------
        */
        Route::apiResource('academic-sessions', AcademicSessionController::class)
            ->parameters(['academic-sessions' => 'academic_session'])
            ->except(['store', 'update', 'destroy']);
        Route::apiResource('semesters', SemesterController::class)
            ->except(['store', 'update', 'destroy']);
        Route::apiResource('levels', LevelController::class)
            ->only(['index']);
        Route::apiResource('course-types', CourseTypeController::class)
            ->only(['index']);
        Route::apiResource('course-offerings', CourseOfferingController::class)
            ->parameters(['course-offerings' => 'course_offering'])
            ->except(['store', 'update', 'destroy']);

        Route::apiResource('courses', CourseController::class)
            ->except(['store', 'update', 'destroy']);

        Route::middleware('permission:academic_structure.manage')->group(function () {
            Route::apiResource('schools', SchoolController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('departments', DepartmentController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('programmes', ProgrammeController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('academic-sessions', AcademicSessionController::class)
                ->parameters(['academic-sessions' => 'academic_session'])
                ->only(['store', 'update', 'destroy']);
            Route::apiResource('semesters', SemesterController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('levels', LevelController::class)->only(['store', 'update', 'destroy']);
            Route::apiResource('course-types', CourseTypeController::class)->only(['store', 'destroy']);
            Route::apiResource('course-offerings', CourseOfferingController::class)
                ->parameters(['course-offerings' => 'course_offering'])
                ->only(['store', 'update', 'destroy']);
        });

        Route::middleware('permission:courses.create')->group(function () {
            Route::post('/courses', [CourseController::class, 'store']);
        });
        Route::middleware('permission:courses.update')->group(function () {
            Route::match(['put', 'patch'], '/courses/{course}', [CourseController::class, 'update']);
            Route::delete('/courses/{course}', [CourseController::class, 'destroy']);
        });

        /*
        |----------------------------------------------------------------
        | Applicant Portal (Phase 4)
        |----------------------------------------------------------------
        | `role:applicant` narrows this to applicant accounts; ownership
        | of the specific application (can this user touch THIS record)
        | is then enforced per-action by ApplicationPolicy via
        | $this->authorize() inside each controller method — never by the
        | frontend, and never by role alone.
        |----------------------------------------------------------------
        */
        Route::middleware('role:applicant')->prefix('applications')->group(function () {
            Route::get('/', [ApplicationController::class, 'index']);
            Route::post('/', [ApplicationController::class, 'store']);
            Route::get('/{application}', [ApplicationController::class, 'show']);
            Route::patch('/{application}', [ApplicationController::class, 'update']);
            Route::post('/{application}/submit', [ApplicationController::class, 'submit']);

            Route::put('/{application}/education', [ApplicationEducationController::class, 'replace']);

            Route::post('/{application}/documents', [ApplicationDocumentController::class, 'store']);
            Route::get('/{application}/documents/{document}/download', [ApplicationDocumentController::class, 'download']);
            Route::delete('/{application}/documents/{document}', [ApplicationDocumentController::class, 'destroy']);
        });

        /*
        |----------------------------------------------------------------
        | Admissions Management (Phase 5) — staff side.
        |----------------------------------------------------------------
        | Every slug here is taken verbatim from the spec's own permission
        | list (§4/§7) — no Phase-5 permission additions were needed.
        |----------------------------------------------------------------
        */
        Route::prefix('admissions')->group(function () {
            Route::middleware('permission:applications.view')->group(function () {
                Route::get('/applications', [StaffApplicationController::class, 'index']);
                Route::get('/applications/{application}', [StaffApplicationController::class, 'show']);
            });
            Route::middleware('permission:applications.review')->group(function () {
                Route::post('/applications/{application}/review', [StaffApplicationController::class, 'review']);
            });
            Route::middleware('permission:applications.shortlist')->group(function () {
                Route::post('/applications/{application}/shortlist', [StaffApplicationController::class, 'shortlist']);
            });
            // decide() covers ADMIT/HOLD/REJECT in one endpoint; gating on
            // BOTH admit and reject permissions together is deliberate —
            // the spec lists them as separate abilities, but a reviewer
            // making a hold/reject call needs the same access, so we
            // require the applications.admit permission (admission_officer
            // holds both, per RolePermissionSeeder) rather than fork this
            // into three near-identical endpoints.
            Route::middleware('permission:applications.admit')->group(function () {
                Route::post('/applications/{application}/decision', [StaffApplicationController::class, 'decide']);
                Route::post('/applications/{application}/convert', [StaffApplicationController::class, 'convert']);
            });
        });

        /*
        |----------------------------------------------------------------
        | Student Information System (Phase 6)
        |----------------------------------------------------------------
        | Permission slugs reused verbatim from the spec's §4 list.
        |----------------------------------------------------------------
        */
        Route::get('/student/me', [StudentController::class, 'me']);

        Route::middleware('permission:students.view')->group(function () {
            Route::get('/students', [StudentController::class, 'index']);
            Route::get('/students/{student}', [StudentController::class, 'show']);
        });
        Route::middleware('permission:students.update')->group(function () {
            Route::post('/students/{student}/enrolments', [StudentEnrolmentController::class, 'store']);
            Route::post('/students/{student}/transfer', [StudentTransferController::class, 'store']);
        });
        Route::middleware('permission:students.status.change')->group(function () {
            Route::patch('/students/{student}/status', [StudentController::class, 'updateStatus']);
        });

        /*
        |----------------------------------------------------------------
        | Course Registration (Phase 7)
        |----------------------------------------------------------------
        | Student side gated by `role:student` + CourseRegistrationPolicy
        | ownership (own registration only) — matching the applicant
        | portal's pattern from Phase 4, since "own this record" isn't a
        | permission, it's an identity check. Staff (HOD/Academic Officer)
        | side reuses the spec's exact `course_registrations.*` slugs.
        |----------------------------------------------------------------
        */
        Route::middleware('role:student')->prefix('course-registrations')->group(function () {
            Route::get('/', [CourseRegistrationController::class, 'index']);
            Route::post('/', [CourseRegistrationController::class, 'store']);
            Route::get('/{course_registration}', [CourseRegistrationController::class, 'show']);
            Route::put('/{course_registration}', [CourseRegistrationController::class, 'update']);
            Route::post('/{course_registration}/submit', [CourseRegistrationController::class, 'submit']);
        });

        Route::prefix('staff/course-registrations')->group(function () {
            Route::middleware('permission:course_registrations.view')->group(function () {
                Route::get('/', [StaffCourseRegistrationController::class, 'index']);
                Route::get('/{course_registration}', [StaffCourseRegistrationController::class, 'show']);
            });
            Route::middleware('permission:course_registrations.approve')->group(function () {
                Route::post('/{course_registration}/approve', [StaffCourseRegistrationController::class, 'approve']);
                Route::post('/{course_registration}/reject', [StaffCourseRegistrationController::class, 'reject']);
            });
        });

        /*
        |----------------------------------------------------------------
        | Lecturer Portal & Results (Phase 8)
        |----------------------------------------------------------------
        | Lecturer endpoints are permission-gated (results.enter/submit,
        | per spec §4) PLUS ownership-checked via CourseOfferingPolicy —
        | a lecturer only ever touches offerings they're assigned to.
        | Staff review pipeline reuses results.review/verify/approve/
        | publish verbatim. Student results endpoint is intentionally the
        | ONLY way a student role can read results, always filtered to
        | PUBLISHED regardless of query params.
        |----------------------------------------------------------------
        */
        Route::middleware('permission:results.view')->group(function () {
            Route::get('/lecturer/courses', [LecturerCourseController::class, 'index']);
            Route::get('/lecturer/courses/{course_offering}/roster', [LecturerCourseController::class, 'roster']);
            Route::get('/lecturer/courses/{course_offering}/results', [LecturerResultController::class, 'index']);
        });
        Route::get('/result-components', [ResultComponentController::class, 'index']);
        Route::middleware('permission:results.enter')->group(function () {
            Route::put('/lecturer/courses/{course_offering}/results', [LecturerResultController::class, 'upsert']);
        });
        Route::middleware('permission:results.submit')->group(function () {
            Route::post('/lecturer/courses/{course_offering}/results/submit', [LecturerResultController::class, 'submit']);
        });

        Route::middleware('permission:results.view')->group(function () {
            Route::get('/staff/results', [StaffResultReviewController::class, 'index']);
        });
        Route::middleware('permission:results.review')->group(function () {
            Route::post('/staff/results/{result}/review', [StaffResultReviewController::class, 'review']);
        });
        Route::middleware('permission:results.verify')->group(function () {
            Route::post('/staff/results/{result}/verify', [StaffResultReviewController::class, 'verify']);
        });
        Route::middleware('permission:results.approve')->group(function () {
            Route::post('/staff/results/{result}/approve', [StaffResultReviewController::class, 'approve']);
        });
        Route::middleware('permission:results.publish')->group(function () {
            Route::post('/staff/results/{result}/publish', [StaffResultReviewController::class, 'publish']);
        });

        Route::middleware('role:student')->group(function () {
            Route::get('/student/results', [StudentResultController::class, 'index']);
        });
    });

    // Module routes for Phase 4+ (applications, students, results, ...) are
    // added phase-by-phase per the platform's implementation order — see
    // docs/PROJECT_STATUS.md.
});
