import Link from "next/link";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getGalleries } from "@/lib/api/cms";

export default async function GalleryPage() {
  const { ok, items } = await getGalleries();

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Gallery" }]}
        title="Gallery"
        description="Photos from campus life and College events."
      />
      <Container className="py-12">
        {!ok ? (
          <EmptyState title="Gallery is temporarily unavailable" description="Please check back shortly." />
        ) : items.length === 0 ? (
          <EmptyState
            title="No photos published yet"
            description="Official campus photography will appear here once supplied — no images are fabricated or sourced elsewhere."
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((album) => (
              <Link key={album.id} href={`/gallery/${album.slug}`} className="rounded-lg border border-border bg-white p-5 hover:border-sky-dark">
                <p className="font-medium text-ink">{album.title}</p>
                {album.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{album.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
