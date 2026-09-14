import { getSessionToken } from "@/lib/auth/session";
import { getInvoices, getFeeStructures } from "@/lib/api/finance";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { GenerateInvoiceForm } from "@/components/finance/GenerateInvoiceForm";
import { VoidInvoiceButton } from "@/components/finance/VoidInvoiceButton";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  PENDING: "amber",
  PARTIALLY_PAID: "amber",
  PAID: "success",
  VOID: "muted",
};

export default async function BursaryInvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const token = await getSessionToken();
  const [invoicesResult, structuresResult] = await Promise.all([
    getInvoices(token!, Number(page ?? 1)),
    getFeeStructures(token!),
  ]);

  const structures = structuresResult.body.success
    ? structuresResult.body.data.map((s) => ({ id: s.id, name: s.name }))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <GenerateInvoiceForm structures={structures} />

      {!invoicesResult.body.success ? (
        <EmptyState title="Could not load invoices" description={invoicesResult.body.message} />
      ) : invoicesResult.body.data.items.length === 0 ? (
        <EmptyState title="No invoices yet" description="Generate one above to get started." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoicesResult.body.data.items.map((invoice) => (
                <tr key={invoice.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 text-ink">{invoice.invoice_number}</td>
                  <td className="px-4 py-3 text-ink">
                    {invoice.student?.name ?? "—"}{" "}
                    <span className="text-xs text-muted">{invoice.student?.matric_number}</span>
                  </td>
                  <td className="px-4 py-3 text-ink">₦{invoice.total_amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-ink">₦{invoice.balance.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONE[invoice.status] ?? "muted"}>{invoice.status}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {invoice.status !== "VOID" && invoice.amount_paid === 0 && (
                      <VoidInvoiceButton invoiceId={invoice.id} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {invoicesResult.body.success && invoicesResult.body.data.pagination.last_page && invoicesResult.body.data.pagination.last_page > 1 && (
        <p className="text-center text-sm text-muted">
          Page {invoicesResult.body.data.pagination.current_page} of{" "}
          {invoicesResult.body.data.pagination.last_page}
        </p>
      )}
    </div>
  );
}
