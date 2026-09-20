import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Users, ClipboardCheck, ListChecks, BookOpen, BarChart3, Award,
  Building2, Wallet, FileText, CheckCircle2, Briefcase, LifeBuoy,
  ClipboardList, Landmark, Archive, LineChart, ShieldCheck, Search,
  CheckSquare, Bell, LayoutGrid,
} from "lucide-react";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/auth/dashboard";
import { getMyStudentRecord } from "@/lib/api/students";
import { getNotifications } from "@/lib/api/notifications";
import { PortalTile } from "@/components/portal/PortalTile";

/**
 * The authenticated landing hub. Every role lands on its own primary
 * dashboard straight from login (see lib/auth/dashboard.ts) — this page
 * is the "everything you can reach" grid, always available from the
 * header's "My Portal" link, and permission-aware throughout: a tile
 * only renders because the signed-in account actually holds the
 * matching permission — the backend independently enforces this on
 * every request regardless of what's shown here.
 */
export default async function PortalPage() {
  const session = await requireSession("/portal");

  const token = await getSessionToken();
  const studentRecord = session.roles.includes("student")
    ? await getMyStudentRecord(token!)
    : null;
  const notificationsResult = await getNotifications(token!);
  const unreadCount = notificationsResult.body.success ? notificationsResult.body.data.unread_count : 0;

  const tiles: Array<{ href: string; icon: typeof Users; title: string; description: string }> = [];

  if (can(session, "students.view")) {
    tiles.push({ href: "/staff/students", icon: Users, title: "Student Records", description: "Search and manage student records" });
  }
  if (can(session, "applications.view")) {
    tiles.push({ href: "/staff/admissions", icon: ClipboardCheck, title: "Admissions Review", description: "Screen and decide on applications" });
  }
  if (can(session, "course_registrations.view")) {
    tiles.push({ href: "/staff/course-registrations", icon: ListChecks, title: "Course Registrations", description: "Review student registrations" });
  }
  if (can(session, "results.enter")) {
    tiles.push({ href: "/lecturer/courses", icon: BookOpen, title: "My Courses", description: "Enter and submit results" });
  }
  if (can(session, "results.review") || can(session, "results.verify") || can(session, "results.approve") || can(session, "results.publish")) {
    tiles.push({ href: "/staff/results", icon: BarChart3, title: "Results Pipeline", description: "Review, verify, approve, publish" });
  }
  if (session.roles.includes("student")) {
    tiles.push({ href: "/student/results", icon: Award, title: "My Results", description: "View your published results" });
  }
  if (session.roles.includes("hod")) {
    tiles.push({ href: "/hod", icon: Building2, title: "HOD Portal", description: "Department dashboard, registrations & results" });
  }
  if (session.roles.includes("student")) {
    tiles.push({ href: "/student/fees", icon: Wallet, title: "My Fees", description: "Invoices, balances & payment" });
    tiles.push({ href: "/student/documents", icon: FileText, title: "My Documents", description: "Generate slips, letters & receipts" });
    tiles.push({ href: "/student/clearance", icon: CheckCircle2, title: "My Clearance", description: "Track your clearance stages" });
    tiles.push({ href: "/student/siwes", icon: Briefcase, title: "My SIWES", description: "Submit & track your placement" });
  }
  tiles.push({
    href: "/tickets",
    icon: LifeBuoy,
    title: can(session, "helpdesk.view") || can(session, "helpdesk.manage") ? "Helpdesk" : "Support",
    description: can(session, "helpdesk.view") || can(session, "helpdesk.manage") ? "All support tickets" : "My support tickets",
  });
  if (can(session, "siwes.manage")) {
    tiles.push({ href: "/siwes", icon: ClipboardList, title: "SIWES Coordination", description: "Review placements & assessments" });
  }
  if (session.roles.includes("bursary_officer")) {
    tiles.push({ href: "/bursary", icon: Landmark, title: "Bursary Portal", description: "Fee structures, invoices & payments" });
  }
  if (session.roles.includes("registrar")) {
    tiles.push({ href: "/registrar", icon: Archive, title: "Registrar Portal", description: "Students, documents & issuance" });
  }
  if (can(session, "reports.view")) {
    tiles.push({ href: "/management/dashboard", icon: LineChart, title: "Management Dashboard", description: "Institution-wide KPIs & reports" });
  }
  if (can(session, "users.manage") || can(session, "roles.manage") || can(session, "audit_logs.view") || can(session, "institution.manage")) {
    tiles.push({ href: "/admin", icon: ShieldCheck, title: "System Administration", description: "Users, roles, audit logs & settings" });
  }
  if (can(session, "students.view") || can(session, "applications.view") || can(session, "payments.view") || can(session, "courses.view")) {
    tiles.push({ href: "/search", icon: Search, title: "Search", description: "Students, applications, payments & courses" });
  }
  if (can(session, "clearance.approve")) {
    tiles.push({ href: "/clearance", icon: CheckSquare, title: "Clearance", description: "Decide the stages assigned to your role" });
  }

  const dashboardPath = getDashboardPath(session.roles);

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
          <Link href="/notifications" className="inline-flex items-center gap-1.5 text-sm text-sky-dark hover:underline">
            <Bell size={16} aria-hidden />
            Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
          </Link>
          <SignOutButton />
        </div>
      </div>

      {dashboardPath !== "/portal" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-sky-dark bg-sky-light/40 p-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-dark text-white">
              <LayoutGrid size={20} aria-hidden />
            </span>
            <div>
              <p className="font-medium text-ink">Your main dashboard</p>
              <p className="text-xs text-muted">The tools below also work — this jumps straight to your primary workspace.</p>
            </div>
          </div>
          <Button href={dashboardPath} variant="secondary">Open dashboard</Button>
        </div>
      )}

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

      <div>
        <p className="text-sm font-medium text-ink">Available to you</p>
        <p className="mt-1 text-sm text-muted">
          These tiles only appear because your account holds the matching permission —
          the backend independently enforces this on every request, this is just the UI reflecting it.
        </p>

        {tiles.length === 0 ? (
          <p className="mt-4 text-sm text-muted">
            No specific tools are assigned to your account yet — contact ICT/System Administration if this doesn&apos;t look right.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {tiles.map((tile) => (
              <PortalTile key={tile.href} {...tile} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
