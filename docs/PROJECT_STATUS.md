# GD College Wase — Project Status & Gap Analysis

Last updated: Phase 8 completion.

## Starting a new chat? Read this first

This file is the single source of truth for where the project stands.
Before doing anything else in a fresh session:

1. Read this whole file, then `README.md` and `backend/README.md`.
2. This build environment (wherever Claude runs) may or may not have
   PHP/Composer — check with `which php composer`. If absent, the backend
   is still code-complete and reviewed (brace-balance checked, routes
   cross-referenced against controllers), just not executed. Say so
   plainly if that's still the case rather than assuming it's been fixed.
3. Every phase from 0–8 was verified by standing up a minimal Python stub
   in place of Laravel (matching the exact `{success, message, data}`
   envelope) and running the real Next.js app against it — because this
   sandbox couldn't run PHP. If a real Laravel instance is available, the
   very first thing worth doing is running the actual test commands in
   each phase's `backend/README.md` section against it for real, since
   stub-based tests prove the *contract*, not the real implementation.
4. Known, deliberately-documented gaps (don't silently "discover" and
   re-flag these as if new): department-scoping isn't enforced for HOD
   actions (Phase 5 admissions, Phase 7 registration, Phase 8 result
   review) — the `role_user.scope_type`/`scope_id` columns from Phase 1
   exist for this but aren't wired into a policy check anywhere yet.
   Carryover/prerequisite checks in Phase 7 are proxies pending real
   Results data (now that Phase 8 exists, this could finally be tightened
   — see "Immediate next target" below).

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
| Admissions | ✓ (verified live end-to-end against a stub, one gap noted below) | Staff review workflow (review → shortlist → admit/hold/reject), idempotent applicant-to-student conversion, and a public admission-list search. Every permission slug reused verbatim from the spec's own §4 list — no new permissions needed. |
| Student Information System | ✓ (verified live end-to-end, including history preservation) | Enrolment history and programme-transfer history verified to genuinely accumulate rather than overwrite — a student enrolled in two sessions and transferred programmes still shows both prior enrolment rows and the full transfer trail. Status changes are permission-gated and audited. Student self-service `/student/me` (matching the spec's own §33 API example) surfaces in the student's own portal view. |
| Course registration | ✓ (verified live end-to-end, one known scoping gap) | Draft → select courses → save → submit (server-side revalidated against the same rule set as save) → HOD approve/reject. Credit-limit rejection actually tested (a too-small selection was correctly rejected with the exact shortfall message), then a valid selection submitted and approved. Every permission slug reused verbatim from spec §4/§11. HOD department-scoping is not yet enforced — documented plainly, not silently skipped. |
| Lecturer/HOD portals | ✓ (verified live, full pipeline) | Lecturer: assigned courses, roster, bulk result entry, submit (locks editing). HOD/Academic Officer: results.review/verify/approve/publish, each its own permission. |
| Examination & results | ✓ (verified live, full pipeline) | Full DRAFT→SUBMITTED→REVIEWED→VERIFIED→APPROVED→PUBLISHED chain tested end-to-end with real grade computation (85 → grade A) from a DB-configurable grading scale and DB-configurable result components (not hardcoded CA=30/Exam=70). Confirmed a student sees nothing until PUBLISHED, then sees it immediately after. |
| Finance & payments | ✗ | Phase 12/13. |
| Registrar/documents/clearance | ✗ | Phase 14/15/16. |
| Notifications/CMS | ✗ | Phase 17/18. |
| SIWES/helpdesk | ✗ | Phase 19. |
| Management dashboard | ✗ | Phase 20. |
| System administration | ✗ | Phase 21. |
| Global search | ✗ | Phase 22. |
| Security/audit hardening | ✗ | Phase 23 (foundational conventions — env-driven CORS, no hardcoded secrets — are in place from Phase 0). |

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

## What Phase 5 added

- **Backend:** `admissions` (one decision per application — ADMIT/HOLD/
  REJECT, upserted so a decision can be corrected without leaving stale
  rows; audit log is the trail of who/when, not row history) and a
  minimal `students` table (Phase 6 will expand it with enrolments/
  programme history rather than duplicating it). `MatricNumberGenerator`
  mirrors Phase 4's `ApplicationNumberGenerator` — same locked-counter
  concurrency safety. `AdmissionConversionService` is explicitly
  idempotent: converting the same application twice returns the existing
  student rather than creating a duplicate, satisfying the spec's own
  requirement (§7, §36) directly. `StaffApplicationController` reuses the
  spec's exact permission slugs (`applications.view/review/shortlist/
  admit/reject`) with zero Phase-5 permission additions needed — unlike
  Phase 2/4 which each needed one new slug. A public `AdmissionListController`
  answers "check my status" queries with deliberately minimal disclosure
  (name, programme, decision — no contact details, no way to enumerate
  other applicants).
- **Frontend:** a real public admission-list search page; a staff
  admissions list + detail view with a permission-aware decision panel
  (review/shortlist/admit/hold/reject/convert), all through the same
  Next.js BFF pattern established in Phase 1 — no bearer token ever
  reaches client-side JavaScript.

**Verified live, end-to-end**, against an extended stub: staff login →
application list shows a pre-seeded SUBMITTED application → review →
shortlist → admit (with a reason) → convert to student (matric number
generated) → **called convert a second time and got the identical
student back, not a duplicate** — the idempotency guarantee actually
holds, not just in code review. One piece — the public admission-list
search finding a just-recorded decision — was reasoned through and fixed
in the stub (it wasn't URL-decoding query parameters the way Laravel
does automatically) but I wasn't able to get a clean live confirmation of
that specific path before this environment's background processes kept
dying between tool calls; worth a manual smoke-test first once the real
backend is running.

## What Phase 6 added

- **Backend:** expanded `students` (added `current_level_id`),
  `student_enrolments` (one row per session — never overwritten as a
  student progresses, per §36), and `student_programme_histories` (old
  and new programme both kept on every transfer). `MatricNumberGenerator`-
  style concurrency safety was already in place from Phase 5;
  `AdmissionConversionService` now also creates the entry-level enrolment
  row automatically at conversion time. `StudentController`,
  `StudentEnrolmentController`, `StudentTransferController` reuse the
  spec's exact permission slugs (`students.view/update/status.change`) —
  zero new permissions needed, same as Phase 5. `GET /student/me` matches
  the spec's own API example (§33) for student self-service.
- **Frontend:** staff student search (name/matric/email/phone) and a
  detail page showing profile, full enrolment history, and full programme-
  transfer history, plus an actions panel for status changes, adding a new
  session enrolment, and recording a transfer. The generic `/portal` page
  now shows a real student panel (matric number, programme, level, status)
  when the signed-in account holds the student role.

**Verified live, end-to-end**, against a stub: staff search finds the
student → detail page shows correct profile/programme/school chain →
**enrolled the student in a second session (2027/2028, ND II) — the
2026/2027 ND I enrolment row was preserved, not replaced** → **transferred
programme (CS → Accountancy) — the prior enrolment history stayed intact
and a new transfer-history row was added showing both the old and new
programme** → status change to SUSPENDED took effect → student's own
`/portal` view correctly showed their matric number and record → a
student-role account was correctly blocked from the staff student-search
page. One real bug was caught and fixed during this verification: the
initial test stub didn't implement the PATCH method Next.js was correctly
sending, producing a 500 — confirming the frontend's error path surfaces
backend failures rather than masking them, and a reminder that these
stub-based tests only prove the *contract*, not a substitute for testing
against the real Laravel app.

## Also fixed this phase: global sign-out

Logout previously only lived on `/portal`. `SiteHeader` is now an async
Server Component that checks the session and shows "My Portal" + a real
sign-out control from every page (desktop and mobile nav both), not just
one. Verified live: signed in, navigated to a staff-only page, confirmed
sign-out was visible and worked from there.

## What Phase 7 added

- **Backend:** `course_registrations` (one per student per semester —
  DB-enforced) and `course_registration_items` (no duplicate offering per
  registration — also DB-enforced), plus a `registration_opens_at`/
  `registration_closes_at` window added to `semesters`. A single
  `CourseRegistrationService` is the one place every rule from spec §11
  lives — programme match, duplicate prevention, credit limits
  (configurable, `config/course_registration.php`), the registration
  window, and prerequisites — and it's used by *both* the save-draft and
  submit endpoints, so neither can drift from the other. **Carryover and
  prerequisite checks are honestly weaker than the spec's ideal** until
  Phase 8 (Results) exists: a course is flagged "carryover" if its level
  differs from the student's current level (a proxy, not pass/fail-based),
  and a prerequisite is satisfied by "previously registered" rather than
  "previously passed" — both documented inline in code and config, with
  the exact line to tighten once real result data exists. HOD approval
  reuses the spec's exact `course_registrations.*` permission slugs. Also
  fixed a Phase 2 gap while I was in this code: `CourseOfferingController`
  never got a JSON-shape Resource wrapper, so its relation keys leaked
  Eloquent's camelCase method names — added `CourseOfferingResource` since
  Phase 7 depends on consuming that endpoint correctly.
- **Frontend:** a real student registration page (checkbox course list,
  live credit total, save/submit) and a real HOD review page
  (list → detail → approve/return-with-reason). `/portal` now links to
  both from a student's or approver's own dashboard.

**Verified live, end-to-end**: registering with only 3 credit units
correctly failed submission with the specific shortfall message
("Total credit units (3) is below the minimum of..."); registering 5
units succeeded; the HOD saw it appear in their review queue and approved
it; a student account was correctly blocked from the HOD review page.

**Known, documented gap:** HOD approval doesn't yet check department
scoping (an HOD can currently act on any registration, not just their
own department's) — the `role_user` scope columns to fix this exist since
Phase 1 but aren't wired into a policy check yet. Flagged in code and here
rather than silently left as a security assumption.

## What Phase 8 added

- **Backend:** `grading_scales` and `result_components` — both fully
  DB-configurable (§12: "do not hardcode CA=30/Exam=70" — a lecturer's UI
  and the grade calculator both read component names/max-scores from the
  DB, never a fixed pair). `results` — one row per student per course
  offering, `component_scores` as JSON keyed by component name (a
  documented simplification over a separate scores-per-component table,
  since components are a tiny fixed set per institution). `GradeCalculator`
  computes totals and looks up the grade/point purely from DB data. The
  full status pipeline from §12 (DRAFT → SUBMITTED → REVIEWED → VERIFIED →
  APPROVED → PUBLISHED) with one permission per transition, reusing the
  spec's exact `results.*` slugs — no new permissions needed, same as
  Phases 5–7. `StudentResultController` is the *only* results endpoint a
  student role can reach, and it hard-filters to PUBLISHED regardless of
  query params — "students see only published results" isn't a frontend
  convention, it's enforced at the one place students can read from.
  `CourseOfferingPolicy` ensures a lecturer only ever touches their own
  assigned offerings. Also fixed while touching adjacent code: added
  `ResultComponentController` (a small new read endpoint so frontends
  never hardcode component names).
- **Frontend:** lecturer course list + a result-entry grid with dynamic
  columns (rendered from whatever components are DB-configured, not
  hardcoded "CA"/"Exam" headers), save-draft/submit; a staff results
  queue showing only the action the signed-in account is permissioned for
  at each result's current stage; a student results page.

**Verified live, end-to-end, the full chain**: lecturer entered CA=25 +
Examination=60 → computed total 85, grade A (from the seeded default
scale) → saved as draft → submitted (locked from further lecturer
editing) → HOD reviewed → **student checked results and correctly saw
nothing** (still pre-publication) → Academic Officer verified → approved
→ published → **student then saw the published A** immediately. This is
the first phase where every stage of a genuinely multi-role,
multi-approval-stage pipeline was exercised in one continuous run.

**One stub bug caught during testing** (not app code): my test stub
initially gave lecturer/HOD/AO accounts empty permission arrays, so
Phase 8's own permission checks correctly blocked them — a good sign
(the checks work), but a reminder to always give stub accounts realistic
permissions matching `RolePermissionSeeder` rather than assuming a role
name alone is enough.

## Immediate next target

**Phase 9 — Result Correction & Academic Progression**: `results.correct`
(already a seeded permission, unused until now) for handling a published
result that turns out to be wrong — old/new value, reason, approval chain,
full audit trail, never an in-place edit. Then academic standing
(GOOD_STANDING/PROBATION/AT_RISK/COMPLETED) computed from real GPA/CGPA
now that Phase 8 produces real grade points. This is also the point to
revisit Phase 7's carryover/prerequisite proxies — real pass/fail data
finally exists to check against.

Also worth doing whenever a real PHP environment is available for the
first time: run `composer install`, `migrate`, `db:seed`, and manually
replay a few of the `curl` sequences from `backend/README.md`'s phase
sections against the genuine backend, since every verification so far has
been against a stand-in stub.
