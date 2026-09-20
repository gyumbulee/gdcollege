import { redirect } from "next/navigation";
import Link from "next/link";
import { Download } from "lucide-react";
import { requireSession, getSessionToken } from "@/lib/auth/session";
import { getMyDocuments, getMyDocumentRequests } from "@/lib/api/documents";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { RequestDocumentForm } from "@/components/documents/RequestDocumentForm";
import { GenerateDocumentButtons } from "@/components/documents/GenerateDocumentButtons";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  REQUESTED: "amber",
  PROCESSING: "amber",
  READY: "sky",
  ISSUED: "success",
  REJECTED: "danger",
  ACTIVE: "success",
  REVOKED: "danger",
};

const TYPE_LABELS: Record<string, string> = {
  ADMISSION_LETTER: "Admission Letter",
  COURSE_REG_SLIP: "Course Registration Slip",
  RESULT_SLIP: "Result Slip",
  PAYMENT_RECEIPT: "Payment Receipt",
  STATEMENT_OF_RESULT: "Statement of Result",
  TRANSCRIPT: "Transcript",
  CLEARANCE_CERTIFICATE: "Clearance Certificate",
};

export default async function StudentDocumentsPage() {
  const session = await requireSession("/student/documents");
  if (!session.roles.includes("student")) {
    redirect("/portal");
  }

  const token = await getSessionToken();
  const [documentsResult, requestsResult] = await Promise.all([
    getMyDocuments(token!),
    getMyDocumentRequests(token!),
  ]);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Student Portal</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">My Documents</h1>
      </div>

      <GenerateDocumentButtons />
      <RequestDocumentForm />

      <section>
        <h2 className="text-lg font-medium text-ink">My Requests</h2>
        {!requestsResult.body.success ? (
          <div className="mt-3">
            <EmptyState title="Could not load requests" description={requestsResult.body.message} />
          </div>
        ) : requestsResult.body.data.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No document requests yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {requestsResult.body.data.map((r) => (
              <div key={r.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-4">
                <div>
                  <p className="font-medium text-ink">{TYPE_LABELS[r.type] ?? r.type}</p>
                  {r.rejection_reason && <p className="text-xs text-danger">{r.rejection_reason}</p>}
                  {r.issued_document && (
                    <p className="text-xs text-muted">
                      Verification code: {r.issued_document.verification_code}
                    </p>
                  )}
                </div>
                <Badge tone={STATUS_TONE[r.status] ?? "muted"}>{r.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-ink">My Issued Documents</h2>
        {!documentsResult.body.success ? (
          <div className="mt-3">
            <EmptyState title="Could not load documents" description={documentsResult.body.message} />
          </div>
        ) : documentsResult.body.data.length === 0 ? (
          <p className="mt-2 text-sm text-muted">Nothing issued yet.</p>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {documentsResult.body.data.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-4">
                <div>
                  <p className="font-medium text-ink">{TYPE_LABELS[doc.type] ?? doc.type}</p>
                  <p className="text-xs text-muted">
                    {doc.document_number} · verify at /verify/{doc.verification_code}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={STATUS_TONE[doc.status] ?? "muted"}>{doc.status}</Badge>
                  {doc.status === "ACTIVE" && (
                    <Link
                      href={`/student/documents/${doc.id}`}
                      className="inline-flex items-center gap-1.5 text-sm text-sky-dark hover:underline"
                    >
                      <Download size={15} aria-hidden />
                      Download
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
