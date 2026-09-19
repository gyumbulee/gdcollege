import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireSession, can } from "@/lib/auth/session";

export default async function AdminLandingPage() {
  const session = await requireSession("/admin");

  const sections = [
    { href: "/admin/users", label: "Staff Users", description: "Create staff accounts and manage role assignments.", permission: "users.manage" },
    { href: "/admin/roles", label: "Roles & Permissions", description: "See what each role can do, and adjust it.", permission: "roles.manage" },
    { href: "/admin/audit-logs", label: "Audit Logs", description: "Trace who did what, and when.", permission: "audit_logs.view" },
    { href: "/admin/institution", label: "Institution Settings", description: "Name, contact details, logo and banner.", permission: "institution.manage" },
    { href: "/admin/cms", label: "CMS", description: "Announcements, news, events, gallery, downloads, FAQs.", permission: "cms.manage" },
  ].filter((s) => can(session, s.permission));

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Admin</h1>
      </div>

      {sections.length === 0 ? (
        <EmptyState title="No administrative access" description="Your account doesn't hold any System Administration permissions." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="rounded-lg border border-border bg-white p-5 hover:border-sky-dark"
            >
              <p className="font-medium text-ink">{s.label}</p>
              <p className="mt-1 text-sm text-muted">{s.description}</p>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
