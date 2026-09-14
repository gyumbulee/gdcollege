import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  getSession,
  getSessionToken,
  can,
} from "@/lib/auth/session";
import { listStaffRegistrations } from "@/lib/api/registration";
import type { CourseRegistration } from "@/types/registration";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted"> = {
  SUBMITTED: "amber",
  APPROVED: "sky",
  REJECTED: "muted",
  CLOSED: "muted",
};

export default async function StaffCourseRegistrationsPage() {
  const session = await getSession();

  if (!session || !can(session, "course_registrations.view")) {
    return (
      <Container className="py-16">
        <EmptyState
          title="You don't have access to this page"
          description="This area is for HOD/Academic Officer accounts."
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
          description="Please sign in again to access course registrations."
        />
      </Container>
    );
  }

  const { body } = await listStaffRegistrations(token);

  const registrations: CourseRegistration[] =
    body.success && Array.isArray(body.data.items)
      ? body.data.items
      : [];

  return (
    <Container className="py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
        Course Registrations
      </h1>

      <p className="mt-1 text-sm text-muted">
        Submitted registrations awaiting approval.
      </p>

      <div className="mt-8">
        {registrations.length === 0 ? (
          <EmptyState
            title="Nothing to review"
            description="Submitted registrations will appear here."
          />
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border bg-white">
            {registrations.map((registration) => (
              <li key={registration.id}>
                <Link
                  href={`/staff/course-registrations/${registration.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-surface"
                >
                  <div>
                    <p className="font-medium text-ink">
                      {registration.student?.name}
                    </p>

                    <p className="text-xs text-muted">
                      {registration.student?.matric_number} ·{" "}
                      {registration.academic_session?.name} ·{" "}
                      {registration.semester?.name} ·{" "}
                      {registration.total_credit_units} units
                    </p>
                  </div>

                  <Badge
                    tone={
                      STATUS_TONE[registration.status] ?? "muted"
                    }
                  >
                    {registration.status}
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