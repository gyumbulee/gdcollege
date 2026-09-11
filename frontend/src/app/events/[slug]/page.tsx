import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Events", href: "/events" }, { label: slug }]}
        title="Event not available"
      />
      <Container className="py-12">
        <EmptyState
          title="This event isn't published yet"
          description="The CMS (Phase 11) will make individual event pages available at this URL once live."
        />
      </Container>
    </>
  );
}
