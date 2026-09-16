# GD College Wase — Project Status & Gap Analysis

Last updated: Phase 14 (Security audit + Testing groundwork) complete.

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
| SIWES/helpdesk | ✓ | Phase 12 — see below. |
| Management dashboard | ✓ | Phase 13 — see below. |
| System administration | ✗ | Phase 21. |
| Global search | ✗ | Phase 22. |
| Security/audit hardening | ⚠ | Foundational conventions in place since Phase 0; HOD department scoping closed in Phase 9; password reset/change, rate limiting, and a result-approval self-dealing gap closed in Phase 14 (see below). Deployment/monitoring/production hardening remains a separate future phase. |

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

## What Phase 12 added — SIWES & Student Services (backend + frontend, fully closed)

- **Backend:** 3 migrations/models matching the spec's exact §32 domain
  (`siwes_records`, `support_tickets`, `ticket_messages`) — no logbook
  table, since the spec itself explicitly defers "detailed logbook
  functionality" to a later phase; this is the placement record plus a
  single overall assessment, not a weekly-entry logbook.
  - **SIWES**: a student self-reports their placement (organization,
    supervisor, dates) — ownership-scoped, no permission needed, same
    pattern as invoices/results/documents. The `siwes_coordinator`
    role now holds `siwes.manage`: reviewing placements, changing status
    (PENDING/ACTIVE/COMPLETED/TERMINATED), and recording a 0–100
    assessment score + remark.
  - **Helpdesk**: one `TicketController` serves both sides (§28
    explicitly covers students AND applicants, and staff) rather than
    splitting into separate controllers — almost every action (view,
    reply) is the same operation with a different authorization source
    (`$ticket->user_id === Auth::id()` vs. holding `helpdesk.manage`),
    checked inline rather than via route-level role middleware. A staff
    reply on an OPEN ticket moves it to IN_PROGRESS; a requester's reply
    to a WAITING ticket brings it back to OPEN — neither touches a
    RESOLVED/CLOSED ticket, which only an explicit staff status change
    can reopen. Attachments reuse Phase 4's exact private-disk +
    ownership-checked-download pattern (`ApplicationDocumentController`)
    — never a public URL.
  - New permissions `siwes.manage`, `helpdesk.manage`, `helpdesk.view`,
    assigned to `siwes_coordinator` and `registrar`/`ict_administrator`
    respectively.
- **Frontend:** `/student/siwes` (submit + track placement) and a shared
  `/siwes` staff page (gated by the `siwes.manage` permission, not a
  role — consistent with `/clearance`'s pattern). A shared `/tickets`
  list + `/tickets/new` + `/tickets/[id]` thread view — the *same*
  three routes serve both a student's own tickets and a staff member's
  full queue, branching on `can(session, "helpdesk.view")`. `/portal`'s
  "Available to you" list gained entries for all of the above.
- **Known limitation, stated plainly:** the backend fully supports a
  file attachment on a ticket reply (multipart upload, private disk,
  ownership-checked download); the frontend reply form does not yet
  send one — proxying `FormData` through a Next.js Route Handler is a
  different code path from the JSON proxying used everywhere else.
- **Verified live, end-to-end**, same standard as Phases 9–11: build +
  lint clean; SIWES submit → coordinator review → assessment, and
  ticket create → staff reply (auto OPEN→IN_PROGRESS) → resolve →
  thread-render, both confirmed against a live `next start` + stub
  server run.

## Repository reconciliation (start of this session's regression check)

Abee asked for a full regression check — "does everything work
end-to-end," every portal route tested, **compared against what's
actually on the repo** — before starting Phase 13 in a new chat. Doing
that surfaced something important enough to document here rather than
just fix quietly:

**The live GitHub repo had diverged from this session's own working
copy.** A fresh clone showed real, high-quality independent work already
merged into `main` that this session had no knowledge of — most
likely another Claude session (very possibly Claude Code, given the
directness of the commits) working the exact gaps this document had
been flagging as "backend-only, frontend deferred":

- A full **Lecturer Portal** (`/lecturer/courses`, course detail, result
  entry) — Phase 8's backend, frontend never built here.
- **Student course registration** (`/student/registration`) and
  **student results** (`/student/results`) — Phase 7/8 backends,
  frontend never built here.
- **General staff screens** for admissions, course-registration review,
  results, and student records (`/staff/admissions`, `/staff/course-
  registrations`, `/staff/results`, `/staff/students`) — Phases 4–8's
  backends, frontend never built here.
- A session-aware `SiteHeader`/`MobileNav` (shows "My Portal"/sign-out
  when logged in, not just static "Student Login"/"Apply Now"), a fix
  to `session.ts`'s cookie `secure` flag (env-driven `COOKIE_SECURE`
  instead of tied to `NODE_ENV`, which this session had itself run into
  friction with during live verification), a `User::applicant()`
  relation, and broader CORS/dev-account seed coverage
  (`DevSampleStaffSeeder` now creates one dev account per staff role,
  not just HOD/lecturer).

