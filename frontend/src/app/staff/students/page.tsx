import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getSession,
  getSessionToken,
  can,
} from "@/lib/auth/session";
import { listStudents } from "@/lib/api/students";
import type { Student } from "@/types/students";
import { StudentSearchForm } from "@/components/students/StudentSearchForm";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted"> = {
  ACTIVE: "sky",
  DEFERRED: "amber",
  SUSPENDED: "amber",
  WITHDRAWN: "muted",
  EXPELLED: "muted",
  GRADUATED: "sky",
};

export default async function StaffStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const session = await getSession();

  if (!session || !can(session, "students.view")) {
    return (
      <Container className="py-16">
        <EmptyState
          title="You don't have access to this page"
          description="This area is for Registry and other student-records staff."
        />
      </Container>
    );
  }

  const token = await getSessionToken();

  if (!token) {
    return (
      <Container className="py-16">
        <EmptyState
          title="Your session has expired"
          description="Please sign in again to access student records."
        />
      </Container>
    );
  }

  const { body } = await listStudents(token, q);

  const students: Student[] =
    body.success && Array.isArray(body.data.items)
      ? body.data.items
      : [];

  return (
    <Container className="py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
        Students
      </h1>

      <p className="mt-1 text-sm text-muted">
        Search by name, matric number, email, or phone.
      </p>

      <div className="mt-6">
        <StudentSearchForm initialQuery={q ?? ""} />
      </div>

      <div className="mt-8">
        {students.length === 0 ? (
          <EmptyState
            title="No students found"
            description="Try a different search, or check back once admissions have been converted."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-white">
            {students.map((student) => (
              <li key={student.id}>
                <Link
                  href={`/staff/students/${student.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-surface"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {student.user.name}
                    </p>

                    <p className="text-xs text-muted">
                      {student.matric_number} ·{" "}
                      {student.programme?.name ?? "No programme"} ·{" "}
                      {student.current_level?.name ?? "—"}
                    </p>
                  </div>

                  <Badge tone={STATUS_TONE[student.status] ?? "muted"}>
                    {student.status}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}