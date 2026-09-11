import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export default function GalleryPage() {
  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
        title="Gallery"
        description="Photos from campus life and College events."
      />
      <Container className="py-12">
        <EmptyState
          title="No photos published yet"
          description="Official campus photography will appear here once supplied — no images are fabricated or sourced elsewhere."
        />
      </Container>
    </>
  );
}
