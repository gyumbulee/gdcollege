import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession, can } from "@/lib/auth/session";
import { Container } from "@/components/ui/Container";

export default async function AdminAcademicsLandingPage() {
  const session = await requireSession("/admin/academics");
  const allowed = can(session, "academic_structure.manage") || can(session, "courses.create") || can(session, "courses.update");
  if (!allowed) redirect("/admin");

  const sections = [
    { href: "/admin/academics/structure", label: "Schools, Departments & Programmes", description: "The institutional hierarchy." },
    { href: "/admin/academics/calendar", label: "Sessions, Semesters, Levels & Course Types", description: "Academic calendar and classification." },
    { href: "/admin/academics/courses", label: "Courses", description: "The course catalogue." },
    { href: "/admin/academics/course-offerings", label: "Course Offerings", description: "Courses offered in a specific session/semester/programme/level, with a lecturer assigned." },
  ];

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Academic Structure</h1>
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
