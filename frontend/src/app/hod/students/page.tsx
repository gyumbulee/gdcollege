import { getSessionToken } from "@/lib/auth/session";
import { getHodStudents } from "@/lib/api/hod";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  ACTIVE: "success",
  DEFERRED: "amber",
  SUSPENDED: "danger",
  WITHDRAWN: "muted",
  EXPELLED: "danger",
  GRADUATED: "sky",
};

export default async function HodStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>;
}) {
  const { page, status } = await searchParams;
  const token = await getSessionToken();
  const { body } = await getHodStudents(token!, Number(page ?? 1), status);

  if (!body.success) {
    return <EmptyState title="Could not load students" description={body.message} />;
  }

  const { items, pagination } = body.data;

  if (items.length === 0) {
    return (
      <EmptyState
        title="No students found"
        description="No students match your department right now."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Matric No.</th>
              <th className="px-4 py-3">Programme</th>
              <th className="px-4 py-3">Level</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((student) => (
              <tr key={student.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium text-ink">{student.user?.name ?? "—"}</p>
                  <p className="text-xs text-muted">{student.user?.email}</p>
                </td>
                <td className="px-4 py-3 text-ink">{student.matric_number ?? "—"}</td>
                <td className="px-4 py-3 text-ink">{student.programme?.name ?? "—"}</td>
                <td className="px-4 py-3 text-ink">{student.current_level?.name ?? "—"}</td>
                <td className="px-4 py-3">
                  <Badge tone={STATUS_TONE[student.status] ?? "muted"}>{student.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination.last_page && pagination.last_page > 1 && (
        <p className="text-center text-sm text-muted">
          Page {pagination.current_page} of {pagination.last_page} ({pagination.total} students)
        </p>
      )}
    </div>
  );
}
