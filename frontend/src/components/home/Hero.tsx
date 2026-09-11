import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { institutionConfig } from "@/config/institution.config";

export function Hero() {
  const { identity, location } = institutionConfig;

  return (
    <section className="border-b border-border bg-white">
      <Container className="grid gap-10 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="text-sm text-sky-dark">
            {location.city}, {location.state} · Nigeria
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-[1.1] text-ink sm:text-5xl">
            {identity.formalName}
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
            A National Diploma-awarding institution building graduates ready
            for work and further study. This platform carries a student from
            application through registration, results, and clearance —
            without leaving it.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/admissions/application" variant="primary">
              Start an Application
            </Button>
            <Button href="/academics" variant="ghost">
              Explore Academics
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm font-medium text-ink">Quick facts</p>
          <dl className="mt-4 space-y-4 text-sm">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted">Awards</dt>
              <dd className="text-right text-ink">National Diploma (ND)</dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-border pb-3">
              <dt className="text-muted">Levels</dt>
              <dd className="text-right text-ink">ND I · ND II</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-muted">Application status</dt>
              <dd className="text-right">
                <Link href="/admissions" className="text-sky-dark hover:underline">
                  View current admissions
                </Link>
              </dd>
            </div>
          </dl>
        </div>
      </Container>
    </section>
  );
}
