import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ManagementPage() {
  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Management" }]}
        title="Management & Leadership"
        description="The College's leadership team."
      />
      <Container className="py-12">
        <EmptyState
          title="Leadership profiles pending"
          description="Names, titles, and portraits of College leadership will be published here once confirmed — profiles are never fabricated or guessed."
        />
      </Container>
    </>
  );
}
