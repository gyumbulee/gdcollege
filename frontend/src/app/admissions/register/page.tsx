import { Container } from "@/components/ui/Container";
import { RegisterForm } from "@/components/admissions/RegisterForm";

export default function ApplicantRegisterPage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-start justify-center gap-6 py-16">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-ink">
          Create your applicant account
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          You&apos;ll use this account to complete and track your application.
        </p>
      </div>
      <RegisterForm />
    </Container>
  );
}
