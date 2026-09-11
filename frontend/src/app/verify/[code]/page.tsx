import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function VerifyCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Verify a Document", href: "/verify" }, { label: code }]}
        title="Document Verification"
      />
      <Container className="py-12">
        <EmptyState
          title="Verification service not yet available"
          description={`Checked code "${code}" — document verification goes live with Phase 15 (Document Management). No document can be confirmed authentic or fabricated until then.`}
        />
      </Container>
    </>
  );
}
