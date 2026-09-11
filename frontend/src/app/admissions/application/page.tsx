import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { listApplications } from "@/lib/api/applications";
import { getProgrammes } from "@/lib/api/academics";
import { StartApplicationCard } from "@/components/admissions/StartApplicationCard";
import { ApplicationWizard } from "@/components/admissions/ApplicationWizard";

export default async function ApplicantPortalPage() {
  const session = await getSession();

  if (!session) {
    return (
      <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-4 py-16">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-ink">
          Start your application
        </h1>
        <p className="max-w-md text-muted">
          Create an applicant account to begin, or sign in if you already
          have one.
        </p>
        <div className="flex gap-3">
          <Button href="/admissions/register" variant="primary">
            Create account
          </Button>
          <Button href="/student/login?next=/admissions/application" variant="ghost">
            Sign in
          </Button>
        </div>
      </Container>
    );
  }

  if (!session.roles.includes("applicant")) {
    return (
      <Container className="py-16">
        <EmptyState
          title="This page is for applicant accounts"
          description="You're signed in with a staff/student account. Sign out and register a separate applicant account to apply."
        />
      </Container>
    );
  }

  const token = await getSessionToken();
  const [{ body: appsBody }, { items: programmes }] = await Promise.all([
    listApplications(token!),
    getProgrammes(),
  ]);

  const applications = appsBody.success ? appsBody.data : [];
  const active = applications.find((a) => a.status !== "WITHDRAWN") ?? null;

  return (
    <Container className="py-12">
      {active ? (
        <ApplicationWizard
          initialApplication={active}
          programmes={programmes.filter((p) => p.is_active)}
        />
      ) : (
        <StartApplicationCard />
      )}
    </Container>
  );
}
