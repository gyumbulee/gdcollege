import { requireSession } from "@/lib/auth/session";
import { Container } from "@/components/ui/Container";
import { CreateTicketForm } from "@/components/services/CreateTicketForm";

export default async function NewTicketPage() {
  await requireSession("/tickets/new");

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Support</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">New Ticket</h1>
      </div>
      <CreateTicketForm />
    </Container>
  );
}
