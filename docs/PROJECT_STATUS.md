# GD College Wase — Project Status & Gap Analysis

Last updated: Phase 11 fully complete (backend + frontend + live verification).

## Repository audit finding (important)

The `main` branch of `gyumbulee/gdcollege`, at the time of this audit, had
**zero tracked files at HEAD** — the most recent commit (`0cdc25d "Features
start"`) deleted everything that existed before it. Prior commits
(`c4d984c`, `dec78d1`, `ecb08b0`) contained a small standalone "countdown
gate" Next.js module and two real, officially-sourced image assets
(`images/gdcollege-banner.jpg`, `images/gdcollege-crest.png`) showing the
College's real address, phone numbers, motto, and 2026/2027 programme
list.
 
Per instruction, this phase does **not** restore that deleted work — Phase
0 below was built from scratch. The prior commits and those two real
assets still exist in git history if useful later (e.g. as a genuine
source for seed data, once explicitly confirmed).

## Status

| Area | Status | Notes |
|---|---|---|
| Foundation | ✓ | Monorepo (`frontend/`, `backend/`, `docs/`) established. Next.js app builds and serves; verified with `npm run build` and a live HTTP check. |
| Branding config | ✓ | Single source of truth at `frontend/src/config/institution.config.ts`; design tokens mirrored in `globals.css`. No logo/banner supplied yet — placeholder crest used, nothing fabricated. |
| Public homepage | ✓ (Phase 0 scope) | Real, polished homepage — hero, "how it works", sample-labelled programme preview, empty-state announcements. Not CMS-driven yet (that's Phase 3/18). |
| Public website (other pages) | ✓ (Phase 3 scope) | Academics section (overview/schools/departments/programmes) now renders real data from the Phase 2 API — verified live end-to-end against a stub. About/Management/Contact redesigned with real structure (not bare "coming soon") but honest placeholder content — no fabricated names, history, or figures. News/Events/Gallery/Downloads/Admissions-requirements/Admission-list are genuine empty states (not stubs) pending Phase 11/5. Dynamic `/news/[slug]`, `/events/[slug]`, `/verify/[code]` routes exist and degrade honestly. |
| Backend foundation | ⚠ | Application-level code complete for Phase 0/1 scope (composer.json, routes, CORS/Sanctum config, migrations, models, controllers, seeders). **The actual Laravel framework has still not been installed or run in-sandbox** — see "Known limitation" below; code has been reviewed for correctness but not executed against a real DB. |
| Authentication | ✓ (code complete, unexecuted on backend) | Sanctum token auth (`/auth/login`, `/auth/logout`, `/auth/me`); Next.js side (login form, httpOnly-cookie session, protected `/portal`, logout) verified live end-to-end against a stub standing in for Laravel — see below. |
| RBAC | ✓ (code complete, unexecuted on backend) | 13 roles + full spec permission list seeded via `RolePermissionSeeder`; `EnsurePermission` middleware + `hasPermission()`/`hasRole()` on `User`; Super Administrator Gate bypass; ICT/System Administrator deliberately excluded from that bypass per spec. |
| Institution/Academic structure (DB) | ✓ (code complete, unexecuted on backend) | Schools, departments, programmes, academic sessions, semesters, levels, course types, courses (+ prerequisites), course offerings — full CRUD, all configurable, none hardcoded. Sample data clearly marked "(Sample)". |
| Applicant portal | ✓ (verified live end-to-end against a stub) | Self-registration, multi-section wizard (personal/contact/next-of-kin, programme selection, repeatable O'Level education history, document upload/delete), and submission with server-side completeness validation — tested: submit-with-missing-documents correctly rejected with itemized errors; submit-after-uploading-required-docs correctly succeeded and flipped the application to read-only SUBMITTED. |
| Admissions | ✓ | Phase 5 — see below. |
| Student Information System | ✓ | Phase 6 — see below. |
| Course registration | ✓ | Phase 7 — see below. |
| Lecturer/HOD portals | ✓ | Phase 8 (lecturer + results pipeline). Phase 9 (dedicated HOD dashboard, department students/staff/academics/reports, registration & result review UI) verified live end-to-end against a stub — see below. |
| Examination & results | ✓ | Phase 8 — see below. |
| Finance & payments | ✓ | Phase 10 — fee structures, invoices, payment gateway abstraction (Paystack/Flutterwave/Korapay), webhook verification, refunds. Verified live end-to-end — see below. |
| Registrar/documents/clearance | ✓ | Phase 11 — document self-service, staff-processed requests, public verification, 5-stage clearance pipeline, graduation gated on clearance. Verified live end-to-end — see below. |
| Notifications/CMS | ✗ | Phase 17/18. |
| SIWES/helpdesk | ✗ | Phase 19. |
| Management dashboard | ✗ | Phase 20. |
| System administration | ✗ | Phase 21. |
| Global search | ✗ | Phase 22. |
| Security/audit hardening | ⚠ | Foundational conventions in place since Phase 0; HOD department scoping (a long-standing gap — see below) closed in Phase 9. Full hardening pass is Phase 23. |

## Known limitation: backend could not be installed/run in this environment

The environment used for this phase has Node.js but no PHP or Composer,
and its network allowlist does not include Packagist. The backend
skeleton in `backend/` is therefore hand-authored application code, not a
`composer install`-ed, runnable Laravel project. `backend/README.md`
documents the exact commands to turn it into a real, running app on a
machine with PHP 8.3+ and Composer. This should be the very first thing
verified at the start of Phase 1, before any auth/RBAC code is written.

## Phase plan (from the platform specification)

0. Repository audit & foundation — **this document**
1. Core infrastructure: DB foundation, institution config, auth, users, roles, permissions, RBAC, API foundation, security foundation, audit infrastructure, frontend UI system
2. Academic structure: sessions, semesters, schools, departments, programmes, levels, courses, offerings
3. Public institutional website (full)
4. Applicant & admissions
5. Student Information System
6. Course registration
7. Lecturer & HOD portals
8. Examination & results
9. Finance & bursary
10. Registrar, documents & clearance
11. Communication & CMS
12. SIWES & student services
13. Management & reporting
14. Security, testing & production

**Note on phase numbers below:** in practice this plan was implemented at
finer granularity than the 14 items above — e.g. "Applicant & admissions"
split into a Phase 4 (applicant) and Phase 5 (admissions), "Lecturer & HOD
portals" split into a Phase 8 (lecturer + the full results pipeline) and a
separate Phase 9 (dedicated HOD dashboard), and later "What Phase N added"
sections reference numbers like Phase 11 (CMS)/Phase 13 (payments)
accordingly. Treat the numbers in each section heading below as
authoritative for what's actually been built; this list is the original
coarse plan, kept for reference.

## What Phase 1 added

- **Backend:** migrations for `institutions`, `roles`, `permissions`,
  `role_user` (with institutional-scope columns for later HOD-style
  department scoping), `permission_role`, `audit_logs`, plus a
  `users` profile-fields migration (phone, status). `User`, `Role`,
  `Permission`, `Institution`, `AuditLog` models. Token-based Sanctum auth
  (`AuthController@login/logout/me`) with a consistent response envelope.
  `EnsurePermission` middleware + `AuthServiceProvider`'s Super
  Administrator `Gate::before` bypass (ICT/System Administrator is
  deliberately excluded from it, per spec §30). `AuditLogger` service.
  `RolePermissionSeeder` (all 13 roles + full permission list + a starting
  per-role assignment) and a clearly-marked dev-only `DevSuperAdminSeeder`.
- **Frontend:** `/api/session/login` and `/api/session/logout` Route
  Handlers acting as a thin BFF proxy to Laravel, storing the Sanctum
  token in an **httpOnly** cookie (never `localStorage`); `lib/auth/session.ts`
  (`getSession`, `requireSession`, `can`) for server-side session reads
  and UI-level permission checks; a real login form at `/student/login`;
  a protected `/portal` page demonstrating both; `proxy.ts` (Next.js 16's
  middleware convention) redirecting unauthenticated requests to login.

**Verified live, end-to-end, in this environment:** unauthenticated
`/portal` → 307 redirect to login; login with correct/incorrect
credentials; httpOnly session cookie set on success; authenticated
`/portal` correctly renders the signed-in user, their role badge, and
permission-gated content; logout clears the session. This was run
against a minimal stand-in for the two Laravel auth endpoints (documented
inline in the test), since real Laravel can't run in this sandbox — the
same requests will work unchanged against the real backend once it's
installed per `backend/README.md`.

## What Phase 2 added

- **Migrations/models:** `schools`, `departments` (with an HOD lookup
  column, scoped authoritatively via Phase 1's `role_user` scope columns),
  `programmes`, `academic_sessions`, `semesters`, `levels`, `course_types`,
  `courses`, `course_prerequisites` (self-referencing), `course_offerings`
  (course + session + semester + programme + level + lecturer, distinct
  from a course itself per the spec's own example). A DB-level uniqueness
  rule prevents two academic sessions/semesters both being marked
  "current" via a transaction, not just app convention.
- **API:** full CRUD for every entity above under `/api/v1/` (read access
  to schools/departments/programmes was later made public in Phase 3).
  Writes require `academic_structure.manage` (a Phase-2 addition — the
  spec's own permission list only names `courses.*`) or the spec's exact
  `courses.create`/`courses.update` slugs for courses specifically.
- **Seed data:** `AcademicStructureSeeder` — one sample school, department,
  and ND Computer Science programme, the 2026/2027 session with two
  semesters, ND I/ND II levels, and the CSC101/CSC201/CSC203/GST202
  courses (code/title/units mirror the worked examples already present in
  the specification itself, not fabricated). Every seeded name is suffixed
  "(Sample)" so it can't be mistaken for confirmed data.

## What Phase 3 added

- **Backend routing change:** `GET /schools`, `/departments`, `/programmes`
  (and their `/{id}` show routes) moved out of `auth:sanctum` — these are
  public marketing-site content, matching the spec's own §33 API examples
  which list them unauthenticated. Writes to these three remain permission-
  gated exactly as before; the rest of the academic catalogue (courses,
  offerings, sessions/semesters/levels) stays staff-authenticated since the
  public site doesn't need it yet.
- **Frontend — real data:** `/academics`, `/academics/schools`,
  `/academics/departments`, `/academics/programmes` now fetch from the live
  API (fail-soft: API errors or empty data render an honest empty state,
  never a crash). The homepage's programme preview does the same, falling
  back to clearly-labeled sample cards only when there's no real data yet.
- **Frontend — honest placeholders, not bare stubs:** About, Management,
  and Contact were rebuilt with real page structure (breadcrumbs, sections,
  a quick-facts panel) rather than the Phase 0 generic "coming soon" — but
  the content itself stays honestly placeholder (no fabricated history,
  leadership names, or figures) until the College supplies it.
- **Frontend — genuine empty states:** News, Events (+ dynamic
  `/events/[slug]`), Gallery, Downloads, Admissions overview, admission
  requirements, and the admission list are now proper "nothing published
  yet" empty states tied to the phase that will populate them (11 for CMS,
  5 for Admissions), rather than generic stubs.
- **Document verification:** `/verify` got a real search form; the dynamic
  `/verify/[code]` route exists and honestly reports the service isn't
  live yet (Phase 15) rather than faking a result either way.

**Verified live, end-to-end:** started the Next.js app against a stub
serving `/schools`, `/departments`, `/programmes` in the exact API
envelope shape; confirmed real sample data ("School of Applied Sciences
(Sample)" etc.) renders correctly on all four academics pages and the
homepage; confirmed `/news` still renders its honest empty state
unaffected; confirmed `/verify/[code]` renders the entered code and the
correct "not live yet" message.

## What Phase 4 added

- **Backend:** `applicants` (bio-data, separate from `users`),
  `applications` (status machine: DRAFT → PAYMENT_PENDING/CONFIRMED →
  SUBMITTED → UNDER_REVIEW → SHORTLISTED → ADMITTED/REJECTED/ON_HOLD/
  WITHDRAWN), `application_education_records` (repeatable O'Level
  sittings), `application_documents` (stored on a private, non-public
  disk — see `config/filesystems.disks-reference.php`). A concurrency-
  safe `ApplicationNumberGenerator` (locked per-session counter table) —
  same safety pattern the spec asks for with matric numbers. `POST
  /auth/register` for applicant self-registration only (staff accounts
  stay admin-created, per the spec's role model). `ApplicationPolicy`
  enforces strict per-applicant ownership on every action. `config/
  admissions.php` keeps the application-number format, required document
  types, and fee amount all configurable and un-fabricated — the fee is
  explicitly left unenforced until Phase 13 builds real payment
  verification, rather than faking a "pay now" button with nothing behind
  it. `ApplicationResource` normalizes JSON output to consistent
  snake_case (Eloquent's default relation serialization would otherwise
  leak camelCase method names into the response).
- **Frontend:** applicant registration page; a real multi-section wizard
  (`ApplicationWizard`) — programme selection pulling live from the Phase 3
  academics API, personal/contact/next-of-kin fields, repeatable education
  records with add/remove rows and per-subject grades, document upload/
  delete, and a submit flow that surfaces the backend's exact completeness
  errors. All mutations go through Next.js Route Handlers acting as a thin
  BFF (`/api/applications/*`) so the Sanctum token never leaves the
  server/httpOnly-cookie boundary established in Phase 1.

**Verified live, end-to-end**, against a stub implementing the same
completeness rules as the real backend: register → start application →
save personal info → save education → **submit with missing documents
correctly rejected** (itemized per-field errors) → upload both required
documents → **submit succeeds** → wizard correctly switches to a
read-only "submitted" view. This is the first phase where the full
create → edit → validate → transition lifecycle was exercised, not just
reads.

## What Phase 5 added — Admissions Management

- **Backend:** `admissions` table recording ADMIT/HOLD/REJECT decisions with
  reasons; `StaffApplicationController` for review/shortlist/decide on top
  of Phase 4's application status machine. `AdmissionConversionService`
  performs the application → admission → student account → enrolment →
  matric number pipeline in one DB transaction, and is idempotent —
  repeating `convert()` on an already-converted application returns the
  existing student rather than creating a duplicate (checked via a unique
  `application_id` on `students`, not just an application-layer guard).
  `MatricNumberGenerator` uses a locked per-session counter row (same
  concurrency-safe pattern as Phase 4's `ApplicationNumberGenerator`) so
  two simultaneous conversions can never collide on a matric number.
- **Frontend/API:** staff endpoints under `/admissions/*`, gated by the
  spec's own `applications.review/shortlist/admit/reject` permission
  slugs verbatim (see RolePermissionSeeder).

## What Phase 6 added — Student Information System

- **Backend:** `students`, `student_enrolments` (one row per session/level
  a student is enrolled at — never overwritten, only appended to per
  §36), `student_programme_histories` (same append-only treatment for
  programme transfers). `StudentController` (search/list/show/status
  change), `StudentEnrolmentController`, `StudentTransferController`.
  Student status changes go through `students.status.change`
  specifically (not bundled into a generic update), matching the spec's
  granular permission list, and are audit-logged.

## What Phase 7 added — Course Registration

- **Backend:** `course_registrations` (DRAFT/SUBMITTED/APPROVED/REJECTED/
  CLOSED) + `course_registration_items`. `CourseRegistrationService` is
  the single source of truth for every rule the spec calls for in §11 —
  duplicate prevention, programme match, configurable credit limits
  (`config/course_registration.php`), registration window, and
  prerequisites — used identically by both "save draft" and "submit" so
  no route can bypass a rule another enforces. `CourseRegistrationPolicy`
  enforces per-student ownership on the student side.
- **Documented gap at the time:** Results (Phase 8) didn't exist yet, so
  prerequisites could only check "was this course ever registered", and
  the `is_carryover` flag was a level-mismatch proxy rather than a real
  "did the student actually fail this course" check. **Closed in Phase
  9 — see below.**

## What Phase 8 added — Lecturer Portal & Results Pipeline

- **Backend:** `grading_scales` and `result_components` (both fully
  DB-configurable — no hardcoded CA/Exam split or grade bands, per §12)
  seeded with a clearly-labeled non-authoritative default
  (`ResultConfigSeeder`). `results` table implementing the exact
  DRAFT → SUBMITTED → REVIEWED → VERIFIED → APPROVED → PUBLISHED pipeline,
  one row per student per course offering, published results never
  edited in place. `GradeCalculator` computes total score/grade from
  configurable components and the grading scale. `LecturerCourseController`
  + `LecturerResultController` (bulk upsert-as-draft, submit — locks
  further lecturer edits per §16) gated by `CourseOfferingPolicy` so a
  lecturer only ever touches their own assigned offerings.
  `StaffResultReviewController` implements the four staff-side
  transitions, each its own permission (`results.review/verify/approve/
  publish`) so HOD (review) and Academic Officer (verify/approve/publish)
  naturally hold only their own stage. `StudentResultController` is the
  only student-facing results read, always filtered to PUBLISHED.
- **Documented gap at the time:** the spec's HOD department scoping
  (`role_user.scope_type/scope_id` from Phase 1) existed as columns but
  was never read — any account holding `course_registrations.approve` or
  `results.review` could act on any department, not just their own.
  **Closed in Phase 9 — see below.**

## Gap closures (start of Phase 9)

Both gaps documented above are now closed:

1. **HOD department scoping.** `User::departmentScopeIds()` reads
   `role_user` rows scoped `scope_type='department'`. A new
   `ChecksDepartmentScope` trait, shared by `CourseRegistrationPolicy`
   (`approve`/`reject`) and a new `ResultPolicy` (`review` only — the HOD
   stage; verify/approve/publish stay unscoped, since that's the
   institution-wide Academic Officer role), enforces it: an HOD scoped to
   a department can only act on records in that department, while an
   account with no scope configured yet is unrestricted-by-scope (the
   permission middleware already gated the ability) so nothing existing
   silently breaks. `StaffCourseRegistrationController::approve/reject`
   and `StaffResultReviewController::review` now call
   `$this->authorize(...)`; their `index()` listings are filtered the
   same way so an HOD's "pending" lists are department-scoped too, not
   just the write actions. A `DevSampleStaffSeeder` (dev/demo only) seeds
   a real scoped HOD (`hod.cs@gdcollegewase.test`) and a sample lecturer
   so this is exercisable, not just theoretical.
2. **Carryover/prerequisite proxies → real result data.**
   `CourseRegistrationService::isCarryover()` now checks for an actual
   PUBLISHED, non-passing result for that exact course — replacing the
   Phase 7 "offering's level differs from student's current level"
   proxy. Prerequisite satisfaction now defaults to
   `config('course_registration.prerequisite_check') === 'passed_previously'`
   (a PUBLISHED result with `grade_point` above the configurable
   `passing_grade_point`, default 0.0 — matching the seeded scale's own
   F = 0.00 convention, not an invented policy), with the old
   "registered previously" behaviour kept as a fallback mode. Both
   repeated attempts at a failed course are retained per §36 (nothing is
   overwritten) — a student can show both a PUBLISHED fail and a later
   PUBLISHED pass for the same course, and the pass correctly satisfies
   prerequisites for later courses while the fail still correctly marks
   that history as a carryover.

Verified with a Python stub mirroring the exact predicate logic (department
scope allow/deny matrix; passed-course-ids and is-carryover against a small
published/unpublished/repeated-attempt result set) — see the "known
limitation" note below for why PHP-level execution still isn't possible
in this sandbox.

## What Phase 9 added — HOD Portal (backend + frontend, fully closed)

- **Backend:** new `Api\V1\Hod` controllers, all resolving to exactly one
  department via a `ResolvesHodDepartment` trait (requires the HOD's
  account to have a single `role_user` department scope — a clear,
  actionable error if not, rather than guessing):
  - `HodDashboardController` — department name/school, active student
    count, distinct-lecturer staff count, pending (SUBMITTED) registration
    count, pending (SUBMITTED) result count.
  - `HodStudentController` — the department's students (reuses
    `StudentResource`, paginated, filterable by status).
  - `HodStaffController` — lecturers currently teaching the department's
    course offerings (there's no `staff_department` table — this is
    derived from real course-offering assignments rather than inventing
    a new table for one read-only listing).
  - `HodAcademicController` — the department's programmes and course
    offerings, read-only (write access to the academic catalogue stays
    under the existing `academic_structure.manage`/`courses.*`
    permissions — an HOD gets registration/result decision authority,
    not academic-structure authority).
  - `HodReportController` — student/registration/result counts grouped by
    status for the department (a lightweight department report; the full
    institution-wide reporting surface is Phase 20).
  All registered under `role:hod` + `/api/v1/hod/*`.
- **Bug fix found while building the frontend:** every paginated staff
  index() (`StaffApplicationController`, `StaffCourseRegistrationController`,
  `StaffResultReviewController`, and the new Hod controllers) was silently
  dropping pagination metadata — `ResourceCollection::collection($paginator)`
  only attaches `current_page`/`last_page`/`total` when Laravel's router
  calls its `toResponse()` directly, which never happens when it's nested
  inside `['data' => ...]` via `ApiResponse::success()`. Fixed once, at the
  source (`ApiResponse::normalizeData()`), so every paginated `success()`
  response now returns `{ items: [...], pagination: {...} }` instead of a
  bare, meta-less array. No existing frontend consumed the old flat-array
  shape yet (verified — this was the first phase to build a frontend
  consumer for any of these endpoints), so this was safe to fix outright
  rather than version or work around.
- **Frontend:** `frontend/src/app/hod/*` — a full HOD portal:
  - `/hod` — dashboard (the stats above, linking into each section).
  - `/hod/registrations` — pending course registrations with inline
    Approve / Return-with-reason actions (proxied through
    `/api/hod/registrations/[id]/{approve,reject}` Route Handlers to the
    existing Phase 7 staff endpoint, now department-scoped).
  - `/hod/results` — pending results with a "Mark reviewed" action
    (proxied through `/api/hod/results/[id]/review` to the existing
    Phase 8 staff endpoint, now department-scoped).
  - `/hod/students`, `/hod/staff`, `/hod/academics` (programmes + course
    offerings), `/hod/reports` — read-only listings.
  - A `role:hod` gate in `hod/layout.tsx` (UX only — Laravel's own
    `role:hod` middleware is the real boundary) redirects non-HOD
    sessions to `/portal`; `/portal` itself now links into `/hod` for HOD
    accounts, following the same pattern as its existing
    `users.manage` example.
  - `Badge` gained `success`/`danger` tones (only `sky`/`amber`/`muted`
    existed before) for student-status colour-coding.
- **Verified live, end-to-end** (matches this project's standing
  verification method — still no PHP/Composer in this sandbox): `npm run
  build` (clean TypeScript compile, all `/hod/*` routes + 3 new Route
  Handlers listed in the build output) and `npx eslint` (clean) on every
  new/changed frontend file; then a Python stub server reproducing
  Laravel's exact envelope/pagination shape, with a real `next start`
  server in front of it — logged in as a scoped sample HOD, confirmed
  every `/hod/*` page renders real data, confirmed both mutation actions
  (approve, review) actually change state through the Route Handlers,
  confirmed a non-HOD session is redirected away from `/hod`, and
  confirmed an unscoped-HOD account renders a clean "Department not
  configured" empty state instead of crashing.
- **Phase 9 is now fully closed** — backend, business rules, API,
  authorization, frontend, and verification are all done, not just the
  backend half from the prior session.

## What Phase 10 added — Finance & Bursary (backend + frontend, fully closed)

Payment gateway is **Korapay** (per Abee's correction), not Interswitch —
the abstraction itself doesn't care which provider is configured, but the
concrete third driver alongside Paystack/Flutterwave is `KorapayGateway`.

- **Backend:** 7 migrations (`fee_structures`, `fee_items`,
  `invoice_number_counters`, `invoices`, `invoice_items`, `payments`,
  `financial_transactions` — exactly the spec's §32 Finance domain, no
  more, no less) and matching models. Money is DECIMAL everywhere; no fee
  amount is hardcoded anywhere in application code — every one comes from
  a `FeeItem` an institution configures.
  - **Payment gateway abstraction** (§21): `PaymentGatewayContract`
    interface + `PaymentGatewayManager`, with real drivers for
    **Paystack**, **Flutterwave**, and **Korapay** written against each
    provider's actual documented API (untestable in this sandbox — no
    outbound network access — but not stubs; each is flagged as needing
    confirmation against a live secret key before production), plus a
    genuinely functional **TestGateway** for dev/demo/manual-payment use.
  - **`PaymentVerificationService`** is the one and only code path
    allowed to mark a payment SUCCESSFUL and touch an invoice's balance —
    row-locked, idempotent (a webhook firing twice, or racing a manual
    "re-check", never double-credits), and rejects on gateway-reported
    amount mismatch rather than trusting the caller. Refunds append a new
    ledger row rather than editing the original payment (§35 — nothing
    here is ever silently overwritten).
  - `InvoiceGenerationService` resolves the best-matching `FeeStructure`
    for a student's (session, programme, level) by specificity, and is
    idempotent the same way `AdmissionConversionService` is — regenerating
    against the same structure returns the existing invoice.
  - `InvoiceNumberGenerator`/`PaymentReferenceGenerator` follow the same
    locked-counter / collision-checked pattern as `MatricNumberGenerator`.
  - New permissions `fee_structures.manage`, `invoices.manage`,
    `invoices.view` (the spec's own §4 list only names `payments.*`, not
    fee/invoice management) — Bursary Officer holds all of them; students
    reach their own invoices via ownership, not a permission, same
    pattern as course registrations/results.
  - `/payments/webhook/{gateway}` is necessarily public (a gateway can't
    hold a Sanctum session) — protected by each driver's own
    `verifyWebhookSignature()` plus the fact that nothing downstream
    trusts the webhook body itself, only what `verify()` gets back from
    re-querying the gateway's own API.
- **Frontend:** `/student/fees` (a student's own invoices, balances, and
  a "Pay" flow — for the `test` gateway specifically, since there's no
  live checkout page, a "Simulate Payment (dev/demo)" step exercises the
  exact same signed-webhook → verify → apply pathway a real gateway
  would use, via a new `/api/payments/simulate` Route Handler). A full
  `/bursary/*` portal (dashboard, fee-structure creation with a dynamic
  item builder, invoice generation/void, payment re-check/refund),
  gated by `role:bursary_officer`. `/portal` now links into both for the
  relevant roles.
- **Known limitation, stated plainly:** invoice generation and the
  Bursary "generate invoice" form take a raw numeric student ID — there's
  no student search yet (that's Phase 22, Global Search), so this is
  genuinely awkward to use today. Flagged in the UI copy itself rather
  than hidden.
- **Verified live, end-to-end**, same standard as Phase 9: `npm run
  build` (clean) and `eslint` (clean) on every new/changed file; the core
  `PaymentVerificationService` idempotency/mismatch/refund logic checked
  against a Python stub mirroring the PHP exactly (full payment,
  idempotent replay, partial-then-partial, amount-mismatch rejection,
  gateway-failure, refund-reopens-balance — all pass); then a real `next
  start` server against a Python stub reproducing Laravel's exact
  envelope — logged in as both a student and a Bursary Officer and
  confirmed the entire loop for real: initiate a payment → simulate the
  webhook → status flips to SUCCESSFUL → invoice shows PARTIALLY_PAID/
  PAID → Bursary sees the same payment and can refund it → refund
  recorded. Also confirmed a non-Bursary session is redirected away from
  `/bursary`.
- One bug caught and fixed *during* this verification (not a
  pre-existing one): the stub itself was initially missing `total_amount`
  on fee structures, which the real `FeeStructureController::present()`
  always computes — caught by the live render throwing, not silently
  passed.
 
## What Phase 11 added — Registrar, Documents & Clearance (backend + frontend, fully closed)

- **Backend:** 6 migrations/models matching the spec's Documents+Clearance
  domains (`document_templates`, `document_requests`,
  `document_number_counters`, `issued_documents`, `clearance_requests`,
  `clearance_items`). Deliberately no separate "graduation" table —
  §32 doesn't list one, and Student already has a GRADUATED status
  (Phase 6); graduation is that existing status-change endpoint, now
  gated on a COMPLETED clearance rather than new infrastructure.
  - **Instant vs. requested documents**: Admission Letter, Course
    Registration Slip, Result Slip, and Payment Receipt are generated
    immediately by `DocumentIssuanceService` from real existing records
    (no student action needed beyond asking); Transcript, Statement of
    Result, and Clearance Certificate go through a `DocumentRequest` a
    Registrar processes (REQUESTED → READY/REJECTED → ISSUED). Every
    `IssuedDocument.content` is a point-in-time JSON snapshot — never a
    live join — so a later result correction can't silently rewrite a
    document that already left the institution.
  - **Verification codes are separate from document numbers** on
    purpose: `/verify/{code}` (now wired to real data — was a Phase 3
    placeholder) looks up by the random `verification_code`, and
    `IssuedDocument::toPublicArray()` is the only thing the public route
    can ever return — never the private `content` snapshot (§22).
  - **Clearance** (`ClearanceService`): every request gets the spec's
    fixed 5-stage pipeline (DEPARTMENT → LIBRARY → BURSARY → REGISTRY →
    EXAMINATION) as 5 `ClearanceItem` rows; `ClearanceRequest.status` is
    *derived* from its items (`recomputeStatus()`) and never set
    directly by a controller, so it can't drift out of sync. A new
    `ClearanceItemPolicy` (+ `ClearanceItem::STAGE_ROLES`) enforces that
    each stage can only be decided by its owning role (an HOD can't
    approve a BURSARY item), and folds in the same department-scoping
    rule as `CourseRegistrationPolicy`/`ResultPolicy` for the DEPARTMENT
    stage. `StudentController::updateStatus()` now refuses a transition
    to GRADUATED without a COMPLETED clearance on record (§16).
  - New permissions `clearance.approve`/`clearance.view`, assigned to
    every stage-owning role (hod, library_officer, bursary_officer,
    registrar, academic_officer).
  - Caught and fixed during this phase, before it shipped: an initial
    version of `StaffClearanceController::index()` filtered "which
    requests touch my stage" *after* `paginate()`, which would have left
    the pagination metadata (total/last_page) describing the unfiltered
    set. Moved the filter into the SQL query (`whereHas`) before
    pagination instead.
- **Frontend:** `/student/documents` (generate instant documents,
  request the staff-processed ones, see both lists) and
  `/student/clearance` (status + start button). `/registrar` (dashboard +
  document-request processing/issuance) gated by `role:registrar`. A
  **shared** `/clearance` page — not tied to one role, gated by the
  `clearance.approve` *permission* instead, since five different roles
  own different stages of the same pipeline — that only renders a
  decide action for stages the viewer's own role owns (the backend
  policy is the real boundary; this is just so the UI doesn't offer a
  button that would 403). `/verify/[code]` now shows real verification
  results instead of the Phase 3 "not available yet" placeholder.
  `/portal` links into all of the above for the relevant roles/permission.
- **Known limitation, stated plainly:** no QR code image is generated
  anywhere — verification works via the text code and `/verify/{code}`
  URL only (§22 asks for "QR code" alongside verification code/URL). The
  architecture supports adding it trivially (the verification URL is
  already stable and public), but no QR image is rendered on an issued
  document or the verification page yet. Flagged here rather than
  quietly left out of this list.
- **Verified live, end-to-end**, same standard as Phases 9–10: `npm run
  build` (clean, all new routes present) and `eslint` (clean, after
  fixing one unescaped-apostrophe lint error) on every new/changed file;
  the clearance status-derivation logic (all-pending → in-progress →
  completed, and "any single rejection anywhere forces REJECTED even
  with everything else approved") and the graduation gate checked
  against a Python stub mirroring the PHP exactly; then a real `next
  start` server against a Python stub — as a student: generated an
  admission letter and registration slip instantly, requested a
  transcript, requested clearance, confirmed the status/stage list
  rendered correctly; as the Registrar: dashboard rendered, processed the
  transcript request to READY, issued it, confirmed the resulting
  verification code resolves correctly on the *public* `/verify/[code]`
  page; as a Library Officer: confirmed `/clearance` only offered a
  decide action on the LIBRARY stage (not DEPARTMENT), decided it
  APPROVED, and confirmed the student's own clearance page picked up the
  change (PENDING → IN_PROGRESS) without needing a page they don't have
  access to. Also confirmed a non-Registrar session is redirected away
  from `/registrar`.

## Immediate next target

**Phase 12 — SIWES & Student Services**: SIWES placement records
(organization, supervisor, dates, assessment) and a Helpdesk/support-ticket
system (categories, priority, staff replies, attachments). Per the
standing instruction as of Phase 9, this will be taken to full completion
— backend, frontend, and live verification — before moving to Phase 13.
