import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { requireSession, can } from "@/lib/auth/session";
import {
  Users, ShieldCheck, ScrollText, Building2, Newspaper, GraduationCap, FileText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export default async function AdminLandingPage() {
  const session = await requireSession("/admin");

  const sections: Array<{ href: string; label: string; description: string; icon: LucideIcon; permission: string | string[] }> = [
    { href: "/admin/users", label: "Staff Users", description: "Create staff accounts and manage role assignments.", icon: Users, permission: "users.manage" },
    { href: "/admin/roles", label: "Roles & Permissions", description: "See what each role can do, and adjust it.", icon: ShieldCheck, permission: "roles.manage" },
    { href: "/admin/audit-logs", label: "Audit Logs", description: "Trace who did what, and when.", icon: ScrollText, permission: "audit_logs.view" },
    { href: "/admin/institution", label: "Institution Settings", description: "Name, contact details, logo and banner.", icon: Building2, permission: "institution.manage" },
    { href: "/admin/document-templates", label: "Document Templates", description: "Upload reference files for receipts, slips, letters & certificates (demo).", icon: FileText, permission: "institution.manage" },
    { href: "/admin/cms", label: "CMS", description: "Announcements, news, events, gallery, downloads, FAQs.", icon: Newspaper, permission: "cms.manage" },
    { href: "/admin/academics", label: "Academic Structure", description: "Schools, departments, programmes, sessions, courses & offerings.", icon: GraduationCap, permission: ["academic_structure.manage", "courses.create", "courses.update"] },
  ].filter((s) => (Array.isArray(s.permission) ? s.permission.some((p) => can(session, p)) : can(session, s.permission)));

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Admin</h1>
      </div>

      {sections.length === 0 ? (
        <EmptyState title="No administrative access" description="Your account doesn't hold any System Administration permissions." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-white p-5 transition-colors hover:border-sky-dark hover:bg-sky-light/30"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-light text-sky-dark transition-colors group-hover:bg-sky-dark group-hover:text-white">
                <s.icon size={22} strokeWidth={1.75} aria-hidden />
              </span>
              <p className="font-medium text-ink">{s.label}</p>
              <p className="text-sm text-muted">{s.description}</p>
            </Link>
          ))}
        </div>
      )}
    </Container>
  );
}
