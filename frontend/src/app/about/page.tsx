import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { institutionConfig } from "@/config/institution.config";

export default function AboutPage() {
  const { identity, location } = institutionConfig;

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "About" }]}
        title={`About ${identity.shortName}`}
        description={`${identity.formalName} — ${location.city}, ${location.state}, ${location.country}.`}
      />

      <Container className="grid gap-10 py-12 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-8">
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">Our story</h2>
            <div className="mt-3">
              <EmptyState
                title="Institutional history pending"
                description="The College's founding history, vision, and mission will be published here once supplied and confirmed."
              />
            </div>
          </section>

          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl text-ink">Accreditation</h2>
            <div className="mt-3">
              <EmptyState
                title="Accreditation details pending"
                description="Programme approvals and accrediting bodies will be listed here once confirmed by the College — nothing is published without official confirmation."
              />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-lg border border-border bg-white p-6">
          <p className="text-sm font-medium text-ink">At a glance</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted">Motto</dt>
              <dd className="text-right text-ink">{identity.motto ?? "Pending confirmation"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted">Location</dt>
              <dd className="text-right text-ink">{location.city}, {location.state}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Awards</dt>
              <dd className="text-right text-ink">National Diploma (ND)</dd>
            </div>
          </dl>
        </aside>
      </Container>
    </>
  );
}
