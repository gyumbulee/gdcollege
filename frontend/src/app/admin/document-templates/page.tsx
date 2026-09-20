import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getDocumentTemplates } from "@/lib/api/admin";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { DocumentTemplateUploadRow } from "@/components/admin/DocumentTemplateUploadRow";

export default async function AdminDocumentTemplatesPage() {
  const session = await requireSession("/admin/document-templates");
  if (!can(session, "institution.manage")) redirect("/admin");

  const token = await getSessionToken();
  const { body } = await getDocumentTemplates(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Document Templates</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Upload a reference file for each document type — receipts, slips, letters, certificates. This is
          demo scope: every document the platform issues is still generated automatically from live student/
          payment/result records (never hand-entered) — an uploaded file here is reference material for
          Registry/ICT until a full templating engine is commissioned.
        </p>
      </div>

      {!body.success ? (
        <EmptyState title="Could not load document templates" description={body.message} />
      ) : (
        <div className="rounded-lg border border-border bg-white px-5">
          {body.data.map((template) => (
            <DocumentTemplateUploadRow key={template.id} template={template} />
          ))}
        </div>
      )}
    </Container>
  );
}
