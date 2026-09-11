import Link from "next/link";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function AdmissionsPage() {
  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Admissions" }]}
        title="Admissions"
        description="How to apply, what's required, and current admission status."
        actions={
          <Button href="/admissions/application" variant="primary">
            Start an Application
          </Button>
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

        <EmptyState
          title="No admission session currently open"
          description="Application periods, deadlines, and current-session details will appear here once configured by the Admissions Office (Phase 5)."
        />
      </Container>
    </>
  );
}
