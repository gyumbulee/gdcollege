import { getSessionToken } from "@/lib/auth/session";
import { getHodPendingRegistrations } from "@/lib/api/hod";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { RegistrationActions } from "@/components/hod/RegistrationActions";

export default async function HodRegistrationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const token = await getSessionToken();
  const { body } = await getHodPendingRegistrations(token!, Number(page ?? 1));

  if (!body.success) {
    return <EmptyState title="Could not load registrations" description={body.message} />;
  }

  const { items, pagination } = body.data;

  if (items.length === 0) {
    return (
      <EmptyState
        title="Nothing pending"
        description="No SUBMITTED course registrations are waiting on your department right now."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Registrations submitted by students in your department, awaiting your review.
      </p>

      <div className="flex flex-col gap-4">
        {items.map((registration) => (
          <div key={registration.id} className="rounded-lg border border-border bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium text-ink">
                  {registration.student?.name ?? "Unknown student"}{" "}
                  <span className="font-normal text-muted">
                    ({registration.student?.matric_number ?? "no matric number"})
                  </span>
                </p>
                <p className="mt-0.5 text-sm text-muted">
                  {registration.academic_session?.name} · {registration.semester?.name} ·{" "}
                  {registration.total_credit_units ?? 0} credit units
                </p>
              </div>
              <RegistrationActions registrationId={registration.id} />
            </div>

            {registration.items && registration.items.length > 0 && (
              <ul className="mt-4 flex flex-col gap-1 border-t border-border pt-3 text-sm">
                {registration.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2">
                    <span className="text-ink">
                      {item.course?.code} — {item.course?.title}{" "}
                      <span className="text-muted">({item.course?.credit_units} units)</span>
                    </span>
                    {item.is_carryover && <Badge tone="amber">Carryover</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {pagination.last_page && pagination.last_page > 1 && (
        <p className="text-center text-sm text-muted">
          Page {pagination.current_page} of {pagination.last_page}
        </p>
      )}
    </div>
  );
}
