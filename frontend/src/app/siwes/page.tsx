import { redirect } from "next/navigation";
import { requireSession, getSessionToken, can } from "@/lib/auth/session";
import { getSiwesRecords } from "@/lib/api/siwes";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SiwesStaffActions } from "@/components/services/SiwesStaffActions";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  PENDING: "amber",
  ACTIVE: "sky",
  COMPLETED: "success",
  TERMINATED: "danger",
};

export default async function StaffSiwesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireSession("/siwes");
  if (!can(session, "siwes.manage")) {
    redirect("/portal");
  }

  const { page } = await searchParams;
  const token = await getSessionToken();
  const { body } = await getSiwesRecords(token!, Number(page ?? 1));

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">SIWES Coordination</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
          SIWES Placements
        </h1>
      </div>

      {!body.success ? (
        <EmptyState title="Could not load placements" description={body.message} />
      ) : body.data.items.length === 0 ? (
        <EmptyState title="No placements yet" description="Student-submitted SIWES placements will appear here." />
      ) : (
        <div className="flex flex-col gap-4">
          {body.data.items.map((record) => (
            <div key={record.id} className="rounded-lg border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-ink">
                    {record.student?.name ?? "—"}{" "}
                    <span className="text-xs text-muted">{record.student?.matric_number}</span>
                  </p>
                  <p className="text-sm text-muted">{record.organization_name}</p>
                  <p className="text-xs text-muted">
                    {record.start_date} – {record.end_date}
                  </p>
                  {record.assessment_score !== null && (
                    <p className="mt-1 text-xs text-ink">
                      Assessment: {record.assessment_score}/100
                      {record.assessment_remark && ` — ${record.assessment_remark}`}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge tone={STATUS_TONE[record.status] ?? "muted"}>{record.status}</Badge>
                  <SiwesStaffActions recordId={record.id} status={record.status} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
