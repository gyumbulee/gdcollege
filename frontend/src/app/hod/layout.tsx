import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { requireSession } from "@/lib/auth/session";

const TABS = [
  { href: "/hod", label: "Dashboard" },
  { href: "/hod/registrations", label: "Registrations" },
  { href: "/hod/results", label: "Results" },
  { href: "/hod/students", label: "Students" },
  { href: "/hod/staff", label: "Staff" },
  { href: "/hod/academics", label: "Academics" },
  { href: "/hod/reports", label: "Reports" },
];

/**
 * Every /hod/* page shares this: a `role:hod` gate (mirroring the
 * backend's `role:hod` route middleware — this is UX only, not the
 * security boundary, per session.ts's own note) and a consistent
 * sub-navigation. Individual pages don't re-check the role.
 */
export default async function HodLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("/hod");

  if (!session.roles.includes("hod")) {
    redirect("/portal");
  }

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">HOD Portal</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
          Department Overview
        </h1>
      </div>

      <nav className="flex flex-wrap gap-1 border-b border-border pb-2">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-sky-light hover:text-sky-dark"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </Container>
  );
}
