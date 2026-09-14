import { getSessionToken } from "@/lib/auth/session";
import { getRegistrarDashboard } from "@/lib/api/documents";
import { EmptyState } from "@/components/ui/EmptyState";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-ink">{value}</p>
    </div>
  );
}

export default async function RegistrarDashboardPage() {
  const token = await getSessionToken();
  const { body } = await getRegistrarDashboard(token!);

  if (!body.success) {
    return <EmptyState title="Could not load the registrar dashboard" description={body.message} />;
  }

  const data = body.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Active students" value={data.active_students} />
        <StatCard label="Pending document requests" value={data.pending_document_requests} />
        <StatCard label="Ready to issue" value={data.ready_document_requests} />
        <StatCard label="Clearance completed" value={data.clearance_completed} />
      </div>

      <div className="rounded-lg border border-border bg-white p-5">
        <p className="font-medium text-ink">Students by status</p>
        <dl className="mt-3 flex flex-col gap-2">
          {Object.entries(data.students_by_status).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <dt className="text-muted">{status}</dt>
              <dd className="font-medium text-ink">{count}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
