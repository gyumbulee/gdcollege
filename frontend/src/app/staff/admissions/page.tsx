import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { can } from "@/lib/auth/session";
import { listStaffApplications } from "@/lib/api/staffAdmissions";
import type { Application } from "@/types/admissions";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted"> = {
  SUBMITTED: "amber",
  UNDER_REVIEW: "sky",
  SHORTLISTED: "sky",
  ADMITTED: "sky",
  REJECTED: "muted",
  ON_HOLD: "amber",
};

export default async function StaffAdmissionsListPage() {
  const session = await getSession();

  if (!session) {
    return (
      <Container className="py-16">
        <EmptyState title="Sign in required" description="Sign in with a staff account that has admissions access." />
      </Container>
    );
  }

  if (!can(session, "applications.view")) {
    return (
      <Container className="py-16">
        <EmptyState
          title="You don't have access to this page"
          description="This area is for staff with admissions review permissions."
        />
      </Container>
    );
  }

  const token = await getSessionToken();
  const { body } = await listStaffApplications(token!);
  const applications: Application[] = body.success
    ? ((body.data as unknown as { data: Application[] }).data ?? (body.data as unknown as Application[]))
    : [];

  return (
    <Container className="py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
        Applications
      </h1>
      <p className="mt-1 text-sm text-muted">Submitted applications awaiting review or decision.</p>

      <div className="mt-8">
        {applications.length === 0 ? (
          <EmptyState title="No submitted applications" description="Applications will appear here once applicants submit them." />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-white">
            {applications.map((app) => (
              <li key={app.id}>
                <Link
                  href={`/staff/admissions/${app.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-surface"
                >
                  <div>
                    <p className="font-medium text-ink">{app.applicant.user.name}</p>
                    <p className="text-xs text-muted">
                      {app.application_number} · {app.programme?.name ?? "No programme selected"}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[app.status] ?? "muted"}>{app.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
