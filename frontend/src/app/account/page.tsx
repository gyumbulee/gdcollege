import { requireSession } from "@/lib/auth/session";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default async function AccountPage() {
  const session = await requireSession("/account");

  return (
    <Container className="flex flex-col gap-8 py-12">
      <div>
        <p className="text-sm text-muted">Your account</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">{session.name}</h1>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {session.roles.map((role) => (
            <Badge key={role} tone="sky">
              {role.replace(/_/g, " ")}
            </Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="font-medium text-ink">Change password</p>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Changing your password signs you out of every other device — the one you&apos;re on now stays signed in.
        </p>
        <div className="mt-4">
          <ChangePasswordForm />
        </div>
      </div>
    </Container>
  );
}
