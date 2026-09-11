import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NewsPage() {
  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "News" }]}
        title="News"
        description="Institutional news and updates."
      />
      <Container className="py-12">
        <EmptyState
          title="No news published yet"
          description="Articles published by the College will appear here once the CMS (Phase 11) is live."
        />
      </Container>
    </>
  );
}
