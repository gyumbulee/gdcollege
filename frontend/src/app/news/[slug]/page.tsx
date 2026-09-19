import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPost } from "@/lib/api/cms";

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { item: post } = await getPost(slug);

  if (!post) {
    return (
      <>
        <PublicPageHeader
          crumbs={[{ label: "Home", href: "/" }, { label: "News", href: "/news" }, { label: slug }]}
          title="Article not found"
        />
        <Container className="py-12">
          <EmptyState title="This article isn't available" description="It may have been unpublished or the link may be incorrect." />
        </Container>
      </>
    );
  }

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "News", href: "/news" }, { label: post.title }]}
        title={post.title}
        description={post.published_at ? new Date(post.published_at).toLocaleDateString() : undefined}
      />
      <Container className="py-12">
        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_image_url} alt="" className="mb-6 max-h-96 w-full rounded-lg object-cover" />
        )}
        <div className="prose max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-ink">{post.content}</div>
      </Container>
    </>
  );
}
