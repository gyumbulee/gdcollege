import Link from "next/link";
import { requireSession, getSessionToken, can } from "@/lib/auth/session";
import { getMyTickets } from "@/lib/api/helpdesk";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  OPEN: "amber",
  IN_PROGRESS: "sky",
  WAITING: "muted",
  RESOLVED: "success",
  CLOSED: "muted",
};

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireSession("/tickets");
  const { page } = await searchParams;
  const token = await getSessionToken();
  const { body } = await getMyTickets(token!, Number(page ?? 1));
  const isStaff = can(session, "helpdesk.view") || can(session, "helpdesk.manage");

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">{isStaff ? "Helpdesk" : "Support"}</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            {isStaff ? "All Tickets" : "My Tickets"}
          </h1>
        </div>
        <Link href="/tickets/new">
          <Button variant="primary">New ticket</Button>
        </Link>
      </div>

      {!body.success ? (
        <EmptyState title="Could not load tickets" description={body.message} />
      ) : body.data.items.length === 0 ? (
        <EmptyState title="No tickets" description="Nothing here yet." />
      ) : (
        <div className="flex flex-col gap-3">
          {body.data.items.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/tickets/${ticket.id}`}
              className="flex items-center justify-between rounded-lg border border-border bg-white p-4 transition-colors hover:border-sky-dark"
            >
              <div>
                <p className="font-medium text-ink">{ticket.subject}</p>
                <p className="text-xs text-muted">
                  {ticket.category}
                  {isStaff && ticket.user ? ` · ${ticket.user.name}` : ""}
                </p>
              </div>
              <Badge tone={STATUS_TONE[ticket.status] ?? "muted"}>{ticket.status}</Badge>
            </Link>
          ))}
        </div>
      )}

      {body.success && body.data.pagination.last_page && body.data.pagination.last_page > 1 && (
        <p className="text-center text-sm text-muted">
          Page {body.data.pagination.current_page} of {body.data.pagination.last_page}
        </p>
      )}
    </Container>
  );
}
