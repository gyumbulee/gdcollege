import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDepartments } from "@/lib/api/academics";

export const revalidate = 300;

export default async function DepartmentsPage() {
  const { ok, items: departments } = await getDepartments();

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Academics", href: "/academics" }, { label: "Departments" }]}
        title="Departments"
        description="Departments across all schools, each offering one or more programmes."
      />
      <Container className="py-12">
        {!ok && (
          <EmptyState title="Temporarily unavailable" description="Couldn't load departments just now — try again shortly." />
        )}
        {ok && departments.length === 0 && (
          <EmptyState title="No departments configured yet" description="Departments will appear here once entered by Academic Affairs." />
        )}
        {ok && departments.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {departments.map((dept) => (
              <div key={dept.id} className="rounded-lg border border-border bg-white p-5">
                <p className="text-xs text-sky-dark">{dept.school?.name ?? "School unassigned"}</p>
                <p className="mt-1 font-medium text-ink">{dept.name}</p>
                {dept.description && <p className="mt-1 text-sm text-muted">{dept.description}</p>}
                <p className="mt-3 text-xs text-muted">
                  {dept.programmes_count ?? 0} programme{dept.programmes_count === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
