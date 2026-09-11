import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { requireSession, can } from "@/lib/auth/session";

/**
 * Generic authenticated landing page. Role-specific dashboards (student,
 * lecturer, HOD, registrar, management, admin...) replace this per role as
 * their phases land — see docs/PROJECT_STATUS.md. This exists now purely
 * to prove the auth flow end-to-end: login → httpOnly session → protected
 * page → permission-aware UI → logout.
 */
export default async function PortalPage() {
  const session = await requireSession("/portal");

  return (
    <Container className="flex flex-col gap-8 py-16">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted">Signed in as</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            {session.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {session.roles.map((role) => (
              <Badge key={role} tone="sky">
                {role.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        </div>
        <SignOutButton />
      </div>

      <div className="rounded-lg border border-border bg-white p-6">
        <p className="text-sm font-medium text-ink">Available to you</p>
        <p className="mt-1 text-sm text-muted">
          This section grows as each phase adds role-specific dashboards.
          Below is a live example: this link only appears because your
          account holds the <code className="text-xs">users.manage</code>{" "}
          permission — the backend independently enforces this on every
          request, this is just the UI reflecting it.
        </p>

        {can(session, "users.manage") ? (
          <p className="mt-4 text-sm text-sky-dark">
            User &amp; role management (Phase 21) — not built yet.
          </p>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Nothing module-specific yet — check back as later phases land.
          </p>
        )}
      </div>
    </Container>
  );
}
