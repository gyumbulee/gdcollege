import { getSessionToken } from "@/lib/auth/session";
import { getDocumentRequests } from "@/lib/api/documents";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { DocumentRequestActions } from "@/components/documents/DocumentRequestActions";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  REQUESTED: "amber",
  PROCESSING: "amber",
  READY: "sky",
  ISSUED: "success",
  REJECTED: "danger",
};

const TYPE_LABELS: Record<string, string> = {
  STATEMENT_OF_RESULT: "Statement of Result",
  TRANSCRIPT: "Transcript",
  CLEARANCE_CERTIFICATE: "Clearance Certificate",
};

export default async function RegistrarDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const token = await getSessionToken();
  const { body } = await getDocumentRequests(token!, Number(page ?? 1));

  if (!body.success) {
    return <EmptyState title="Could not load document requests" description={body.message} />;
  }

  const { items, pagination } = body.data;

  if (items.length === 0) {
    return <EmptyState title="No document requests" description="Student requests for transcripts, statements, and clearance certificates appear here." />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4">
        {items.map((request) => (
          <div key={request.id} className="rounded-lg border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium text-ink">{TYPE_LABELS[request.type] ?? request.type}</p>
                <p className="text-sm text-muted">
                  {request.student?.name ?? "—"}{" "}
                  <span className="text-xs">{request.student?.matric_number}</span>
                </p>
                {request.notes && <p className="mt-1 text-xs text-muted">Notes: {request.notes}</p>}
                {request.issued_document && (
                  <p className="mt-1 text-xs text-muted">
                    Issued: {request.issued_document.document_number} · code{" "}
                    {request.issued_document.verification_code}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2">
                <Badge tone={STATUS_TONE[request.status] ?? "muted"}>{request.status}</Badge>
                <DocumentRequestActions requestId={request.id} status={request.status} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {pagination.last_page && pagination.last_page > 1 && (
        <p className="text-center text-sm text-muted">
          Page {pagination.current_page} of {pagination.last_page}
        </p>
      )}
    </div>
  );
}
