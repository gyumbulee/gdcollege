import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminFaqs } from "@/lib/api/admin-cms";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateFaqForm } from "@/components/cms/CreateFaqForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminCmsFaqsPage() {
  const session = await requireSession("/admin/cms/faqs");
  if (!can(session, "cms.manage")) redirect("/admin");

  const token = await getSessionToken();
  const { body } = await getAdminFaqs(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · CMS</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">FAQs</h1>
      </div>

      <CreateFaqForm />

      {!body.success ? (
        <EmptyState title="Could not load FAQs" description={body.message} />
      ) : body.data.length === 0 ? (
        <EmptyState title="No FAQs yet" description="Create the first one above." />
      ) : (
        <div className="flex flex-col gap-2">
          {body.data.map((faq) => (
            <div key={faq.id} className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-white p-4">
              <div>
                <p className="font-medium text-ink">{faq.question}</p>
                <p className="mt-1 text-sm text-muted">{faq.answer}</p>
                {faq.category && <p className="mt-1 text-xs text-muted">{faq.category}</p>}
              </div>
              <CmsActionButton href={`/api/admin/cms/faqs/${faq.id}`} method="DELETE" label="Delete" confirmMessage="Delete this FAQ?" />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
