import Link from "next/link";
import { institutionConfig } from "@/config/institution.config";
import { CrestMark } from "@/components/brand/CrestMark";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "./MobileNav";

export function SiteHeader() {
  const { identity, nav } = institutionConfig;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3">
          <CrestMark size={36} />
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
          <Button href="/student/login" variant="ghost">
            Student Login
          </Button>
          <Button href="/admissions/application" variant="primary">
            Apply Now
          </Button>
        </div>

        <MobileNav nav={nav} />
      </Container>
    </header>
  );
}
