import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminAnnouncements } from "@/lib/api/admin-cms";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateAnnouncementForm } from "@/components/cms/CreateAnnouncementForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminCmsAnnouncementsPage() {
  const session = await requireSession("/admin/cms/announcements");
  if (!can(session, "cms.manage")) redirect("/admin");

  const token = await getSessionToken();
  const { body } = await getAdminAnnouncements(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · CMS</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Announcements</h1>
        <p className="mt-1 text-sm text-muted">
          Publishing an announcement also sends an in-app notification to everyone in its audience.
        </p>
      </div>

      <CreateAnnouncementForm />

      {!body.success ? (
        <EmptyState title="Could not load announcements" description={body.message} />
      ) : body.data.items.length === 0 ? (
        <EmptyState title="No announcements yet" description="Create the first one above." />
      ) : (
        <div className="flex flex-col gap-2">
          {body.data.items.map((a) => (
            <div key={a.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-white p-4">
              <div>
                <p className="font-medium text-ink">{a.title}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{a.content}</p>
                <p className="mt-1 text-xs text-muted">{a.audience_type}{a.audience_id ? ` #${a.audience_id}` : ""}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={a.status === "PUBLISHED" ? "success" : a.status === "ARCHIVED" ? "muted" : "amber"}>{a.status}</Badge>
                {a.status === "DRAFT" && (
                  <CmsActionButton href={`/api/admin/cms/announcements/${a.id}/publish`} method="POST" label="Publish" variant="secondary" />
                )}
                {a.status === "PUBLISHED" && (
                  <CmsActionButton href={`/api/admin/cms/announcements/${a.id}/archive`} method="POST" label="Archive" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
