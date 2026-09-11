import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdmissionListPage() {
  return (
    <>
      <PublicPageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Admissions", href: "/admissions" },
          { label: "Admission List" },
        ]}
        title="Admission List"
        description="Check the current admission list by application or JAMB number."
      />
      <Container className="py-12">
        <EmptyState
          title="No admission list published yet"
          description="Once Admissions (Phase 5) processes decisions for a session, the list will be searchable here."
        />
      </Container>
    </>
  );
}
