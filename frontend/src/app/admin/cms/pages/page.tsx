import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminPages } from "@/lib/api/admin-cms";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreatePageForm } from "@/components/cms/CreatePageForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminCmsPagesPage() {
  const session = await requireSession("/admin/cms/pages");
  if (!can(session, "cms.manage")) redirect("/admin");

  const token = await getSessionToken();
  const { body } = await getAdminPages(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · CMS</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Pages</h1>
      </div>

      <CreatePageForm />

      {!body.success ? (
        <EmptyState title="Could not load pages" description={body.message} />
      ) : body.data.length === 0 ? (
        <EmptyState title="No pages yet" description="Create the first one above." />
      ) : (
        <div className="flex flex-col gap-2">
          {body.data.map((page) => (
            <div key={page.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-4">
              <div>
                <p className="font-medium text-ink">{page.title}</p>
                <p className="text-xs text-muted">/{page.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={page.status === "PUBLISHED" ? "success" : "muted"}>{page.status}</Badge>
                <CmsActionButton href={`/api/admin/cms/pages/${page.id}`} method="DELETE" label="Delete" confirmMessage="Delete this page?" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
