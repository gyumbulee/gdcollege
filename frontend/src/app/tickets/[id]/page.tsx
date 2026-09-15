import { requireSession, getSessionToken, can } from "@/lib/auth/session";
import { getTicket } from "@/lib/api/helpdesk";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { TicketReplyBox } from "@/components/services/TicketReplyBox";
import { TicketStatusControl } from "@/components/services/TicketStatusControl";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  OPEN: "amber",
  IN_PROGRESS: "sky",
  WAITING: "muted",
  RESOLVED: "success",
  CLOSED: "muted",
};

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession("/tickets");
  const { id } = await params;
  const token = await getSessionToken();
  const { body } = await getTicket(token!, Number(id));
  const canManage = can(session, "helpdesk.manage");

  if (!body.success) {
    return (
      <Container className="py-12">
        <EmptyState title="Could not load this ticket" description={body.message} />
      </Container>
    );
  }

  const ticket = body.data;

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{ticket.category}</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">{ticket.subject}</h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge tone={STATUS_TONE[ticket.status] ?? "muted"}>{ticket.status}</Badge>
          {canManage && <TicketStatusControl ticketId={ticket.id} status={ticket.status} />}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-white p-5">
        <p className="text-sm text-muted">{ticket.user?.name}</p>
        <p className="mt-1 text-sm text-ink">{ticket.description}</p>
      </div>

      {ticket.messages && ticket.messages.length > 0 && (
        <div className="flex flex-col gap-3">
          {ticket.messages.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg border p-4 ${
                message.is_staff_reply ? "border-sky-dark bg-sky-light" : "border-border bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">
                  {message.user?.name ?? "—"}
                  {message.is_staff_reply && <span className="ml-2 text-xs text-sky-dark">(Staff)</span>}
                </p>
                <p className="text-xs text-muted">{new Date(message.created_at).toLocaleString()}</p>
              </div>
              <p className="mt-1 text-sm text-ink">{message.message}</p>
              {message.attachment_name && (
                <p className="mt-1 text-xs text-muted">📎 {message.attachment_name}</p>
              )}
            </div>
          ))}
        </div>
      )}

      <TicketReplyBox ticketId={ticket.id} />
    </Container>
  );
}
