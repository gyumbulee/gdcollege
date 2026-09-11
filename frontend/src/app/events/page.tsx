import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export default function EventsPage() {
  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Events" }]}
        title="Events"
        description="Upcoming and past institutional events."
      />
      <Container className="py-12">
        <EmptyState
          title="No events published yet"
          description="Events published by the College will appear here once the CMS (Phase 11) is live."
        />
      </Container>
    </>
  );
}