None of this conflicted with what this session had built — the two
bodies of work touched almost entirely different files. Only a handful
of shared files needed a real merge, not an overwrite: `routes/api.php`,
`RolePermissionSeeder.php`, `DatabaseSeeder.php`, and `Student.php`
needed this session's Phase 12 additions folded in cleanly (upstream
was otherwise identical to this session's Phase 11 state on those
files); `portal/page.tsx` needed an actual three-way merge, combining
the other session's student-record panel with this session's
HOD/Bursary/Registrar/Clearance/SIWES/Tickets links into one coherent
`<ul>`. Everything else — `User.php`, `DevSampleStaffSeeder.php`,
`cors.php`, `session.ts`, `SiteHeader.tsx`, `MobileNav.tsx`,
`types/admissions.ts` — was left exactly as the other session left it;
this session had no reason to revert genuine improvements.

**The full regression check, run against that properly-merged tree**
(not this session's isolated sandbox): `npm run build` and `eslint`
clean across the *entire* combined codebase (75+ routes, both sessions'
work together) with zero errors; every portal route — public pages,
every authenticated page across every role (student, HOD, Bursary,
Registrar, Library, SIWES Coordinator, Lecturer, Admission Officer,
Academic Officer), every detail/nested page, every wrong-role redirect
— checked live against a comprehensive stub server. Two real 500s
turned up on first pass (`/student/registration`, `/lecturer/courses`)
— both traced to gaps in this session's stub server's response shapes
(missing a `programme` field on one endpoint, a wrong response shape
on another), **not** bugs in either session's application code; fixed
the stub, re-ran, and confirmed clean. Every route this session has
ever built was re-verified clean in the same pass.

**What this means going forward:** the zip-based delivery pattern this
session has used since Phase 9 is no longer sufficient on its own —
another party may have moved `main` forward between sessions. A fresh
chat picking up Phase 13 should start by cloning the live repo (not
trusting a locally-cached "cumulative" zip) before making changes, and
this session is packaging its Phase 12 delivery as a diff against the
*current* live repo state, not against its own earlier zips, to avoid
silently reverting the other session's work.

## What Phase 13 added — Management & Reporting (backend + frontend)

- **Backend:** a `GpaCalculationService` — genuinely new, not present anywhere
  before this phase. Results (Phase 8) only ever computed a per-course
  total/grade; nothing rolled results up into a student GPA/CGPA. Implements
  §14's formula (Quality Points = Grade Point × Credit Unit) over
  PUBLISHED results only. Documented, not silently assumed: it does **not**
  implement §14's "repeated/carryover course treatment" (no institutional
  policy for which attempt counts has been supplied, so both attempts count
  for now — the conservative reading, not the flattering one) and does not
  feed §15 Academic Progression (still ✗ — no progression-status field on
  `Student` yet, same reason).
  `ManagementDashboardController` (`GET /management/dashboard`) —
  institution-wide, filterable by academic_session_id/school_id/
  department_id/programme_id/level_id (exactly §29's filter list, never
  scoped to "my department" the way HOD's dashboard is): student counts
  (total/active/by status/by level/by programme/by school), admissions
  (applicants/applications/by status/by decision/trend by session), staff
  (active staff total + lecturers in the current filter scope), finance
  (invoiced/collected/outstanding + a 6-month revenue trend), academic
  performance (average CGPA + grade distribution, via the new service), and
  a graduation count. `ManagementReportController`
  (`GET /management/reports/students.csv`) — CSV export of the same
  filtered student roster, sharing one `ResolvesManagementFilters` trait
  with the dashboard so the two can't silently drift apart. New
  `reports.view` permission, granted only to `management` — routes are
  gated by `permission:reports.view` rather than `role:management`
  specifically so ICT/Super Administrator get the usual super-admin bypass
  without a second role grant, and so Management's permission set stays
  view-only (§29's "must not automatically receive system-administration
  privileges").
- **Frontend:** `/management/dashboard` — filter form (session/school/
  department/programme/level selects), KPI cards, status/level/school/
  programme breakdowns, a 6-month revenue trend, an average-CGPA card, and
  a CSV export button. Deliberately `/management/dashboard`, not
  `/management` — that URL is already the public "About → Management/
  Leadership" page from Phase 3; both routes coexist as sibling Next.js
  segments and both build cleanly (checked explicitly, since this was the
  one real naming collision risk in the phase). The CSV export streams
  through a new `/api/management/students-export` Route Handler (keeps the
  bearer token server-side — the browser only ever gets a same-origin URL
  it can navigate to for the download to trigger; no prior route in this
  codebase proxied a binary/CSV stream rather than JSON, so this is a new
  pattern here). `/portal`'s "Available to you" list gained an entry gated
  on `can(session, "reports.view")`.
- **Known gap, stated plainly:** "Graduation" is a KPI snapshot count only
  (`total_graduated`), not a trend — `Student` has a `GRADUATED` status but
  no `graduated_at` date or graduation-session link anywhere in the schema,
  so a time series isn't derivable yet. That belongs to the not-yet-built
  Graduation-processing feature (spec §16, distinct from the Clearance
  workflow Phase 11 already built) — noted here rather than fabricated.
- **Verified so far:** the GPA/CGPA weighted-average logic checked against
  a Python stub mirroring the PHP exactly (`backend/tests/manual/` —
  scratch verification, not part of the delivered zip, same as prior
  phases); `next build` and `eslint` clean across the full frontend
  (77 routes) including the two new `/management/dashboard` and
  `/api/management/students-export` routes and the pre-existing
  `/management` page, confirming no collision. Then live end-to-end
  against a stub server standing in for the five Laravel endpoints this
  phase calls: dashboard KPIs render correctly (all figures — student/
  applicant/finance/CGPA/revenue-trend numbers — traced from stub
  response through to rendered HTML); filters round-trip correctly
  (`?school_id=1&academic_session_id=1` reflected in both the form's
  initial state and the CSV export link); the CSV export streams with
  the correct `Content-Type`/`Content-Disposition` headers when
  authenticated and a clean 401 when not; a `student`-only session is
  redirected away from `/management/dashboard` to `/portal` (wrong
  permission), a fully unauthenticated request redirects to
  `/student/login?next=%2Fmanagement%2Fdashboard`; the pre-existing
  public `/management` leadership page still returns 200 alongside the
  new `/management/dashboard`, confirming the sibling-route naming
  decision above works as intended.

## What Phase 14 added — Security audit + Testing groundwork (backend + frontend)

Scoped deliberately: "Security, Testing & Production" as one phase covers
things this sandbox genuinely cannot build (no PHP/Composer/MySQL/real
server to deploy to — see the note at the top of this file). This phase
covers what actually is code: a real security audit of the existing
codebase, closing what it found, plus a first real automated test suite.
Production deployment stays a distinct, separate future phase.

- **Password reset + change — previously entirely missing.**
  `AuthController` only ever had register/login/logout/me; Phase 1's own
  "Password reset / Password change" requirement was never built. Added
  `PasswordController` (`forgot`/`reset`/`change`) using Laravel's
  built-in password broker — the `password_reset_tokens` table already
  existed in the Phase 0 skeleton migration, unused until now, so no new
  migration was needed. `forgot()` always returns the same message
  whether or not the email exists (no account-enumeration leak).
  `reset()` and `change()` both revoke tokens on success (reset revokes
  every session; change revokes every session but the current one).
  `User::sendPasswordResetNotification()` is overridden to send a new
  `ResetPasswordNotification` linking to the Next.js frontend's
  `/reset-password` page instead of Laravel's default Blade route (which
  doesn't exist in this API-only app). New `FRONTEND_URL` config/env var.
  Delivery goes through whatever `MAIL_MAILER` is configured — `log` in
  dev writes the email (link included) to `storage/logs/laravel.log`,
  enough to test the flow without real SMTP; real transactional email
  stays Phase 17's concern and this notification needs no changes when
  that lands. Audit-logged: `password.reset.requested`,
  `password.reset.completed`, `password.changed`.
  **Frontend:** `/forgot-password` and `/reset-password` pages, a
  "Forgot your password?" link added to the login form, and
  `/api/session/{forgot-password,reset-password}` proxy routes. The
  authenticated `change-password` endpoint is backend-only for now — no
  account/settings page exists anywhere in the frontend to put a change-
  password form on (a gap of its own, out of scope for this phase; noted
  here rather than silently built as new unrelated surface area).
- **Rate limiting — previously entirely absent.** `grep -r RateLimiter
  backend/app` returned nothing before this phase, despite §34 listing it
  as a requirement from the start. Added three named limiters in
  `AppServiceProvider`: `api` (60/min, general default across every
  authenticated route, keyed by user ID), `auth` (6/min, keyed by IP
  *and* the submitted email — so throttling one attacked account doesn't
  also lock out everyone else behind the same NAT/campus IP — applied to
  login/register/forgot-password/reset-password), and `public-lookup`
  (30/min, IP-keyed, applied to admission-list search and public document
  verification, both easy to script for enumeration).
- **Real authorization gap found and closed:** nothing prevented the
  lecturer who submitted a result from also approving it, if their
  account separately held `results.approve`/`verify`/`publish` (e.g. a
  dual-role account — plausible at a small college where the same person
  might double as lecturer and exam officer). It only "worked" before
  because the seeded `lecturer` role doesn't carry those permissions,
  which is not the same as it being enforced. `ResultPolicy` now checks
  the assigned lecturer at every stage (review/verify/approve/publish),
  and `StaffResultReviewController` now actually calls `$this->authorize()`
  for verify/approve/publish (it didn't before — only `review` was
  policy-checked).
- **Everything else in §42's "Verify that:" checklist was traced through
  the actual policy code and confirmed already correct**, not assumed:
  applicant cross-application access (`ApplicationPolicy`), HOD
  department-scoping (`ChecksDepartmentScope`), student self-only result
  access (`StudentResultController` derives the student from
  `Auth::user()->student`, never a route parameter — cross-student access
  isn't structurally possible there), and the Super Administrator-only
  `Gate::before` bypass correctly excluding ICT/System Administrator.
- **First real automated test suite.** `tests/Feature` had only the
  framework's default `ExampleTest.php` before this — zero real tests
  existed anywhere in 13 phases of business logic. Added
  `tests/Feature/Authorization/CriticalAuthorizationTest.php`, one test
  per line of §42's checklist (student cannot approve results; lecturer
  cannot approve their own — including the dual-role case above; HOD
  blocked from another department's result and confirmed allowed on their
  own; applicant blocked from another applicant's application; a
  student's results endpoint never returns another student's results;
  ICT Administrator blocked from bypassing `results.approve`; Super
  Administrator's deliberate bypass confirmed still works), plus two
  "should succeed" sanity checks so the new policy logic isn't proven
  correct only by everything returning 403.
  **Not executed** — no PHP/Composer/MySQL in this sandbox, same
  constraint as every other phase. Traced by hand against the actual
  model fillables/migrations/policies instead (documented inline in the
  test file). Run with `php artisan test --filter=CriticalAuthorizationTest`
  against a real environment before trusting it.
- **Verified so far:** full `next build` (Turbopack) + `eslint` clean
  across the whole frontend including the two new pages, zero errors.
  Password-reset flow live-verified end-to-end against a stub server:
  forgot-password always returns the generic message; reset-password
  succeeds with a valid token and returns a clean 422 with an invalid
  one; the reset page's "missing token/email" state renders when neither
  is present in the URL; the login page shows the new "Forgot your
  password?" link. The PHP-side authorization test suite and the
  ResultPolicy/rate-limiter changes could not be executed the same way —
  see above.

## Immediate next target

Get **Phase 14's PHP-side changes and the new test suite actually run**
against a real PHP/Composer/MySQL environment — this is the first phase
where "verified" doesn't mean "traced by hand", and that gap should close
as soon as possible. After that, continue toward the remaining phases:
System Administration (Phase 21 — roles/permissions/settings UI),
Global Search (Phase 22), Notifications/CMS (Phase 17/18), and eventual
Production Deployment — none started yet. Before starting any of them,
re-clone the live repo first — another session may have moved `main`
again, and this session's own Phase 13 zip had not yet been applied to
`main` when this session started (it had to re-apply that zip locally
before starting Phase 14 — check whether `main` has caught up before
building further on top of it).
