import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getInstitutionSettings } from "@/lib/api/admin";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { InstitutionSettingsForm } from "@/components/admin/InstitutionSettingsForm";

export default async function AdminInstitutionPage() {
  const session = await requireSession("/admin/institution");
  if (!can(session, "institution.manage")) redirect("/admin");

  const token = await getSessionToken();
  const { body } = await getInstitutionSettings(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Institution Settings</h1>
        <p className="mt-1 text-sm text-muted">
          The single source of truth for institutional identity and contact details. The brand colour palette
          stays defined in code (frontend/src/config/institution.config.ts) since it&apos;s compiled into the
          site&apos;s styles at build time.
        </p>
      </div>

      {!body.success ? (
        <EmptyState title="Could not load institution settings" description={body.message} />
      ) : (
        <InstitutionSettingsForm settings={body.data} />
      )}
    </Container>
  );
}
