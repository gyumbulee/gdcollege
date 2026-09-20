/**
 * Resolves where a signed-in account should land after login: its most
 * relevant dashboard, rather than always the generic /portal hub.
 *
 * Checked in priority order (most specific/senior role first) so a
 * dual-role account (e.g. a lecturer who is also HOD) lands on the more
 * privileged dashboard. Roles with no dedicated dashboard yet (Library
 * Officer, and student/applicant which already have a rich /portal view)
 * fall through to /portal, which itself links out to every module the
 * account can reach — see app/portal/page.tsx.
 *
 * Keep this list in sync with RolePermissionSeeder's 13 role slugs.
 */
const ROLE_DASHBOARD_PRIORITY: Array<{ role: string; path: string }> = [
  { role: "super_administrator", path: "/admin" },
  { role: "ict_administrator", path: "/admin" },
  { role: "management", path: "/management/dashboard" },
  { role: "registrar", path: "/registrar" },
  { role: "bursary_officer", path: "/bursary" },
  { role: "hod", path: "/hod" },
  { role: "siwes_coordinator", path: "/siwes" },
  { role: "admission_officer", path: "/staff/admissions" },
  { role: "academic_officer", path: "/staff/results" },
  { role: "lecturer", path: "/lecturer/courses" },
  { role: "student", path: "/portal" },
  { role: "applicant", path: "/admissions/application" },
];

export function getDashboardPath(roles: string[] | undefined | null): string {
  if (!roles || roles.length === 0) {
    return "/portal";
  }

  const match = ROLE_DASHBOARD_PRIORITY.find((entry) => roles.includes(entry.role));
  return match?.path ?? "/portal";
}
