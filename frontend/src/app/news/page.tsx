import Link from "next/link";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPosts } from "@/lib/api/cms";

export default async function NewsPage() {
  const { ok, items } = await getPosts();

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "News" }]}
        title="News"
        description="Institutional news and updates."
      />
      <Container className="py-12">
        {!ok ? (
          <EmptyState title="News is temporarily unavailable" description="Please check back shortly." />
        ) : items.length === 0 ? (
          <EmptyState title="No news published yet" description="Articles published by the College will appear here." />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((post) => (
              <Link key={post.id} href={`/news/${post.slug}`} className="rounded-lg border border-border bg-white p-5 hover:border-sky-dark">
                {post.cover_image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.cover_image_url} alt="" className="mb-3 h-40 w-full rounded object-cover" />
                )}
                <p className="font-medium text-ink">{post.title}</p>
                {post.excerpt && <p className="mt-1 line-clamp-2 text-sm text-muted">{post.excerpt}</p>}
                {post.published_at && (
                  <p className="mt-2 text-xs text-muted">{new Date(post.published_at).toLocaleDateString()}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
