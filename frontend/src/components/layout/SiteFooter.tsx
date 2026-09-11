import Link from "next/link";
import { institutionConfig } from "@/config/institution.config";
import { CrestMark } from "@/components/brand/CrestMark";
import { Container } from "@/components/ui/Container";

export function SiteFooter() {
  const { identity, location, contact, nav } = institutionConfig;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-ink text-white/80">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-3">
            <CrestMark size={32} />
            <span className="font-[family-name:var(--font-display)] text-white">
              {identity.shortName}
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/60">
            {identity.formalName}
            {location.city && location.state ? ` — ${location.city}, ${location.state}` : ""}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm">
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-white/60 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">Portals</h3>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/admissions/application" className="text-white/60 hover:text-white">
                Applicant Portal
              </Link>
            </li>
            <li>
              <Link href="/student/login" className="text-white/60 hover:text-white">
                Student Login
              </Link>
            </li>
            <li>
              <Link href="/verify" className="text-white/60 hover:text-white">
                Verify a Document
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-medium text-white">Contact</h3>
          <ul className="mt-4 space-y-2 text-sm text-white/60">
            <li>{location.address ?? "Address to be confirmed by Registry"}</li>
            <li>{contact.phone ?? "Phone number pending"}</li>
            <li>{contact.email ?? "Email pending"}</li>
          </ul>
        </div>
      </Container>

      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        © {year} {identity.formalName}. All rights reserved.
      </div>
    </footer>
  );
}
