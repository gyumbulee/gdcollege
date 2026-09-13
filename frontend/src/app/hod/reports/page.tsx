import { getSessionToken } from "@/lib/auth/session";
import { getHodReports } from "@/lib/api/hod";
import { EmptyState } from "@/components/ui/EmptyState";

function StatusBreakdown({ title, counts }: { title: string; counts: Record<string, number> }) {
  const entries = Object.entries(counts);

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">{title}</p>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No records yet.</p>
      ) : (
        <dl className="mt-3 flex flex-col gap-2">
          {entries.map(([status, count]) => (
            <div key={status} className="flex items-center justify-between text-sm">
              <dt className="text-muted">{status}</dt>
              <dd className="font-medium text-ink">{count}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default async function HodReportsPage() {
  const token = await getSessionToken();
  const { body } = await getHodReports(token!);

  if (!body.success) {
    return <EmptyState title="Could not load reports" description={body.message} />;
  }

  const report = body.data;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        A quick status breakdown for {report.department.name}. For institution-wide reporting, see
        Management &amp; Reporting (Phase 20) once it exists.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatusBreakdown title="Students" counts={report.students_by_status} />
        <StatusBreakdown title="Course Registrations" counts={report.registrations_by_status} />
        <StatusBreakdown title="Results" counts={report.results_by_status} />
      </div>
    </div>
  );
}
