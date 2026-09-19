import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminDownloads } from "@/lib/api/admin-cms";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { UploadDownloadForm } from "@/components/cms/UploadDownloadForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminCmsDownloadsPage() {
  const session = await requireSession("/admin/cms/downloads");
  if (!can(session, "cms.manage")) redirect("/admin");

  const token = await getSessionToken();
  const { body } = await getAdminDownloads(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · CMS</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Downloads</h1>
      </div>

      <UploadDownloadForm />

      {!body.success ? (
        <EmptyState title="Could not load downloads" description={body.message} />
      ) : body.data.length === 0 ? (
        <EmptyState title="No files uploaded yet" description="Upload the first one above." />
      ) : (
        <div className="flex flex-col gap-2">
          {body.data.map((file) => (
            <div key={file.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-4">
              <div>
                <p className="font-medium text-ink">{file.title}</p>
                <p className="text-xs text-muted">{file.category ? `${file.category} · ` : ""}{file.original_filename}</p>
              </div>
              <CmsActionButton href={`/api/admin/cms/downloads/${file.id}`} method="DELETE" label="Delete" confirmMessage="Delete this file?" />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
