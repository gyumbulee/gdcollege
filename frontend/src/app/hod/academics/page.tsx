import { getSessionToken } from "@/lib/auth/session";
import { getHodProgrammes, getHodCourseOfferings } from "@/lib/api/hod";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

export default async function HodAcademicsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const token = await getSessionToken();
  const [programmesResult, offeringsResult] = await Promise.all([
    getHodProgrammes(token!),
    getHodCourseOfferings(token!, Number(page ?? 1)),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-lg font-medium text-ink">Programmes</h2>
        <p className="mt-1 text-sm text-muted">
          Read-only — programme/course changes go through Academic Structure management.
        </p>

        {!programmesResult.body.success || programmesResult.body.data.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No programmes"
              description={
                programmesResult.body.success
                  ? "Your department has no programmes yet."
                  : programmesResult.body.message
              }
            />
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {programmesResult.body.data.map((programme) => (
              <div key={programme.id} className="rounded-lg border border-border bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-ink">{programme.name}</p>
                  {!programme.is_active && <Badge tone="muted">Inactive</Badge>}
                </div>
                <p className="mt-1 text-sm text-muted">
                  {programme.award_type} · {programme.duration_levels} level
                  {programme.duration_levels === 1 ? "" : "s"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-medium text-ink">Course Offerings</h2>

        {!offeringsResult.body.success || offeringsResult.body.data.items.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              title="No course offerings"
              description={
                offeringsResult.body.success
                  ? "No course offerings exist for your department's programmes yet."
                  : offeringsResult.body.message
              }
            />
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-lg border border-border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">Course</th>
                  <th className="px-4 py-3">Programme</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Session / Semester</th>
                  <th className="px-4 py-3">Lecturer</th>
                </tr>
              </thead>
              <tbody>
                {offeringsResult.body.data.items.map((offering) => (
                  <tr key={offering.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-ink">
                      {offering.course.code} — {offering.course.title}
                    </td>
                    <td className="px-4 py-3 text-ink">{offering.programme.name}</td>
                    <td className="px-4 py-3 text-ink">{offering.level.name}</td>
                    <td className="px-4 py-3 text-ink">
                      {offering.academic_session.name} · {offering.semester.name}
                    </td>
                    <td className="px-4 py-3 text-ink">{offering.lecturer?.name ?? "Unassigned"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
