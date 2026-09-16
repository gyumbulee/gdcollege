# GD College Wase — Integrated Institution Management Platform

Goran Dutse College of General Studies Wase — public website, applicant
portal, admissions, SIS, academics, course registration, examinations,
finance, staff portals, registrar, documents, clearance, CMS, and
management reporting, as one platform.

```
gdcollege/
├── frontend/   Next.js + TypeScript + Tailwind CSS
├── backend/    Laravel + Sanctum + MySQL (REST API, /api/v1/)
└── docs/       Architecture notes, phase plan, gap analysis
```

Frontend never talks to MySQL directly — everything goes through the
Laravel REST API.

## Quick start

**Frontend** (works as-is, no external services required):
```bash
cd frontend
npm install
npm run dev
```

**Backend** (needs PHP 8.3+/Composer on the machine you run this on —
see `backend/README.md` for why and for the exact setup commands):
```bash
cd backend
# follow backend/README.md
```

## Where to look first

- Current build status and phase-by-phase gap analysis: `docs/PROJECT_STATUS.md`
- Institution name/branding/logo/colour — single source of truth: `frontend/src/config/institution.config.ts`
- API conventions and backend setup: `backend/README.md`

## Progress so far

**Phase 0 — Foundation:** audited the existing repository (see
`docs/PROJECT_STATUS.md`), established the monorepo, a real working
branded public homepage, the Laravel application-level skeleton, and the
single-source-of-truth branding config.

**Phase 1 — Core Infrastructure:** RBAC (13 roles, full permission list),
Sanctum token auth, audit logging, and a verified-live frontend auth flow
(httpOnly-cookie sessions, protected routes, permission-aware UI).

**Phase 2 — Academic Structure:** schools, departments, programmes,
academic sessions, semesters, levels, course types, courses (with
prerequisites), and course offerings — full CRUD, permission-protected,
all configurable, seeded with clearly-marked sample data.

**Phase 3 — Public Institutional Website:** Academics pages now render
real data from the Phase 2 API (verified live end-to-end against a
stub); About/Management/Contact rebuilt with real structure and honest
placeholder content; News/Events/Gallery/Downloads/Admissions are
genuine empty states, not generic stubs; document verification has a
working search form and detail route.

**Phase 4 — Applicant Portal:** self-registration, a full multi-section
application wizard (personal/contact/next-of-kin, education history,
document uploads), and server-side submission validation — verified live
end-to-end including the reject-then-accept completeness-check path.

**Phase 5 — Admissions Management:** staff review workflow (review →
shortlist → admit/hold/reject), an idempotent applicant-to-student
conversion (verified live — converting twice returns the same student,
never a duplicate), and a public admission-list search.

**Phase 6 — Student Information System:** enrolment history and
programme-transfer history, both verified live to genuinely accumulate
rather than overwrite (a student enrolled in two sessions and transferred
programmes still shows the full history of both), plus student
self-service and staff search/profile views.

**Phase 7 — Course Registration:** save → submit → HOD approve/reject,
with credit-limit rejection actually tested live (not just reasoned
about), plus a fix so sign-out is now reachable from every page, not just
`/portal`.

**Phase 8 — Lecturer & HOD Portals + Results:** the full DRAFT →
SUBMITTED → REVIEWED → VERIFIED → APPROVED → PUBLISHED pipeline, verified
live end-to-end in one continuous run (lecturer entry through student
seeing the published grade) — including confirming students see nothing
before publication.

**Phase 9 — HOD Portal (dedicated):** department dashboard, students,
staff, academics, and reports screens, plus registration/result review
UI — verified live end-to-end against a stub.

**Phase 10 — Finance & Bursary:** fee structures, invoices, a payment
gateway abstraction (Paystack/Flutterwave/Korapay), webhook-driven
server-side verification, refunds — verified live end-to-end.

**Phase 11 — Registrar, Documents & Clearance:** document self-service,
staff-processed requests, public verification, a 5-stage clearance
pipeline, graduation gated on clearance — verified live end-to-end.

**Phase 12 — SIWES & Student Services:** student self-reported placements
with coordinator review/assessment, and a shared helpdesk (student/
applicant/staff on the same ticket thread) — verified live end-to-end.

**Phase 13 — Management & Reporting:** an institution-wide executive
dashboard (students/admissions/staff/finance/academic performance/
graduation), filterable by session/school/department/programme/level,
plus a CSV student-roster export — including a first-ever GPA/CGPA
calculation service the results pipeline never had before. Verified live
end-to-end, including confirming the new `/management/dashboard` and the
pre-existing public `/management` leadership page coexist cleanly.

**Phase 14 — Security audit + Testing groundwork:** password reset/change
(previously entirely missing — see `docs/PROJECT_STATUS.md`), rate
limiting (previously entirely absent), a real authorization gap closed
(a dual-role lecturer could have approved their own submitted result),
and the first automated test suite the repo has ever had, covering the
spec's own §42 authorization checklist. This phase's PHP-side changes
could not be executed in the sandbox they were written in (no PHP/
Composer/MySQL there) — run `php artisan test` against a real environment
before trusting them; the frontend half (password-reset pages) was
verified live end-to-end and builds clean.

**Starting a new chat to continue?** Read `docs/PROJECT_STATUS.md` first —
it opens with a short primer on exactly that.

See `docs/PROJECT_STATUS.md` for the full phase-by-phase breakdown and
exactly what's been verified running versus code-complete-but-unexecuted
(the sandbox this was built in has no PHP/Composer — see `backend/README.md`).
