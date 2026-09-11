import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DownloadsPage() {
  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Downloads" }]}
        title="Downloads"
        description="Forms, brochures, and other official documents."
      />
      <Container className="py-12">
        <EmptyState
          title="No downloads published yet"
          description="Official forms and documents will appear here once the CMS (Phase 11) is live."
        />
      </Container>
    </>
  );
}
