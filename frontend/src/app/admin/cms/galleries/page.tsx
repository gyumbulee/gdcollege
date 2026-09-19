import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminGalleries } from "@/lib/api/admin-cms";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateGalleryForm } from "@/components/cms/CreateGalleryForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminCmsGalleriesPage() {
  const session = await requireSession("/admin/cms/galleries");
  if (!can(session, "cms.manage")) redirect("/admin");

  const token = await getSessionToken();
  const { body } = await getAdminGalleries(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · CMS</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Gallery Albums</h1>
      </div>

      <CreateGalleryForm />

      {!body.success ? (
        <EmptyState title="Could not load galleries" description={body.message} />
      ) : body.data.length === 0 ? (
        <EmptyState title="No albums yet" description="Create the first one above." />
      ) : (
        <div className="flex flex-col gap-2">
          {body.data.map((gallery) => (
            <div key={gallery.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-4">
              <div>
                <Link href={`/admin/cms/galleries/${gallery.id}`} className="font-medium text-ink hover:text-sky-dark">
                  {gallery.title}
                </Link>
                <p className="text-xs text-muted">{gallery.items_count ?? 0} photo{gallery.items_count === 1 ? "" : "s"}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={gallery.status === "PUBLISHED" ? "success" : "muted"}>{gallery.status}</Badge>
                {gallery.status !== "PUBLISHED" && (
                  <CmsActionButton href={`/api/admin/cms/galleries/${gallery.id}`} method="PATCH" jsonBody={{ status: "PUBLISHED" }} label="Publish" variant="secondary" />
                )}
                <CmsActionButton href={`/api/admin/cms/galleries/${gallery.id}`} method="DELETE" label="Delete" confirmMessage="Delete this album and all its photos?" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
