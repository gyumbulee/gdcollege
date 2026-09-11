import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { VerifyForm } from "@/components/verify/VerifyForm";

export default function VerifyPage() {
  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Verify a Document" }]}
        title="Verify a Document"
        description="Enter the verification code printed on a College-issued document to confirm its authenticity."
      />
      <Container className="py-12">
        <VerifyForm />
      </Container>
    </>
  );
}
