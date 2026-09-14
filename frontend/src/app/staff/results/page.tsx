import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getSession,
  getSessionToken,
  can,
} from "@/lib/auth/session";
import { listStaffResults } from "@/lib/api/results";
import type { Result } from "@/types/results";
import { ResultQueueTable } from "@/components/results/ResultQueueTable";

export default async function StaffResultsPage() {
  const session = await getSession();

  if (!session || !can(session, "results.view")) {
    return (
      <Container className="py-16">
        <EmptyState
          title="You don't have access to this page"
          description="Sign in with an HOD or Academic Officer account."
        />
      </Container>
    );
  }

  const token = await getSessionToken();

  if (!token) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Your session has expired"
          description="Please sign in again to continue."
        />
      </Container>
    );
  }

  const { body } = await listStaffResults(token);

  const results: Result[] =
    body.success && Array.isArray(body.data.items)
      ? body.data.items
      : [];

  return (
    <Container className="py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
        Results Pipeline
      </h1>

      <p className="mt-1 text-sm text-muted">
        SUBMITTED → REVIEWED (HOD) → VERIFIED → APPROVED → PUBLISHED
        (Academic Officer).
      </p>

      <div className="mt-8">
        {results.length === 0 ? (
          <EmptyState
            title="Nothing pending"
            description="Results awaiting review, verification, approval, or publication will appear here."
          />
        ) : (
          <ResultQueueTable
            initialResults={results}
            canReview={can(session, "results.review")}
            canVerify={can(session, "results.verify")}
            canApprove={can(session, "results.approve")}
            canPublish={can(session, "results.publish")}
          />
        )}
      </div>
    </Container>
  );
}