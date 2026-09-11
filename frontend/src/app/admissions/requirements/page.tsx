import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdmissionRequirementsPage() {
  return (
    <>
      <PublicPageHeader
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Admissions", href: "/admissions" },
          { label: "Requirements" },
        ]}
        title="Admission Requirements"
        description="Entry requirements for National Diploma programmes."
      />
      <Container className="py-12">
        <EmptyState
          title="Requirements not yet published"
          description="O'Level and other entry requirements will be published here once confirmed by the Admissions Office — figures are never assumed or invented."
        />
      </Container>
    </>
  );
}
