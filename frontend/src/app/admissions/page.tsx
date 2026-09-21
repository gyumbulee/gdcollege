import Link from "next/link";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getAdmissionsStatus } from "@/lib/api/applications";

export default async function AdmissionsPage() {
  const { body } = await getAdmissionsStatus();
  const status = body.success ? body.data : null;

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Admissions" }]}
        title="Admissions"
        description="How to apply, what's required, and current admission status."
        actions={
          status?.is_open ? (
            <Button href="/admissions/application" variant="primary">
              Start an Application
            </Button>
          ) : undefined
        }
      />
      <Container className="py-12">
        <div className="mb-8 flex flex-wrap gap-4 text-sm">
          <Link href="/admissions/requirements" className="text-sky-dark hover:underline">
            Admission requirements
          </Link>
          <Link href="/admissions/admission-list" className="text-sky-dark hover:underline">
            Admission list
          </Link>
          <Link href="/academics/programmes" className="text-sky-dark hover:underline">
            Available programmes
          </Link>
        </div>

        {status?.is_open ? (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-white p-6">
            <Badge tone="success">Open</Badge>
            <div>
              <p className="text-sm font-medium text-ink">
                Applications are open for the {status.session_name} session.
              </p>
              {status.admissions_close_at && (
                <p className="mt-1 text-sm text-muted">
                  Closes {new Date(status.admissions_close_at).toLocaleString()}.
                </p>
              )}
            </div>
          </div>
        ) : (
          <EmptyState
            title={status?.session_name ? `Applications are currently closed for ${status.session_name}` : "No admission session currently open"}
            description={
              status?.admissions_open_at
                ? `Applications open ${new Date(status.admissions_open_at).toLocaleString()}.`
                : "Application periods, deadlines, and current-session details will appear here once configured by the Admissions Office."
            }
          />
        )}
      </Container>
    </>
  );
}
