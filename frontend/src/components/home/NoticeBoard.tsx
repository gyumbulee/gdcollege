import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";

export function NoticeBoard() {
  return (
    <section className="border-t border-border bg-white py-16">
      <Container>
        <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink sm:text-3xl">
          Announcements
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          Notices published by the Registry and Admissions Office will
          appear here.
        </p>

        <div className="mt-8">
          <EmptyState
            title="No announcements published yet"
            description="Once the CMS (Phase 18) is live, staff-published notices will show up here automatically."
          />
        </div>
      </Container>
    </section>
  );
}
