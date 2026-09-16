import { Container } from "@/components/ui/Container";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-start justify-center gap-6 py-16">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-ink">
          Forgot your password?
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          Enter the email address on your account and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />
    </Container>
  );
}
