import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getGallery } from "@/lib/api/cms";

export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { item: gallery } = await getGallery(slug);

  if (!gallery) {
    return (
      <>
        <PublicPageHeader
          crumbs={[{ label: "Home", href: "/" }, { label: "Gallery", href: "/gallery" }, { label: slug }]}
          title="Gallery not found"
        />
        <Container className="py-12">
          <EmptyState title="This album isn't available" description="It may have been unpublished or the link may be incorrect." />
        </Container>
      </>
    );
  }

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Gallery", href: "/gallery" }, { label: gallery.title }]}
        title={gallery.title}
        description={gallery.description ?? undefined}
      />
      <Container className="py-12">
        {!gallery.items || gallery.items.length === 0 ? (
          <EmptyState title="No photos in this album yet" description="Check back soon." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {gallery.items.map((photo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={photo.id} src={photo.image_url} alt={photo.caption ?? ""} className="aspect-square w-full rounded-lg object-cover" />
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
