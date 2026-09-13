import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession, getSessionToken, can } from "@/lib/auth/session";
import { listLecturerCourses } from "@/lib/api/results";

export default async function LecturerCoursesPage() {
  const session = await getSession();

  if (!session || !can(session, "results.view")) {
    return (
      <Container className="py-16">
        <EmptyState title="You don't have access to this page" description="Sign in with a lecturer account." />
      </Container>
    );
  }

  const token = await getSessionToken();
  const { body } = await listLecturerCourses(token!);
  const offerings = body.success ? body.data : [];

  return (
    <Container className="py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">My Courses</h1>
      <p className="mt-1 text-sm text-muted">Course offerings assigned to you this semester.</p>

      <div className="mt-8">
        {offerings.length === 0 ? (
          <EmptyState title="No assigned courses" description="Course offerings assigned to you will appear here." />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-white">
            {offerings.map((o) => (
              <li key={o.id}>
                <Link href={`/lecturer/courses/${o.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-surface">
                  <div>
                    <p className="font-medium text-ink">{o.course.code} — {o.course.title}</p>
                    <p className="text-xs text-muted">
                      {o.programme.name} · {o.level.name} · {o.semester.name} {o.academic_session.name}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
