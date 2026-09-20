import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { LoginGateway } from "@/components/auth/LoginGateway";
import { getSession } from "@/lib/auth/session";
import { getDashboardPath } from "@/lib/auth/dashboard";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) {
    const { next } = await searchParams;
    redirect(next ?? getDashboardPath(session.roles));
  }

  return (
    <Container className="flex min-h-[70vh] flex-col items-start justify-center gap-6 py-16">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-ink">
          Sign in
        </h1>
        <p className="mt-2 max-w-sm text-sm text-muted">
          One account system for the whole platform — pick what best
          describes you and we&apos;ll take you to the right place.
        </p>
      </div>

      <LoginGateway />
    </Container>
  );
}
