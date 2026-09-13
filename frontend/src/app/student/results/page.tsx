import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { listMyResults } from "@/lib/api/results";

export default async function StudentResultsPage() {
  const session = await getSession();

  if (!session || !session.roles.includes("student")) {
    return (
      <Container className="py-16">
        <EmptyState title="This page is for student accounts" description="Sign in with your student account to view results." />
      </Container>
    );
  }

  const token = await getSessionToken();
  const { body } = await listMyResults(token!);
  const results = body.success ? body.data : [];

  return (
    <Container className="py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">My Results</h1>
      <p className="mt-1 text-sm text-muted">Only published results appear here.</p>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState title="No published results yet" description="Results appear here once approved and published by the Academic Officer." />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-white">
            {results.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-medium text-ink">{r.course_offering?.course?.code} — {r.course_offering?.course?.title}</p>
                  <p className="text-xs text-muted">Total: {r.total_score}</p>
                </div>
                <Badge tone="sky">{r.grade}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
