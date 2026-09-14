import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { requireSession } from "@/lib/auth/session";

const TABS = [
  { href: "/registrar", label: "Dashboard" },
  { href: "/registrar/documents", label: "Document Requests" },
];

export default async function RegistrarLayout({ children }: { children: ReactNode }) {
  const session = await requireSession("/registrar");

  if (!session.roles.includes("registrar")) {
    redirect("/portal");
  }

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Registrar Portal</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
          Registry &amp; Documents
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
