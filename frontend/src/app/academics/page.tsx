import Link from "next/link";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { getSchools } from "@/lib/api/academics";

export const revalidate = 300;

export default async function AcademicsPage() {
  const { ok, items: schools } = await getSchools();

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Academics" }]}
        title="Academics"
        description="Schools, departments, and National Diploma programmes offered at the College."
      />

      <Container className="py-12">
        <div className="mb-8 flex flex-wrap gap-4 text-sm">
          <Link href="/academics/schools" className="text-sky-dark hover:underline">
            Browse by school
          </Link>
          <Link href="/academics/departments" className="text-sky-dark hover:underline">
            Browse by department
          </Link>
          <Link href="/academics/programmes" className="text-sky-dark hover:underline">
            Browse all programmes
          </Link>
        </div>

        {!ok && (
          <EmptyState
            title="Academic catalogue temporarily unavailable"
            description="We couldn't reach the academic records service just now. Please try again shortly."
          />
        )}

        {ok && schools.length === 0 && (
          <EmptyState
            title="Academic structure not yet configured"
            description="Schools, departments, and programmes will appear here once entered by Academic Affairs."
          />
        )}

        {ok && schools.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schools.map((school) => (
              <div
                key={school.id}
                className="rounded-lg border border-border bg-white p-5"
              >
                <p className="font-medium text-ink">{school.name}</p>
                {school.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{school.description}</p>
                )}
                <div className="mt-3">
                  <Badge tone="sky">
                    {school.departments_count ?? 0} department{school.departments_count === 1 ? "" : "s"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
