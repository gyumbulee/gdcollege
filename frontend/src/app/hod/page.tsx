import Link from "next/link";
import { getSessionToken } from "@/lib/auth/session";
import { getHodDashboard } from "@/lib/api/hod";
import { EmptyState } from "@/components/ui/EmptyState";

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="rounded-lg border border-border bg-white p-5 transition-colors hover:border-sky-dark">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-ink">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function HodDashboardPage() {
  const token = await getSessionToken();
  const { body } = await getHodDashboard(token!);

  if (!body.success) {
    return (
      <EmptyState
        title="Department not configured"
        description={body.message}
      />
    );
  }

  const dashboard = body.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-border bg-white p-5">
        <p className="text-sm text-muted">Department</p>
        <p className="mt-1 text-lg font-medium text-ink">{dashboard.department.name}</p>
        {dashboard.department.school && (
          <p className="text-sm text-muted">{dashboard.department.school}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active students" value={dashboard.students} href="/hod/students" />
        <StatCard label="Teaching staff" value={dashboard.staff} href="/hod/staff" />
        <StatCard
          label="Pending registrations"
          value={dashboard.pending_registrations}
          href="/hod/registrations"
        />
        <StatCard label="Pending results" value={dashboard.pending_results} href="/hod/results" />
      </div>
    </div>
  );
}
