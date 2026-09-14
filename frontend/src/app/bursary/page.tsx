import { getSessionToken } from "@/lib/auth/session";
import { getFinancialReport } from "@/lib/api/finance";
import { EmptyState } from "@/components/ui/EmptyState";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-ink">{value}</p>
    </div>
  );
}

function BreakdownCard({ title, counts }: { title: string; counts: Record<string, number> }) {
  const entries = Object.entries(counts);
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">{title}</p>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No records yet.</p>
      ) : (
        <dl className="mt-3 flex flex-col gap-2">
          {entries.map(([key, count]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <dt className="text-muted">{key}</dt>
              <dd className="font-medium text-ink">{count}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default async function BursaryDashboardPage() {
  const token = await getSessionToken();
  const { body } = await getFinancialReport(token!);

  if (!body.success) {
    return <EmptyState title="Could not load the financial report" description={body.message} />;
  }

  const report = body.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total invoiced" value={`₦${report.total_invoiced.toLocaleString()}`} />
        <StatCard label="Total collected" value={`₦${report.total_collected.toLocaleString()}`} />
        <StatCard label="Total outstanding" value={`₦${report.total_outstanding.toLocaleString()}`} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BreakdownCard title="Invoices by status" counts={report.invoices_by_status} />
        <BreakdownCard title="Payments by status" counts={report.payments_by_status} />
      </div>

      <div className="rounded-lg border border-border bg-white p-5">
        <p className="font-medium text-ink">Payments by gateway (successful only)</p>
        {report.payments_by_gateway.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No successful payments yet.</p>
        ) : (
          <dl className="mt-3 flex flex-col gap-2">
            {report.payments_by_gateway.map((row) => (
              <div key={row.gateway} className="flex items-center justify-between text-sm">
                <dt className="text-muted">
                  {row.gateway} ({row.count})
                </dt>
                <dd className="font-medium text-ink">₦{row.amount.toLocaleString()}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
