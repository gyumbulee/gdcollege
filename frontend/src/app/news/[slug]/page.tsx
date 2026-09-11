import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "News", href: "/news" }, { label: slug }]}
        title="Article not available"
      />
      <Container className="py-12">
        <EmptyState
          title="This article isn't published yet"
          description="The CMS (Phase 11) will make individual news articles available at this URL once live."
        />
      </Container>
    </>
  );
}
