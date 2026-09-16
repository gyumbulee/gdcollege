import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-start justify-center gap-6 py-16">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-ink">
          Reset your password
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Choose a new password for your account.
        </p>
      </div>

      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </Container>
  );
}
