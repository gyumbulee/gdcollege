import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { requireSession, can } from "@/lib/auth/session";

/**
 * Gated on `reports.view` (not a role check) to mirror the backend's
 * `permission:reports.view` middleware exactly — see
 * ManagementDashboardController's docblock for why. This is UX only, not
 * the security boundary; Laravel enforces it independently on every
 * request.
 */
export default async function ManagementDashboardLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("/management/dashboard");

  if (!can(session, "reports.view")) {
    redirect("/portal");
  }

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Management Portal</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
          Executive Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted">
          Institution-wide visibility across students, admissions, finance, and academic performance.
        </p>
      </div>

      {children}
    </Container>
  );
}
