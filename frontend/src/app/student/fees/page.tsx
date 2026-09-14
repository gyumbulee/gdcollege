import { redirect } from "next/navigation";
import { requireSession, getSessionToken } from "@/lib/auth/session";
import { getMyInvoices } from "@/lib/api/finance";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PayInvoiceButton } from "@/components/finance/PayInvoiceButton";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  PENDING: "amber",
  PARTIALLY_PAID: "amber",
  PAID: "success",
  VOID: "muted",
};

export default async function StudentFeesPage() {
  const session = await requireSession("/student/fees");
  if (!session.roles.includes("student")) {
    redirect("/portal");
  }

  const token = await getSessionToken();
  const { body } = await getMyInvoices(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Student Portal</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">My Fees</h1>
      </div>

      {!body.success ? (
        <EmptyState title="Could not load your invoices" description={body.message} />
      ) : body.data.invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="You don't have any invoices yet. They appear here once Bursary generates one for you."
        />
      ) : (
        <>
          <div className="rounded-lg border border-border bg-white p-5">
            <p className="text-sm text-muted">Total outstanding across all invoices</p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-ink">
              ₦{body.data.total_outstanding.toLocaleString()}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {body.data.invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-lg border border-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">{invoice.invoice_number}</p>
                    <p className="text-sm text-muted">
                      {invoice.fee_structure?.name} · {invoice.academic_session?.name}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONE[invoice.status] ?? "muted"}>{invoice.status}</Badge>
                </div>

                {invoice.items && invoice.items.length > 0 && (
                  <ul className="mt-4 flex flex-col gap-1 border-t border-border pt-3 text-sm">
                    {invoice.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between text-ink">
                        <span>{item.name}</span>
                        <span>₦{item.net_amount.toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <div className="text-sm">
                    <span className="text-muted">Total </span>
                    <span className="font-medium text-ink">₦{invoice.total_amount.toLocaleString()}</span>
                    <span className="mx-2 text-muted">·</span>
                    <span className="text-muted">Paid </span>
                    <span className="font-medium text-ink">₦{invoice.amount_paid.toLocaleString()}</span>
                    <span className="mx-2 text-muted">·</span>
                    <span className="text-muted">Balance </span>
                    <span className="font-medium text-ink">₦{invoice.balance.toLocaleString()}</span>
                  </div>
                  {invoice.status !== "PAID" && invoice.status !== "VOID" && (
                    <PayInvoiceButton invoiceId={invoice.id} balance={invoice.balance} />
                  )}
                </div>

                {invoice.payments && invoice.payments.length > 0 && (
                  <div className="mt-3 flex flex-col gap-1 text-xs text-muted">
                    {invoice.payments.map((payment) => (
                      <p key={payment.id}>
                        {payment.reference} — {payment.gateway} — {payment.status}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Container>
  );
}
