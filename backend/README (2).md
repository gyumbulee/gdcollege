# GD College Wase — Backend (Laravel)

## Important: this skeleton was hand-authored, not `composer install`-ed

The environment used to prepare this phase has no PHP/Composer runtime and
no network access to Packagist, so the Laravel framework itself could not
be installed or executed here. What's included in this folder is:

- `composer.json` — the exact dependency set (Laravel 11, Sanctum, Pint,
  PHPUnit, etc.)
- `.env.example` — every environment variable this phase's code expects
- `routes/api.php`, `app/Http/Controllers/Api/V1/HealthController.php`,
  `app/Http/Controllers/Controller.php` — the API foundation and response
  envelope convention
- `config/cors.php`, `config/sanctum.php` — CORS and Sanctum wired to the
  frontend's origin via env vars

These are the application-level files. The Laravel framework itself
(`vendor/`, `artisan`, `bootstrap/app.php`, default `config/*.php`,
default migrations, etc.) is **not** included, because generating it
without Composer would mean fabricating framework internals — that's
worse than not including it at all.

## Setup (run this on a machine with PHP 8.3+ and Composer)

```bash
# 1. From the monorepo root, create the real Laravel skeleton in a temp
#    folder, then merge this phase's files on top of it:
composer create-project laravel/laravel:^11.0 backend-tmp
rsync -a --ignore-existing backend/ backend-tmp/   # copy our files in, don't clobber vendor/
rm -rf backend && mv backend-tmp backend

# 2. Install dependencies from this composer.json (adds Sanctum etc.)
cd backend
composer install

# 3. Environment
cp .env.example .env
php artisan key:generate

# 4. Database (create a MySQL database named `gdcollege` first)
php artisan migrate

# 5. Run it
php artisan serve
# → http://localhost:8000/api/v1/health should return
#   { "success": true, "message": "GD College Wase API is running.", ... }
```

## Conventions established in this phase

- **API prefix:** everything lives under `/api/v1/`.
- **Response envelope:** success responses are
  `{ "success": true, "message": "...", "data": {} }`; validation errors are
  `{ "success": false, "message": "...", "errors": {} }`. See
  `HealthController` for the reference shape.
- **Auth:** Laravel Sanctum, SPA cookie-based, stateful domains driven by
  `SANCTUM_STATEFUL_DOMAINS` in `.env` — this must match the Next.js
  frontend's origin(s).
- **CORS:** allowed origins come from `CORS_ALLOWED_ORIGINS` in `.env`,
  not hardcoded in `config/cors.php`.
- Business logic belongs in Actions/Services, not directly in controllers —
  this becomes concrete starting Phase 1 (Auth & RBAC), the first phase
  with real domain logic.

## Phase 1 — Core Infrastructure (this phase)

Adds: institutions/roles/permissions/role_user/permission_role/audit_logs
migrations, `User`/`Role`/`Permission`/`Institution`/`AuditLog` models,
token-based Sanctum auth (`/api/v1/auth/login|logout|me`), the
`permission:<slug>` route middleware, a Super Administrator Gate bypass,
an `AuditLogger` service, and RBAC seed data for all 13 roles.

Two files here are **reference snippets, not drop-in files** — Laravel 11
generates `bootstrap/app.php` and `bootstrap/providers.php` with a lot of
framework wiring that must stay intact, so rather than overwrite them
blind:

- `bootstrap/app.middleware-reference.php` shows what to add to your real
  `bootstrap/app.php`'s `->withMiddleware(...)` block.
- `bootstrap/providers.reference.php` shows the line to add to your real
  `bootstrap/providers.php`.

### After `composer install`, run:

```bash
php artisan migrate
php artisan db:seed
```

This seeds all 13 roles, the full permission list from the spec, a
starting permission-per-role assignment, and one development login:

```
email:    superadmin@gdcollegewase.test
password: ChangeMe!12345
```

**This is development/demo data only — change or remove it before
production (Phase 25).**

### Try it

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@gdcollegewase.test","password":"ChangeMe!12345"}'
# → { "success": true, "data": { "token": "...", "user": { ... } } }

curl http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <token from above>"
```

### Why token auth, not cookie-based SPA auth

Sanctum supports both. This phase uses **personal access tokens** (Bearer
auth) rather than cookie-based SPA auth, so the same API serves the Next.js
frontend and a future mobile client identically. The frontend never stores
this token in `localStorage`; see
`frontend/src/app/api/session/*/route.ts`, which holds it in an `httpOnly`
cookie via a thin Next.js proxy instead. `config/sanctum.php`'s
`stateful` domains are left configured in case you later add cookie-based
auth for a specific flow, but nothing in this phase depends on it.

## Phase 2 — Academic Structure (this phase)

Adds full CRUD for `schools`, `departments`, `programmes`,
`academic-sessions`, `semesters`, `levels`, `course-types`, `courses`
(with prerequisites), and `course-offerings` under `/api/v1/`. All
authenticated users can read; writes require the `academic_structure.manage`
permission (courses specifically use the spec's own `courses.create` /
`courses.update` slugs instead). Re-run the seeders to get sample data:

```bash
php artisan db:seed --class=Database\\Seeders\\AcademicStructureSeeder
# or just re-run everything:
php artisan migrate:fresh --seed
```

### Try it

```bash
curl http://localhost:8000/api/v1/schools \
  -H "Authorization: Bearer <token from /auth/login>"
# → School of Applied Sciences (Sample), with a departments_count

curl http://localhost:8000/api/v1/course-offerings \
  -H "Authorization: Bearer <token>"
# → CSC101 and CSC201 offerings for the 2026/2027 session
```

## Phase 4 — Applicant Portal (this phase)

Adds applicant self-registration and the full application wizard backend.
Two more reference-only files need merging into your real framework files
(same reasoning as Phase 1's — these aren't drop-in):

- `config/filesystems.disks-reference.php` — add the `private` disk entry
  to your real `config/filesystems.php`. Application documents are
  rejected as invalid if this disk isn't configured.
- `bootstrap/app.middleware-reference.php` was updated this phase to also
  register the `role` alias (`EnsureRole`) — re-check it against your real
  `bootstrap/app.php` even if you already merged Phase 1's version.

### Try it

```bash
# Register an applicant
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Applicant","email":"jane@example.test","password":"password123","password_confirmation":"password123"}'
# → token + user with roles: ["applicant"]

TOKEN="<token from above>"

# Start an application (uses whichever academic_session has is_current=true)
curl -X POST http://localhost:8000/api/v1/applications -H "Authorization: Bearer $TOKEN"

# Try to submit immediately — should fail with itemized completeness errors
curl -X POST http://localhost:8000/api/v1/applications/1/submit -H "Authorization: Bearer $TOKEN"
```

### Known gap, tracked deliberately

`applications.fee_paid` exists but submission does not require it
(`config('admissions.application_fee_required_before_submission')` is
`false`). This is intentional — there's no real payment gateway yet
(Phase 13), and a fake "mark as paid" button would violate the spec's own
rule that payment is only valid after backend verification. Flip that
config flag once Phase 13 makes `fee_paid` trustworthy.

## What's next (Phase 5)

Admissions Management — the staff side: screening, shortlisting, admit/
reject/hold decisions, the admission list, and applicant-to-student
conversion — see `../docs/PROJECT_STATUS.md`.
