import { getSessionToken } from "@/lib/auth/session";
import { getHodPendingResults } from "@/lib/api/hod";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { ReviewResultButton } from "@/components/hod/ReviewResultButton";

export default async function HodResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const token = await getSessionToken();
  const { body } = await getHodPendingResults(token!, Number(page ?? 1));

  if (!body.success) {
    return <EmptyState title="Could not load results" description={body.message} />;
  }

  const { items, pagination } = body.data;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing pending"
        description="No SUBMITTED results are waiting on your department right now."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Lecturer-submitted results for your department, awaiting your review before they move on
        to Academic/Examination Officer verification.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Course</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Grade</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.map((result) => (
              <tr key={result.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{result.student?.name ?? "Unknown student"}</p>
                  <p className="text-xs text-muted">{result.student?.matric_number ?? "—"}</p>
                </td>
                <td className="px-4 py-3 text-ink">
                  {result.course_offering?.course?.code} — {result.course_offering?.course?.title}
                </td>
                <td className="px-4 py-3 text-ink">{result.total_score ?? "—"}</td>
                <td className="px-4 py-3">
                  {result.grade ? <Badge tone="sky">{result.grade}</Badge> : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <ReviewResultButton resultId={result.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.last_page && pagination.last_page > 1 && (
        <p className="text-center text-sm text-muted">
          Page {pagination.current_page} of {pagination.last_page}
        </p>
      )}
    </div>
  );
}
