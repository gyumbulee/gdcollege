import Link from "next/link";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getEvents } from "@/lib/api/cms";

export default async function EventsPage() {
  const { ok, items } = await getEvents();

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Events" }]}
        title="Events"
        description="Upcoming institutional events."
      />
      <Container className="py-12">
        {!ok ? (
          <EmptyState title="Events are temporarily unavailable" description="Please check back shortly." />
        ) : items.length === 0 ? (
          <EmptyState title="No upcoming events" description="Events published by the College will appear here." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="rounded-lg border border-border bg-white p-5 hover:border-sky-dark">
                {event.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={event.cover_image_url} alt="" className="mb-3 h-40 w-full rounded object-cover" />
                )}
                <p className="font-medium text-ink">{event.title}</p>
                <p className="mt-1 text-xs text-muted">{new Date(event.starts_at).toLocaleString()}</p>
                {event.location && <p className="mt-1 text-xs text-muted">{event.location}</p>}
              </Link>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
