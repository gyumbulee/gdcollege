import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { AdmissionListSearch } from "@/components/admissions/AdmissionListSearch";

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
        description="Check your admission decision using your application number."
      />
      <Container className="py-12">
        <AdmissionListSearch />
      </Container>
    </>
  );
}
