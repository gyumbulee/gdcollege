import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getMyStudentRecord } from "@/lib/api/students";
import { getNotifications } from "@/lib/api/notifications";

/**
 * Generic authenticated landing page. Role-specific dashboards (lecturer,
 * HOD, registrar, management, admin, ...) are reachable from the links
 * below, filtered to whatever the signed-in account actually holds
 * permission for. Student accounts get a real summary panel here too.
 * This still proves the auth flow end-to-end: login → httpOnly session →
 * protected page → permission-aware UI → logout.
 */
export default async function PortalPage() {
  const session = await requireSession("/portal");

  const token = await getSessionToken();
  const studentRecord = session.roles.includes("student")
    ? await getMyStudentRecord(token!)
    : null;
  const notificationsResult = await getNotifications(token!);
  const unreadCount = notificationsResult.body.success ? notificationsResult.body.data.unread_count : 0;

  const hasAnyModule =
    can(session, "students.view") ||
    can(session, "applications.view") ||
    can(session, "course_registrations.view") ||
    can(session, "results.enter") ||
    can(session, "results.review") ||
    can(session, "results.verify") ||
    can(session, "results.approve") ||
    can(session, "results.publish") ||
    can(session, "siwes.manage") ||
    can(session, "reports.view") ||
    can(session, "users.manage") ||
    can(session, "roles.manage") ||
    can(session, "audit_logs.view") ||
    can(session, "institution.manage") ||
    can(session, "payments.view") ||
    can(session, "courses.view") ||
    can(session, "clearance.approve") ||
    session.roles.includes("student") ||
    session.roles.includes("hod") ||
    session.roles.includes("bursary_officer") ||
    session.roles.includes("registrar");

  return (
    <Container className="flex flex-col gap-8 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Signed in as</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            {session.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {session.roles.map((role) => (
              <Badge key={role} tone="sky">
                {role.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/notifications" className="text-sm text-sky-dark hover:underline">
            Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Link>
          <SignOutButton />
        </div>
      </div>

      {studentRecord?.body.success && (
        <div className="rounded-lg border border-border bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-ink">Your student record</p>
            <Link href="/student/registration" className="text-sm text-sky-dark hover:underline">
              Register courses
            </Link>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted">Matric number</dt>
              <dd className="text-ink">{studentRecord.body.data.matric_number}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Programme</dt>
              <dd className="text-ink">{studentRecord.body.data.programme?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Level</dt>
              <dd className="text-ink">{studentRecord.body.data.current_level?.name ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Status</dt>
              <dd className="text-ink">{studentRecord.body.data.status}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="rounded-lg border border-border bg-white p-6">
        <p className="text-sm font-medium text-ink">Available to you</p>
        <p className="mt-1 text-sm text-muted">
          This section grows as each phase adds role-specific dashboards.
          Below are live examples: these links only appear because your
          account holds the matching permission — the backend independently
          enforces this on every request, this is just the UI reflecting it.
        </p>

        <ul className="mt-4 space-y-1 text-sm">
          {can(session, "students.view") && (
            <li>
              <Link href="/staff/students" className="text-sky-dark hover:underline">Student records</Link>
            </li>
          )}
          {can(session, "applications.view") && (
            <li>
              <Link href="/staff/admissions" className="text-sky-dark hover:underline">Admissions review</Link>
            </li>
          )}
          {can(session, "course_registrations.view") && (
            <li>
              <Link href="/staff/course-registrations" className="text-sky-dark hover:underline">Course registrations</Link>
            </li>
          )}
          {can(session, "results.enter") && (
            <li>
              <Link href="/lecturer/courses" className="text-sky-dark hover:underline">My courses (results entry)</Link>
            </li>
          )}
          {(can(session, "results.review") || can(session, "results.verify") || can(session, "results.approve") || can(session, "results.publish")) && (
            <li>
              <Link href="/staff/results" className="text-sky-dark hover:underline">Results pipeline</Link>
            </li>
          )}
          {session.roles.includes("student") && (
            <li>
              <Link href="/student/results" className="text-sky-dark hover:underline">My results</Link>
            </li>
          )}
          {session.roles.includes("hod") && (
            <li>
              <Link href="/hod" className="text-sky-dark hover:underline">HOD Portal — department dashboard, registrations &amp; results review</Link>
            </li>
          )}
          {session.roles.includes("student") && (
            <>
              <li>
                <Link href="/student/fees" className="text-sky-dark hover:underline">My Fees — invoices, balances &amp; payment</Link>
              </li>
              <li>
                <Link href="/student/documents" className="text-sky-dark hover:underline">My Documents — generate slips/letters, request transcripts</Link>
              </li>
              <li>
                <Link href="/student/clearance" className="text-sky-dark hover:underline">My Clearance — track your clearance stages</Link>
              </li>
              <li>
                <Link href="/student/siwes" className="text-sky-dark hover:underline">My SIWES — submit &amp; track your placement</Link>
              </li>
            </>
          )}
          <li>
            <Link href="/tickets" className="text-sky-dark hover:underline">
              {can(session, "helpdesk.view") || can(session, "helpdesk.manage")
                ? "Helpdesk — all support tickets"
                : "Support — my tickets"}
            </Link>
          </li>
          {can(session, "siwes.manage") && (
            <li>
              <Link href="/siwes" className="text-sky-dark hover:underline">SIWES Coordination — review placements &amp; record assessments</Link>
            </li>
          )}
          {session.roles.includes("bursary_officer") && (
            <li>
              <Link href="/bursary" className="text-sky-dark hover:underline">Bursary Portal — fee structures, invoices &amp; payments</Link>
            </li>
          )}
          {session.roles.includes("registrar") && (
            <li>
              <Link href="/registrar" className="text-sky-dark hover:underline">Registrar Portal — students, document requests &amp; issuance</Link>
            </li>
          )}
          {can(session, "reports.view") && (
            <li>
              <Link href="/management/dashboard" className="text-sky-dark hover:underline">Management Dashboard — institution-wide KPIs &amp; reports</Link>
            </li>
          )}
          {(can(session, "users.manage") || can(session, "roles.manage") || can(session, "audit_logs.view") || can(session, "institution.manage")) && (
            <li>
              <Link href="/admin" className="text-sky-dark hover:underline">System Administration — users, roles, audit logs &amp; institution settings</Link>
            </li>
          )}
          {(can(session, "students.view") || can(session, "applications.view") || can(session, "payments.view") || can(session, "courses.view")) && (
            <li>
              <Link href="/search" className="text-sky-dark hover:underline">Search — students, applications, payments &amp; courses</Link>
            </li>
          )}
          {can(session, "clearance.approve") && (
            <li>
              <Link href="/clearance" className="text-sky-dark hover:underline">Clearance — decide the stages assigned to your role</Link>
            </li>
          )}
          {!hasAnyModule && (
            <li className="text-muted">No specific tools are assigned to your account yet — contact ICT/System Administration if this doesn&apos;t look right.</li>
          )}
        </ul>
      </div>
    </Container>
  );
}
