import { redirect } from "next/navigation";
import { requireSession, getSessionToken } from "@/lib/auth/session";
import { getMySiwesRecords } from "@/lib/api/siwes";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SubmitSiwesForm } from "@/components/services/SubmitSiwesForm";

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  PENDING: "amber",
  ACTIVE: "sky",
  COMPLETED: "success",
  TERMINATED: "danger",
};

export default async function StudentSiwesPage() {
  const session = await requireSession("/student/siwes");
  if (!session.roles.includes("student")) {
    redirect("/portal");
  }

  const token = await getSessionToken();
  const { body } = await getMySiwesRecords(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Student Portal</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">My SIWES</h1>
      </div>

      <SubmitSiwesForm />

      {!body.success ? (
        <EmptyState title="Could not load your SIWES records" description={body.message} />
      ) : body.data.length === 0 ? (
        <EmptyState title="No placement submitted yet" description="Submit your SIWES placement details above." />
      ) : (
        <div className="flex flex-col gap-4">
          {body.data.map((record) => (
            <div key={record.id} className="rounded-lg border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">{record.organization_name}</p>
                  {record.organization_address && (
                    <p className="text-sm text-muted">{record.organization_address}</p>
                  )}
                </div>
                <Badge tone={STATUS_TONE[record.status] ?? "muted"}>{record.status}</Badge>
              </div>

              <dl className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted">Period</dt>
                  <dd className="text-ink">
                    {record.start_date} – {record.end_date}
                  </dd>
                </div>
                {record.supervisor_name && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Supervisor</dt>
                    <dd className="text-ink">{record.supervisor_name}</dd>
                  </div>
                )}
                {record.assessment_score !== null && (
                  <div className="flex justify-between">
                    <dt className="text-muted">Assessment</dt>
                    <dd className="text-ink">
                      {record.assessment_score}/100
                      {record.assessment_remark && ` — ${record.assessment_remark}`}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
