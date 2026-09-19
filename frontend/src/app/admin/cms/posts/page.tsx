import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminPosts } from "@/lib/api/admin-cms";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreatePostForm } from "@/components/cms/CreatePostForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminCmsPostsPage() {
  const session = await requireSession("/admin/cms/posts");
  if (!can(session, "cms.manage")) redirect("/admin");

  const token = await getSessionToken();
  const { body } = await getAdminPosts(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · CMS</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">News</h1>
      </div>

      <CreatePostForm />

      {!body.success ? (
        <EmptyState title="Could not load posts" description={body.message} />
      ) : body.data.items.length === 0 ? (
        <EmptyState title="No articles yet" description="Create the first one above." />
      ) : (
        <div className="flex flex-col gap-2">
          {body.data.items.map((post) => (
            <div key={post.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-4">
              <div>
                <p className="font-medium text-ink">{post.title}</p>
                <p className="text-xs text-muted">/{post.slug}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={post.status === "PUBLISHED" ? "success" : "muted"}>{post.status}</Badge>
                {post.status !== "PUBLISHED" && (
                  <CmsActionButton href={`/api/admin/cms/posts/${post.id}/publish`} method="POST" label="Publish" variant="secondary" />
                )}
                <CmsActionButton href={`/api/admin/cms/posts/${post.id}`} method="DELETE" label="Delete" confirmMessage="Delete this article?" />
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
