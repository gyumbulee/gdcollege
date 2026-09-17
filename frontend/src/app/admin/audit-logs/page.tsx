import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminAuditLogs } from "@/lib/api/admin";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { AuditLogFilterForm } from "@/components/admin/AuditLogFilterForm";

export default async function AdminAuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; target_type?: string; from?: string; to?: string }>;
}) {
  const session = await requireSession("/admin/audit-logs");
  if (!can(session, "audit_logs.view")) redirect("/admin");

  const filters = await searchParams;
  const token = await getSessionToken();

  const params: Record<string, string> = {};
  if (filters.action) params.action = filters.action;
  if (filters.target_type) params.target_type = filters.target_type;
  if (filters.from) params.from = filters.from;
  if (filters.to) params.to = filters.to;

  const { body } = await getAdminAuditLogs(token!, params);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Audit Logs</h1>
      </div>

      <AuditLogFilterForm initial={filters} />

      {!body.success ? (
        <EmptyState title="Could not load audit logs" description={body.message} />
      ) : body.data.items.length === 0 ? (
        <EmptyState title="No audit log entries match these filters" description="Try widening the date range or clearing the action filter." />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs text-muted">
              <tr>
                <th className="px-4 py-2">When</th>
                <th className="px-4 py-2">Action</th>
                <th className="px-4 py-2">By</th>
                <th className="px-4 py-2">Target</th>
                <th className="px-4 py-2">IP</th>
              </tr>
            </thead>
            <tbody>
              {body.data.items.map((log) => (
                <tr key={log.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 text-muted">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-2 font-medium text-ink">{log.action}</td>
                  <td className="px-4 py-2 text-ink">{log.user ? `${log.user.name} (${log.user.email})` : "System"}</td>
                  <td className="px-4 py-2 text-muted">{log.target_type ? `${log.target_type} #${log.target_id}` : "—"}</td>
                  <td className="px-4 py-2 text-muted">{log.ip_address ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Container>
  );
}
