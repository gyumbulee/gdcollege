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
use App\Http\Controllers\Api\V1\Admissions\ApplicationController;
use App\Http\Controllers\Api\V1\Admissions\ApplicationDocumentController;
use App\Http\Controllers\Api\V1\Admissions\ApplicationEducationController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\HealthController;
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
    });

    // Module routes for Phase 4+ (applications, students, results, ...) are
    // added phase-by-phase per the platform's implementation order — see
    // docs/PROJECT_STATUS.md.
});
