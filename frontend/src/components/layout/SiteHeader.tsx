import Link from "next/link";
import { institutionConfig } from "@/config/institution.config";
import { getInstitutionData } from "@/lib/api/institution";
import { CrestMark } from "@/components/brand/CrestMark";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { SignOutButton } from "@/components/auth/SignOutButton";
import { getSession } from "@/lib/auth/session";
import { MobileNav } from "./MobileNav";

export async function SiteHeader() {
  const { nav } = institutionConfig;
  const [{ identity, assets }, session] = await Promise.all([getInstitutionData(), getSession()]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <CrestMark size={36} logoSrc={assets.logoSrc} shortName={identity.shortName} />
          <span className="hidden font-[family-name:var(--font-display)] text-base leading-tight text-ink sm:block">
            {identity.shortName}
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink/80 transition-colors hover:text-sky-dark"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {session ? (
            <>
              <span className="mr-1 text-sm text-muted">{session.name}</span>
              <Button href="/portal" variant="ghost">
                My Portal
              </Button>
              <SignOutButton />
            </>
          ) : (
            <>
              <Button href="/student/login" variant="ghost">
                Login
              </Button>
              <Button href="/admissions/application" variant="primary">
                Apply Now
              </Button>
            </>
          )}
        </div>

        <MobileNav nav={nav} session={session} />
      </Container>
    </header>
  );
}
