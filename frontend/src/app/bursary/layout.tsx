import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { requireSession } from "@/lib/auth/session";

const TABS = [
  { href: "/bursary", label: "Dashboard" },
  { href: "/bursary/fee-structures", label: "Fee Structures" },
  { href: "/bursary/invoices", label: "Invoices" },
  { href: "/bursary/payments", label: "Payments" },
];

/**
 * Every /bursary/* page shares this: a `role:bursary_officer` gate (UX
 * only — Laravel's own `permission:*` middleware per action is the real
 * boundary, same note as hod/layout.tsx) and consistent sub-navigation.
 */
export default async function BursaryLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("/bursary");

  if (!session.roles.includes("bursary_officer")) {
    redirect("/portal");
  }

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Bursary Portal</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
          Finance &amp; Fees
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
