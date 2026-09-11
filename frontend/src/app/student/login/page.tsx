import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/auth/LoginForm";

export default function StudentLoginPage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-start justify-center gap-6 py-16">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-ink">
          Sign in
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          For students, staff, and administrators. Applicants without an
          account yet should start an application instead.
        </p>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
