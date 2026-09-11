import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { getSchools } from "@/lib/api/academics";

export const revalidate = 300;

export default async function SchoolsPage() {
  const { ok, items: schools } = await getSchools();

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Academics", href: "/academics" }, { label: "Schools" }]}
        title="Schools"
        description="The College's schools, each home to one or more departments."
      />
      <Container className="py-12">
        {!ok && (
          <EmptyState title="Temporarily unavailable" description="Couldn't load schools just now — try again shortly." />
        )}
        {ok && schools.length === 0 && (
          <EmptyState title="No schools configured yet" description="Schools will appear here once entered by Academic Affairs." />
        )}
        {ok && schools.length > 0 && (
          <ul className="divide-y divide-border rounded-lg border border-border bg-white">
            {schools.map((school) => (
              <li key={school.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-ink">{school.name}</p>
                  {school.description && <p className="mt-0.5 text-sm text-muted">{school.description}</p>}
                </div>
                <Badge tone="sky">
                  {school.departments_count ?? 0} department{school.departments_count === 1 ? "" : "s"}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
