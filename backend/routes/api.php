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
use App\Http\Controllers\Api\V1\Auth\PasswordController;
use App\Http\Controllers\Api\V1\Clearance\StaffClearanceController;
use App\Http\Controllers\Api\V1\Clearance\StudentClearanceController;
use App\Http\Controllers\Api\V1\Documents\PublicDocumentVerificationController;
use App\Http\Controllers\Api\V1\Documents\StaffDocumentController;
use App\Http\Controllers\Api\V1\Documents\StudentDocumentController;
use App\Http\Controllers\Api\V1\Finance\FeeStructureController;
use App\Http\Controllers\Api\V1\Finance\FinancialReportController;
use App\Http\Controllers\Api\V1\Finance\InvoiceController;
use App\Http\Controllers\Api\V1\Finance\PaymentController;
use App\Http\Controllers\Api\V1\Finance\PaymentWebhookController;
use App\Http\Controllers\Api\V1\Finance\StaffPaymentController;
use App\Http\Controllers\Api\V1\Finance\StudentInvoiceController;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\Hod\HodAcademicController;
use App\Http\Controllers\Api\V1\Hod\HodDashboardController;
use App\Http\Controllers\Api\V1\Hod\HodReportController;
use App\Http\Controllers\Api\V1\Hod\HodStaffController;
use App\Http\Controllers\Api\V1\Hod\HodStudentController;
use App\Http\Controllers\Api\V1\Admin\AuditLogController;
use App\Http\Controllers\Api\V1\Admin\InstitutionSettingsController;
use App\Http\Controllers\Api\V1\Admin\DocumentTemplateController;
use App\Http\Controllers\Api\V1\Admin\RoleController;
use App\Http\Controllers\Api\V1\Admin\UserManagementController;
use App\Http\Controllers\Api\V1\Management\ManagementDashboardController;
use App\Http\Controllers\Api\V1\Search\GlobalSearchController;
use App\Http\Controllers\Api\V1\Management\ManagementReportController;
use App\Http\Controllers\Api\V1\Registration\CourseRegistrationController;
use App\Http\Controllers\Api\V1\Registry\RegistrarController;
use App\Http\Controllers\Api\V1\Registration\StaffCourseRegistrationController;
use App\Http\Controllers\Api\V1\Results\LecturerCourseController;
use App\Http\Controllers\Api\V1\Results\LecturerResultController;
use App\Http\Controllers\Api\V1\Results\ResultComponentController;
use App\Http\Controllers\Api\V1\Results\StaffResultReviewController;
use App\Http\Controllers\Api\V1\Results\StudentResultController;
use App\Http\Controllers\Api\V1\Cms\AnnouncementController;
use App\Http\Controllers\Api\V1\Cms\DownloadController;
use App\Http\Controllers\Api\V1\Cms\EventController;
use App\Http\Controllers\Api\V1\Cms\FaqController;
use App\Http\Controllers\Api\V1\Cms\GalleryController;
use App\Http\Controllers\Api\V1\Cms\PageController;
use App\Http\Controllers\Api\V1\Cms\PostController;
use App\Http\Controllers\Api\V1\Helpdesk\TicketController;
use App\Http\Controllers\Api\V1\Notifications\NotificationController;
use App\Http\Controllers\Api\V1\Siwes\StaffSiwesController;
use App\Http\Controllers\Api\V1\Siwes\StudentSiwesController;
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

    /*
    |----------------------------------------------------------------------
    | Public institution identity (Phase 21 -> public consumption)
    |----------------------------------------------------------------------
    | Read by the public site's header/footer/about/contact on every
    | request — nothing on Institution is sensitive, so this is public
    | and unauthenticated like /schools etc. below, not under
    | permission:institution.manage like the admin read/write pair.
    |----------------------------------------------------------------------
    */
    Route::middleware('throttle:public-lookup')->get('/institution', [InstitutionSettingsController::class, 'publicShow']);

    Route::middleware('throttle:auth')->group(function () {
        Route::post('/auth/login', [AuthController::class, 'login']);
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/forgot-password', [PasswordController::class, 'forgot']);
        Route::post('/auth/reset-password', [PasswordController::class, 'reset']);
    });

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
    Route::middleware('throttle:public-lookup')->get('/admission-list/search', [AdmissionListController::class, 'search']);
    Route::get('/admissions/status', [AdmissionListController::class, 'status']);

    /*
    |----------------------------------------------------------------------
    | Payment gateway webhooks (Phase 10 — Finance & Bursary)
    |----------------------------------------------------------------------
    | Necessarily public/unauthenticated — a gateway cannot hold a Sanctum
    | session. Protected instead by each driver's own
    | verifyWebhookSignature() (checked first, inside the controller) and
    | by PaymentVerificationService re-verifying against the gateway's own
    | API before ever trusting anything this payload claims (§21).
    |----------------------------------------------------------------------
    */
    Route::post('/payments/webhook/{gateway}', [PaymentWebhookController::class, 'handle']);

    /*
    |----------------------------------------------------------------------
    | Public document verification (Phase 11)
    |----------------------------------------------------------------------
    | §22: /verify/{verificationCode}. Public by design — returns only
    | IssuedDocument::toPublicArray(), never the private content snapshot.
    |----------------------------------------------------------------------
    */
    Route::middleware('throttle:public-lookup')->get('/documents/verify/{code}', [PublicDocumentVerificationController::class, 'show']);

    /*
    |----------------------------------------------------------------------
    | Public CMS content (Phase 17/18)
    |----------------------------------------------------------------------
    | §27: "Public content should not require developer intervention for
    | normal updates." Every one of these reads PUBLISHED-only rows —
    | draft content never reaches an unauthenticated request, regardless
    | of what the staff-side /admin/cms endpoints below can see.
    |----------------------------------------------------------------------
    */
    Route::get('/pages/{slug}', [PageController::class, 'publicShow']);
    Route::get('/posts', [PostController::class, 'publicIndex']);
    Route::get('/posts/{slug}', [PostController::class, 'publicShow']);
    Route::get('/events', [EventController::class, 'publicIndex']);
    Route::get('/events/{slug}', [EventController::class, 'publicShow']);
    Route::get('/galleries', [GalleryController::class, 'publicIndex']);
    Route::get('/galleries/{slug}', [GalleryController::class, 'publicShow']);
    Route::get('/downloads', [DownloadController::class, 'publicIndex']);
    Route::get('/faqs', [FaqController::class, 'publicIndex']);
    Route::get('/announcements', [AnnouncementController::class, 'publicIndex']);

    Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/change-password', [PasswordController::class, 'change']);

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
            Route::post('/{application}/pay', [ApplicationController::class, 'pay']);
            Route::post('/payments/{payment}/status', [ApplicationController::class, 'paymentStatus']);

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

        /*
        |----------------------------------------------------------------
        | HOD Portal (Phase 9)
        |----------------------------------------------------------------
        | Every endpoint here resolves to exactly one department via
        | ResolvesHodDepartment (role_user.scope_type='department') and
        | is read-only — the HOD's write actions (approve/reject
        | registrations, review results) already exist above under
        | staff/course-registrations and staff/results, now department-
        | scoped by CourseRegistrationPolicy/ResultPolicy.
        |----------------------------------------------------------------
        */
        Route::middleware('role:hod')->prefix('hod')->group(function () {
            Route::get('/dashboard', [HodDashboardController::class, 'index']);
            Route::get('/students', [HodStudentController::class, 'index']);
            Route::get('/staff', [HodStaffController::class, 'index']);
            Route::get('/programmes', [HodAcademicController::class, 'programmes']);
            Route::get('/course-offerings', [HodAcademicController::class, 'courseOfferings']);
            Route::get('/reports', [HodReportController::class, 'index']);
        });

        /*
        |----------------------------------------------------------------
        | Finance & Bursary (Phase 10)
        |----------------------------------------------------------------
        | Student side is ownership-scoped (role:student + "it's your own
        | student_id", same pattern as course-registrations/results — see
        | StudentInvoiceController/PaymentController). Staff side is
        | permission-gated per action, matching every other staff module.
        |----------------------------------------------------------------
        */
        Route::middleware('role:student')->group(function () {
            Route::get('/student/invoices', [StudentInvoiceController::class, 'index']);
            Route::get('/student/invoices/{invoice}', [StudentInvoiceController::class, 'show']);
            Route::post('/student/invoices/{invoice}/pay', [PaymentController::class, 'initiate']);
            Route::get('/student/payments/{payment}/status', [PaymentController::class, 'status']);
        });

        Route::middleware('permission:fee_structures.manage')->group(function () {
            Route::apiResource('fee-structures', FeeStructureController::class)->except(['destroy']);
            Route::delete('/fee-structures/{feeStructure}', [FeeStructureController::class, 'destroy']);
            Route::post('/fee-structures/{feeStructure}/items', [FeeStructureController::class, 'addItem']);
            Route::patch('/fee-structures/{feeStructure}/items/{item}', [FeeStructureController::class, 'updateItem']);
            Route::delete('/fee-structures/{feeStructure}/items/{item}', [FeeStructureController::class, 'removeItem']);
        });

        Route::middleware('permission:invoices.view')->group(function () {
            Route::get('/invoices', [InvoiceController::class, 'index']);
            Route::get('/invoices/{invoice}', [InvoiceController::class, 'show']);
            Route::get('/finance/reports', [FinancialReportController::class, 'index']);
        });
        Route::middleware('permission:invoices.manage')->group(function () {
            Route::post('/invoices', [InvoiceController::class, 'store']);
            Route::post('/invoices/{invoice}/void', [InvoiceController::class, 'void']);
        });

        Route::middleware('permission:payments.view')->group(function () {
            Route::get('/staff/payments', [StaffPaymentController::class, 'index']);
            Route::get('/staff/payments/{payment}', [StaffPaymentController::class, 'show']);
        });
        Route::middleware('permission:payments.verify')->group(function () {
            Route::post('/staff/payments/{payment}/verify', [StaffPaymentController::class, 'verify']);
        });
        Route::middleware('permission:payments.refund')->group(function () {
            Route::post('/staff/payments/{payment}/refund', [StaffPaymentController::class, 'refund']);
        });

        /*
        |----------------------------------------------------------------
        | Documents & Clearance (Phase 11)
        |----------------------------------------------------------------
        | Instant document types are self-service (ownership-scoped, no
        | permission needed — same pattern as invoices/results). Non-instant
        | types go through a DocumentRequest a `documents.issue` holder
        | processes. Clearance decisions are gated by `clearance.approve`
        | at the route level, then ClearanceItemPolicy narrows to "your
        | stage only" (and department scope for the DEPARTMENT stage).
        |----------------------------------------------------------------
        */
        Route::middleware('role:student')->prefix('student/documents')->group(function () {
            Route::get('/', [StudentDocumentController::class, 'index']);
            Route::get('/requests', [StudentDocumentController::class, 'requests']);
            Route::post('/request', [StudentDocumentController::class, 'request']);
            Route::post('/admission-letter', [StudentDocumentController::class, 'admissionLetter']);
            Route::post('/registration-slip/{courseRegistration}', [StudentDocumentController::class, 'registrationSlip']);
            Route::post('/result-slip', [StudentDocumentController::class, 'resultSlip']);
            Route::post('/receipt/{payment}', [StudentDocumentController::class, 'paymentReceipt']);
        });

        Route::middleware('role:student')->group(function () {
            Route::get('/student/clearance', [StudentClearanceController::class, 'show']);
            Route::post('/student/clearance/request', [StudentClearanceController::class, 'request']);
        });

        Route::middleware('permission:documents.issue')->group(function () {
            Route::get('/staff/document-requests', [StaffDocumentController::class, 'index']);
            Route::get('/staff/document-requests/{documentRequest}', [StaffDocumentController::class, 'show']);
            Route::post('/staff/document-requests/{documentRequest}/process', [StaffDocumentController::class, 'process']);
            Route::post('/staff/document-requests/{documentRequest}/issue', [StaffDocumentController::class, 'issue']);
            Route::post('/staff/issued-documents/{issuedDocument}/revoke', [StaffDocumentController::class, 'revoke']);
        });

        Route::middleware('permission:clearance.approve')->group(function () {
            Route::get('/staff/clearance', [StaffClearanceController::class, 'index']);
            Route::get('/staff/clearance/{clearanceRequest}', [StaffClearanceController::class, 'show']);
            Route::post('/staff/clearance-items/{clearanceItem}/decide', [StaffClearanceController::class, 'decide']);
        });

        Route::middleware('permission:documents.issue')->group(function () {
            Route::get('/registrar/dashboard', [RegistrarController::class, 'dashboard']);
        });

        /*
        |----------------------------------------------------------------
        | SIWES & Student Services (Phase 12)
        |----------------------------------------------------------------
        | SIWES: student self-reports a placement (ownership-scoped, no
        | permission needed); `siwes.manage` reviews/assesses. Helpdesk:
        | any authenticated user can create/reply to their own tickets —
        | TicketController checks ownership vs. helpdesk.view/manage
        | inline rather than splitting into a separate staff controller,
        | since almost every action is identical either way.
        |----------------------------------------------------------------
        */
        Route::middleware('role:student')->prefix('student/siwes')->group(function () {
            Route::get('/', [StudentSiwesController::class, 'index']);
            Route::post('/', [StudentSiwesController::class, 'store']);
        });

        Route::middleware('permission:siwes.manage')->prefix('siwes')->group(function () {
            Route::get('/', [StaffSiwesController::class, 'index']);
            Route::get('/{siwesRecord}', [StaffSiwesController::class, 'show']);
            Route::post('/{siwesRecord}/status', [StaffSiwesController::class, 'updateStatus']);
            Route::post('/{siwesRecord}/assess', [StaffSiwesController::class, 'assess']);
        });

        Route::prefix('tickets')->group(function () {
            Route::get('/', [TicketController::class, 'index']);
            Route::post('/', [TicketController::class, 'store']);
            Route::get('/{ticket}', [TicketController::class, 'show']);
            Route::post('/{ticket}/reply', [TicketController::class, 'reply']);
            Route::post('/{ticket}/status', [TicketController::class, 'updateStatus']);
            Route::get('/{ticket}/messages/{messageId}/attachment', [TicketController::class, 'downloadAttachment']);
        });

        /*
        |----------------------------------------------------------------
        | Management & Reporting (Phase 13)
        |----------------------------------------------------------------
        | `reports.view` rather than `role:management` — see
        | ManagementDashboardController's docblock: this keeps the usual
        | super-admin bypass, and Management's permission set stays
        | view-only in RolePermissionSeeder (§29's "no automatic
        | system-administration privileges").
        |----------------------------------------------------------------
        */
        Route::middleware('permission:reports.view')->prefix('management')->group(function () {
            Route::get('/dashboard', [ManagementDashboardController::class, 'index']);
            Route::get('/reports/students.csv', [ManagementReportController::class, 'exportStudents']);
        });

        /*
        |----------------------------------------------------------------
        | System Administration (Phase 21)
        |----------------------------------------------------------------
        | All four sub-areas were permission-defined and granted to
        | ict_administrator since Phase 1 with no endpoint anywhere that
        | used them. Kept as one prefix, but each sub-area is gated by
        | its own specific permission (not a blanket `role:ict_administrator`)
        | so any role holding just one of these — e.g. `management` already
        | holds `audit_logs.view` — reaches exactly that slice and nothing
        | more.
        |----------------------------------------------------------------
        */
        Route::prefix('admin')->group(function () {
            Route::middleware('permission:users.manage')->prefix('users')->group(function () {
                Route::get('/', [UserManagementController::class, 'index']);
                Route::post('/', [UserManagementController::class, 'store']);
                Route::get('/{user}', [UserManagementController::class, 'show']);
                Route::patch('/{user}', [UserManagementController::class, 'update']);
                Route::post('/{user}/roles', [UserManagementController::class, 'assignRole']);
                Route::delete('/{user}/roles/{role}', [UserManagementController::class, 'removeRole']);
            });

            Route::middleware('permission:roles.manage')->group(function () {
                Route::get('/roles', [RoleController::class, 'index']);
                Route::get('/roles/{role}', [RoleController::class, 'show']);
                Route::get('/permissions', [RoleController::class, 'permissions']);

                // Toggling what a role can do needs BOTH permissions —
                // roles.manage alone only earns read access here.
                Route::middleware('permission:permissions.manage')
                    ->post('/roles/{role}/permissions/{permission}/toggle', [RoleController::class, 'togglePermission']);
            });

            Route::middleware('permission:audit_logs.view')->prefix('audit-logs')->group(function () {
                Route::get('/', [AuditLogController::class, 'index']);
                Route::get('/{auditLog}', [AuditLogController::class, 'show']);
            });

            Route::middleware('permission:institution.manage')->prefix('institution')->group(function () {
                Route::get('/', [InstitutionSettingsController::class, 'show']);
                Route::post('/', [InstitutionSettingsController::class, 'update']);
            });

            Route::middleware('permission:institution.manage')->prefix('document-templates')->group(function () {
                Route::get('/', [DocumentTemplateController::class, 'index']);
                Route::post('/{documentTemplate}/upload', [DocumentTemplateController::class, 'upload']);
            });
        });

        /*
        |----------------------------------------------------------------
        | Global Search (Phase 22)
        |----------------------------------------------------------------
        | No single permission slug in the spec covers "search" — gated
        | per-category inside the controller against students.view/
        | applications.view/payments.view/courses.view instead of a
        | blanket permission here. See GlobalSearchController's docblock.
        |----------------------------------------------------------------
        */
        Route::get('/search', [GlobalSearchController::class, 'index']);

        /*
        |----------------------------------------------------------------
        | Notifications (Phase 17)
        |----------------------------------------------------------------
        | Every signed-in user's own list — applicant, student, or staff
        | alike. No permission gate: NotificationController always scopes
        | to Auth::id(), so there's nothing broader to gate.
        |----------------------------------------------------------------
        */
        Route::prefix('notifications')->group(function () {
            Route::get('/', [NotificationController::class, 'index']);
            Route::post('/{notification}/read', [NotificationController::class, 'markRead']);
            Route::post('/read-all', [NotificationController::class, 'markAllRead']);
        });

        /** §26 — resolved against the current signed-in user's own audience (see AnnouncementController::mine). */
        Route::get('/announcements/mine', [AnnouncementController::class, 'mine']);

        /*
        |----------------------------------------------------------------
        | CMS Administration (Phase 17/18)
        |----------------------------------------------------------------
        | Every write here requires cms.manage. Announcements' authoring
        | side sits alongside the CMS content types rather than under
        | /notifications, since publishing one is what triggers the fan-
        | out notification, not the notifications list itself.
        |----------------------------------------------------------------
        */
        Route::middleware('permission:cms.manage')->prefix('admin/cms')->group(function () {
            Route::apiResource('pages', PageController::class)->parameters(['pages' => 'page']);

            Route::apiResource('posts', PostController::class)->parameters(['posts' => 'post']);
            Route::apiResource('events', EventController::class)->parameters(['events' => 'event']);
            Route::apiResource('faqs', FaqController::class)->only(['store', 'update', 'destroy'])->parameters(['faqs' => 'faq']);
            Route::get('/faqs', [FaqController::class, 'index']);

            Route::apiResource('downloads', DownloadController::class)->only(['index', 'store', 'destroy']);

            Route::apiResource('galleries', GalleryController::class)->parameters(['galleries' => 'gallery']);
            Route::post('/galleries/{gallery}/items', [GalleryController::class, 'addItem']);
            Route::delete('/galleries/{gallery}/items/{item}', [GalleryController::class, 'removeItem']);

            Route::get('/announcements', [AnnouncementController::class, 'index']);
            Route::post('/announcements', [AnnouncementController::class, 'store']);
            Route::patch('/announcements/{announcement}', [AnnouncementController::class, 'update']);
            Route::post('/announcements/{announcement}/publish', [AnnouncementController::class, 'publish']);
            Route::post('/announcements/{announcement}/archive', [AnnouncementController::class, 'archive']);
        });
    });

    // Module routes for Phase 4+ (applications, students, results, ...) are
    // added phase-by-phase per the platform's implementation order — see
    // docs/PROJECT_STATUS.md.
});
