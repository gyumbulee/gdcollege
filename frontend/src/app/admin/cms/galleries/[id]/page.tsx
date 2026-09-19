import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminGallery } from "@/lib/api/admin-cms";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { AddGalleryItemForm } from "@/components/cms/AddGalleryItemForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminCmsGalleryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession("/admin/cms/galleries");
  if (!can(session, "cms.manage")) redirect("/admin");

  const { id } = await params;
  const token = await getSessionToken();
  const { body } = await getAdminGallery(token!, id);

  if (!body.success) {
    return (
      <Container className="py-12">
        <EmptyState title="Could not load this album" description={body.message} />
      </Container>
    );
  }

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · CMS · Gallery</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">{body.data.title}</h1>
      </div>

      <AddGalleryItemForm galleryId={body.data.id} />

      {body.data.items.length === 0 ? (
        <EmptyState title="No photos yet" description="Add the first one above." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {body.data.items.map((photo) => (
            <div key={photo.id} className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.image_url} alt={photo.caption ?? ""} className="aspect-square w-full rounded-lg object-cover" />
              <CmsActionButton
                href={`/api/admin/cms/galleries/${body.data.id}/items/${photo.id}`}
                method="DELETE"
                label="Remove"
                confirmMessage="Remove this photo?"
              />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
