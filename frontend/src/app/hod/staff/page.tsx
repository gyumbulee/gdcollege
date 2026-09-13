import { getSessionToken } from "@/lib/auth/session";
import { getHodStaff } from "@/lib/api/hod";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function HodStaffPage() {
  const token = await getSessionToken();
  const { body } = await getHodStaff(token!);

  if (!body.success) {
    return <EmptyState title="Could not load staff" description={body.message} />;
  }

  if (body.data.length === 0) {
    return (
      <EmptyState
        title="No staff assigned yet"
        description="No lecturer is currently teaching a course offering in your department."
      />
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Course offerings</th>
          </tr>
        </thead>
        <tbody>
          {body.data.map((member) => (
            <tr key={member.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3 font-medium text-ink">{member.name}</td>
              <td className="px-4 py-3 text-ink">{member.email}</td>
              <td className="px-4 py-3 text-ink">{member.phone ?? "—"}</td>
              <td className="px-4 py-3 text-ink">{member.course_offerings_count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
