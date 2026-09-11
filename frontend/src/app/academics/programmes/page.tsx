import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { getProgrammes } from "@/lib/api/academics";

export const revalidate = 300;

export default async function ProgrammesPage() {
  const { ok, items: programmes } = await getProgrammes();

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Academics", href: "/academics" }, { label: "Programmes" }]}
        title="Programmes"
        description="All programmes currently offered, across every department."
        actions={
          <a href="/admissions/requirements" className="text-sm text-sky-dark hover:underline">
            Admission requirements
          </a>
        }
      />
      <Container className="py-12">
        {!ok && (
          <EmptyState title="Temporarily unavailable" description="Couldn't load programmes just now — try again shortly." />
        )}
        {ok && programmes.length === 0 && (
          <EmptyState title="No programmes configured yet" description="Programmes will appear here once entered by Academic Affairs." />
        )}
        {ok && programmes.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border bg-white">
            {programmes.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-ink">{p.name}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {p.department?.name}
                    {p.department?.school ? ` · ${p.department.school.name}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone="muted">{p.award_type}</Badge>
                  {!p.is_active && <Badge tone="amber">Inactive</Badge>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
