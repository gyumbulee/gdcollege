import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getEvent } from "@/lib/api/cms";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { item: event } = await getEvent(slug);

  if (!event) {
    return (
      <>
        <PublicPageHeader
          crumbs={[{ label: "Home", href: "/" }, { label: "Events", href: "/events" }, { label: slug }]}
          title="Event not found"
        />
        <Container className="py-12">
          <EmptyState title="This event isn't available" description="It may have been unpublished or the link may be incorrect." />
        </Container>
      </>
    );
  }

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Events", href: "/events" }, { label: event.title }]}
        title={event.title}
        description={`${new Date(event.starts_at).toLocaleString()}${event.location ? ` · ${event.location}` : ""}`}
      />
      <Container className="py-12">
        {event.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={event.cover_image_url} alt="" className="mb-6 max-h-96 w-full rounded-lg object-cover" />
        )}
        {event.description && (
          <div className="prose max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-ink">{event.description}</div>
        )}
      </Container>
    </>
  );
}
