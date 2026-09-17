import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminRoles, getAdminPermissions } from "@/lib/api/admin";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { PermissionToggle } from "@/components/admin/PermissionToggle";

export default async function AdminRolesPage() {
  const session = await requireSession("/admin/roles");
  if (!can(session, "roles.manage")) redirect("/admin");

  const token = await getSessionToken();
  const [rolesResult, permissionsResult] = await Promise.all([
    getAdminRoles(token!),
    getAdminPermissions(token!),
  ]);

  const permissions = permissionsResult.body.success ? permissionsResult.body.data : [];
  const canTogglePermissions = can(session, "permissions.manage");

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Roles &amp; Permissions</h1>
        <p className="mt-1 text-sm text-muted">
          The role and permission set itself comes from the platform specification — what&apos;s configurable here
          is which permissions each role currently holds.
        </p>
      </div>

      {!rolesResult.body.success ? (
        <EmptyState title="Could not load roles" description={rolesResult.body.message} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {rolesResult.body.data.map((role) => (
            <div key={role.id} className="rounded-lg border border-border bg-white p-5">
              <p className="font-medium text-ink">{role.name}</p>
              {role.description && <p className="mt-1 text-sm text-muted">{role.description}</p>}

              {role.slug === "super_administrator" ? (
                <p className="mt-3 text-xs text-muted">Bypasses the permission table entirely — not editable here.</p>
              ) : (
                <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                  {permissions.map((permission) =>
                    canTogglePermissions ? (
                      <PermissionToggle
                        key={permission.slug}
                        roleId={role.id}
                        roleSlug={role.slug}
                        permissionId={permission.id}
                        permissionSlug={permission.slug}
                        granted={role.permissions.includes(permission.slug)}
                      />
                    ) : (
                      role.permissions.includes(permission.slug) && (
                        <p key={permission.slug} className="text-xs text-ink">{permission.slug}</p>
                      )
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
