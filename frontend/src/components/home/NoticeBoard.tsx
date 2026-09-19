import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPublicAnnouncements } from "@/lib/api/cms";

export async function NoticeBoard() {
  const { ok, items } = await getPublicAnnouncements();

  return (
    <section className="border-t border-border bg-white py-16">
      <Container>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink sm:text-3xl">
          Announcements
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          Notices published by the Registry and Admissions Office will appear here.
        </p>

        <div className="mt-8">
          {!ok ? (
            <EmptyState title="Announcements are temporarily unavailable" description="Please check back shortly." />
          ) : items.length === 0 ? (
            <EmptyState title="No announcements published yet" description="Staff-published notices will show up here automatically." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {items.slice(0, 3).map((notice) => (
                <div key={notice.id} className="rounded-lg border border-border bg-background p-5">
                  <p className="font-medium text-ink">{notice.title}</p>
                  <p className="mt-2 line-clamp-3 text-sm text-muted">{notice.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
