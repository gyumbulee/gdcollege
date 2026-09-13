import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession, getSessionToken, can } from "@/lib/auth/session";
import { getStaffRegistration } from "@/lib/api/registration";
import { RegistrationDecisionPanel } from "@/components/registration/RegistrationDecisionPanel";

export default async function StaffCourseRegistrationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || !can(session, "course_registrations.view")) {
    return (
      <Container className="py-16">
        <EmptyState title="You don't have access to this page" description="Sign in with an HOD/Academic Officer account." />
      </Container>
    );
  }

  const token = await getSessionToken();
  const { body } = await getStaffRegistration(token!, Number(id));

  if (!body.success) {
    return (
      <Container className="py-16">
        <EmptyState title="Registration not found" description="It may have been removed, or you may not have access." />
      </Container>
    );
  }

  const registration = body.data;

  return (
    <Container className="py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{registration.student?.matric_number}</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">{registration.student?.name}</h1>
          <p className="text-sm text-muted">{registration.academic_session?.name} — {registration.semester?.name}</p>
        </div>
        <Badge tone="sky">{registration.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="h-fit rounded-lg border border-border bg-white p-5">
          <h2 className="text-sm font-medium text-ink">Selected courses ({registration.total_credit_units} units)</h2>
          <ul className="mt-3 divide-y divide-border">
            {registration.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <p className="text-ink">{item.course?.code} — {item.course?.title}</p>
                  <p className="text-xs text-muted">{item.course?.credit_units} units · {item.level}</p>
                </div>
                {item.is_carryover && <Badge tone="amber">Carryover</Badge>}
              </li>
            ))}
          </ul>
        </section>

        <RegistrationDecisionPanel registration={registration} canDecide={can(session, "course_registrations.approve")} />
      </div>
    </Container>
  );
}
