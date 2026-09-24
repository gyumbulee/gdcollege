import { Container } from "@/components/ui/Container";
import { getFeaturedGallery } from "@/lib/api/cms";
import { FeaturedCarouselClient } from "./FeaturedCarouselClient";

/**
 * Homepage-only carousel, sourced from the single admin-curated
 * "Homepage Carousel" gallery (Gallery::TYPE_FEATURED) — see
 * /admin/cms/galleries. Deliberately not the same data as the public
 * /gallery listing. Falls back to a clearly-marked placeholder slide
 * when no featured gallery has been configured or published yet.
 */
export async function FeaturedCarousel() {
  const { item: gallery } = await getFeaturedGallery();
  const slides = gallery?.items ?? [];
  const usingRealData = slides.length > 0;

  return (
    <section className="py-16">
      <Container>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink sm:text-3xl">
          Campus in pictures
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          A look at life at the College, curated by the CMS team.
        </p>
        <div className="mt-8">
          <FeaturedCarouselClient slides={slides} usingRealData={usingRealData} />
        </div>
      </Container>
    </section>
  );
}
