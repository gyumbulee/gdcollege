import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminUsers, getAdminRoles } from "@/lib/api/admin";
import { getDepartments } from "@/lib/api/academics";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { CreateUserForm } from "@/components/admin/CreateUserForm";
import { UserStatusToggle } from "@/components/admin/UserStatusToggle";

export default async function AdminUsersPage() {
  const session = await requireSession("/admin/users");
  if (!can(session, "users.manage")) redirect("/admin");

  const token = await getSessionToken();
  const [usersResult, rolesResult, departmentsResult] = await Promise.all([
    getAdminUsers(token!),
    getAdminRoles(token!),
    getDepartments(),
  ]);

  const roles = rolesResult.body.success ? rolesResult.body.data : [];
  const departments = departmentsResult.items.map((d) => ({ id: d.id, name: d.name }));

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Staff Users</h1>
      </div>

      <CreateUserForm roles={roles} departments={departments} />

      {!usersResult.body.success ? (
        <EmptyState title="Could not load staff users" description={usersResult.body.message} />
      ) : usersResult.body.data.items.length === 0 ? (
        <EmptyState title="No staff accounts yet" description="Create the first one above." />
      ) : (
        <div className="flex flex-col gap-3">
          {usersResult.body.data.items.map((user) => (
            <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-4">
              <div>
                <p className="font-medium text-ink">{user.name}</p>
                <p className="text-sm text-muted">{user.email}{user.phone ? ` · ${user.phone}` : ""}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {user.roles.map((r) => (
                    <Badge key={r.slug} tone="sky">{r.name}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={user.status === "active" ? "success" : "muted"}>{user.status}</Badge>
                <UserStatusToggle userId={user.id} status={user.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
