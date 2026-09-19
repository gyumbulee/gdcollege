import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getFaqs } from "@/lib/api/cms";

export default async function FaqPage() {
  const { ok, items } = await getFaqs();
  const byCategory = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.category ?? "General";
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "FAQs" }]}
        title="Frequently Asked Questions"
        description="Common questions about admissions, academics, and campus life."
      />
      <Container className="py-12">
        {!ok ? (
          <EmptyState title="FAQs are temporarily unavailable" description="Please check back shortly." />
        ) : items.length === 0 ? (
          <EmptyState title="No FAQs published yet" description="Answers to common questions will appear here." />
        ) : (
          <div className="flex max-w-2xl flex-col gap-8">
            {Object.entries(byCategory).map(([category, faqs]) => (
              <div key={category}>
                <p className="font-medium text-ink">{category}</p>
                <div className="mt-3 flex flex-col gap-4">
                  {faqs.map((faq) => (
                    <div key={faq.id}>
                      <p className="text-sm font-medium text-ink">{faq.question}</p>
                      <p className="mt-1 text-sm text-muted">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
