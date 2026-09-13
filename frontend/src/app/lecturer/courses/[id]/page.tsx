import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession, getSessionToken, can } from "@/lib/auth/session";
import { getRoster, listLecturerResults, listResultComponents } from "@/lib/api/results";
import { ResultEntryGrid } from "@/components/lecturer/ResultEntryGrid";

export default async function LecturerCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || !can(session, "results.view")) {
    return (
      <Container className="py-16">
        <EmptyState title="You don't have access to this page" description="Sign in with a lecturer account." />
      </Container>
    );
  }

  const token = await getSessionToken();
  const [rosterRes, resultsRes, componentsRes] = await Promise.all([
    getRoster(token!, Number(id)),
    listLecturerResults(token!, Number(id)),
    listResultComponents(token!),
  ]);

  if (!rosterRes.body.success) {
    return (
      <Container className="py-16">
        <EmptyState title="Not found" description="This course offering may not be assigned to you." />
      </Container>
    );
  }

  const roster = rosterRes.body.data;
  const results = resultsRes.body.success ? resultsRes.body.data : [];
  const components = componentsRes.body.success ? componentsRes.body.data : [];

  return (
    <Container className="py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Result Entry</h1>
      <p className="mt-1 text-sm text-muted">
        Enter {components.map((c) => c.name).join(" and ") || "component"} scores, save as draft, then submit for review.
      </p>

      <div className="mt-8">
        {roster.length === 0 ? (
          <EmptyState title="No registered students yet" description="Students who register and are approved for this course will appear here." />
        ) : (
          <ResultEntryGrid offeringId={Number(id)} roster={roster} initialResults={results} components={components} />
        )}
      </div>
    </Container>
  );
}
