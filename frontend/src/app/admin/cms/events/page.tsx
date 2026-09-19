import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminEvents } from "@/lib/api/admin-cms";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateEventForm } from "@/components/cms/CreateEventForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminCmsEventsPage() {
  const session = await requireSession("/admin/cms/events");
  if (!can(session, "cms.manage")) redirect("/admin");

  const token = await getSessionToken();
  const { body } = await getAdminEvents(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · CMS</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Events</h1>
      </div>

      <CreateEventForm />

      {!body.success ? (
        <EmptyState title="Could not load events" description={body.message} />
      ) : body.data.items.length === 0 ? (
        <EmptyState title="No events yet" description="Create the first one above." />
      ) : (
        <div className="flex flex-col gap-2">
          {body.data.items.map((event) => (
            <div key={event.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-4">
              <div>
                <p className="font-medium text-ink">{event.title}</p>
                <p className="text-xs text-muted">{new Date(event.starts_at).toLocaleString()}{event.location ? ` · ${event.location}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={event.status === "PUBLISHED" ? "success" : "muted"}>{event.status}</Badge>
                {event.status !== "PUBLISHED" && (
                  <CmsActionButton href={`/api/admin/cms/events/${event.id}/publish`} method="POST" label="Publish" variant="secondary" />
                )}
                <CmsActionButton href={`/api/admin/cms/events/${event.id}`} method="DELETE" label="Delete" confirmMessage="Delete this event?" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
