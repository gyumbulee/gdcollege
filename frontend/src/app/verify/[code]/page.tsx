import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { verifyDocument } from "@/lib/api/verify";

const TYPE_LABELS: Record<string, string> = {
  ADMISSION_LETTER: "Admission Letter",
  COURSE_REG_SLIP: "Course Registration Slip",
  RESULT_SLIP: "Result Slip",
  PAYMENT_RECEIPT: "Payment Receipt",
  STATEMENT_OF_RESULT: "Statement of Result",
  TRANSCRIPT: "Transcript",
  CLEARANCE_CERTIFICATE: "Clearance Certificate",
};

export default async function VerifyCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const result = await verifyDocument(code);

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Verify a Document", href: "/verify" }, { label: code }]}
        title="Document Verification"
      />
      <Container className="py-12">
        {!result.ok ? (
          <EmptyState
            title="Verification temporarily unavailable"
            description="We couldn't reach the verification service just now. Please try again shortly."
          />
        ) : !result.found || !result.document ? (
          <EmptyState
            title="No matching document"
            description={`No document was found for code "${code}". Double-check the code printed on the document, or contact the College Registry.`}
          />
        ) : (
          <div className="mx-auto max-w-lg rounded-lg border border-border bg-white p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-lg font-medium text-ink">
                {TYPE_LABELS[result.document.type] ?? result.document.type}
              </p>
              <Badge tone={result.document.valid ? "success" : "danger"}>
                {result.document.valid ? "Valid" : result.document.status}
              </Badge>
            </div>

            <dl className="mt-5 flex flex-col gap-3 text-sm">
              <div className="flex justify-between border-b border-border pb-2">
                <dt className="text-muted">Document Number</dt>
                <dd className="font-medium text-ink">{result.document.document_number}</dd>
              </div>
              {result.document.student_name && (
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted">Issued To</dt>
                  <dd className="font-medium text-ink">{result.document.student_name}</dd>
                </div>
              )}
              {result.document.programme && (
                <div className="flex justify-between border-b border-border pb-2">
                  <dt className="text-muted">Programme</dt>
                  <dd className="font-medium text-ink">{result.document.programme}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Issued</dt>
                <dd className="font-medium text-ink">
                  {new Date(result.document.issued_at).toLocaleDateString()}
                </dd>
              </div>
            </dl>

            {!result.document.valid && result.document.revoked_reason && (
              <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
                This document has been revoked: {result.document.revoked_reason}
              </p>
            )}

            <p className="mt-5 text-xs text-muted">
              This page confirms the document&apos;s authenticity and status only — it does not
              display the document&apos;s full contents.
            </p>
          </div>
        )}
      </Container>
    </>
  );
}
