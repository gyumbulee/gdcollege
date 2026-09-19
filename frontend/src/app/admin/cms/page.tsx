import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession, can } from "@/lib/auth/session";
import { Container } from "@/components/ui/Container";

export default async function AdminCmsLandingPage() {
  const session = await requireSession("/admin/cms");
  if (!can(session, "cms.manage")) redirect("/admin");

  const sections = [
    { href: "/admin/cms/announcements", label: "Announcements", description: "Targeted notices that also notify users in-app." },
    { href: "/admin/cms/pages", label: "Pages", description: "Static content pages." },
    { href: "/admin/cms/posts", label: "News", description: "News articles for the public site." },
    { href: "/admin/cms/events", label: "Events", description: "Upcoming institutional events." },
    { href: "/admin/cms/galleries", label: "Gallery", description: "Photo albums." },
    { href: "/admin/cms/downloads", label: "Downloads", description: "Forms and official documents." },
    { href: "/admin/cms/faqs", label: "FAQs", description: "Frequently asked questions." },
  ];

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">CMS</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="rounded-lg border border-border bg-white p-5 hover:border-sky-dark">
            <p className="font-medium text-ink">{s.label}</p>
            <p className="mt-1 text-sm text-muted">{s.description}</p>
          </Link>
        ))}
      </div>
    </Container>
  );
}
