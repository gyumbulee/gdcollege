import { getSessionToken } from "@/lib/auth/session";
import { getStaffPayments } from "@/lib/api/finance";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { PaymentActions } from "@/components/finance/PaymentActions";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  PENDING: "amber",
  SUCCESSFUL: "success",
  FAILED: "danger",
  REFUNDED: "muted",
};

export default async function BursaryPaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const token = await getSessionToken();
  const { body } = await getStaffPayments(token!, Number(page ?? 1));

  if (!body.success) {
    return <EmptyState title="Could not load payments" description={body.message} />;
  }

  const { items, pagination } = body.data;

  if (items.length === 0) {
    return <EmptyState title="No payments yet" description="Payments appear here once students start paying invoices." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Gateway</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((payment) => (
              <tr key={payment.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-ink">{payment.reference}</td>
                <td className="px-4 py-3 text-ink">
                  {payment.student?.name ?? "—"}{" "}
                  <span className="text-xs text-muted">{payment.student?.matric_number}</span>
                </td>
                <td className="px-4 py-3 text-ink">{payment.gateway}</td>
                <td className="px-4 py-3 text-ink">₦{payment.amount.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[payment.status] ?? "muted"}>{payment.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right">
                  <PaymentActions paymentId={payment.id} amount={payment.amount} status={payment.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.last_page && pagination.last_page > 1 && (
        <p className="text-center text-sm text-muted">
          Page {pagination.current_page} of {pagination.last_page}
        </p>
      )}
    </div>
  );
}
