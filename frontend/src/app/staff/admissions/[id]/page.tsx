import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession, getSessionToken, can } from "@/lib/auth/session";
import { getStaffApplication } from "@/lib/api/staffAdmissions";
import { DecisionPanel } from "@/components/admissions/DecisionPanel";

export default async function StaffApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || !can(session, "applications.view")) {
    return (
      <Container className="py-16">
        <EmptyState title="You don't have access to this page" description="Sign in with an admissions-review staff account." />
      </Container>
    );
  }

  const token = await getSessionToken();
  const { body } = await getStaffApplication(token!, Number(id));

  if (!body.success) {
    return (
      <Container className="py-16">
        <EmptyState title="Application not found" description="It may have been removed, or you may not have access." />
      </Container>
    );
  }

  const application = body.data;

  return (
    <Container className="py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{application.application_number}</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
            {application.applicant.user.name}
          </h1>
        </div>
        <Badge tone="sky">{application.status}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-sm font-medium text-ink">Personal information</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Field label="Email" value={application.applicant.user.email} />
              <Field label="Phone" value={application.applicant.user.phone} />
              <Field label="Date of birth" value={application.applicant.date_of_birth} />
              <Field label="Gender" value={application.applicant.gender} />
              <Field label="Address" value={application.applicant.address} />
              <Field label="Programme" value={application.programme?.name ?? null} />
              <Field label="Next of kin" value={application.applicant.next_of_kin_name} />
              <Field label="Next of kin phone" value={application.applicant.next_of_kin_phone} />
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-sm font-medium text-ink">Educational history</h2>
            {application.education_records.length === 0 ? (
              <p className="mt-2 text-sm text-muted">None recorded.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {application.education_records.map((r, i) => (
                  <li key={i} className="text-sm">
                    <p className="text-ink">{r.exam_body} — {r.exam_year}</p>
                    <p className="text-muted">
                      {r.subjects.map((s) => `${s.subject}: ${s.grade}`).join(", ")}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-sm font-medium text-ink">Documents</h2>
            {application.documents.length === 0 ? (
              <p className="mt-2 text-sm text-muted">None uploaded.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm text-ink">
                {application.documents.map((d) => (
                  <li key={d.id}>{d.original_filename} <span className="text-muted">({d.document_type})</span></li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <DecisionPanel application={application} canDecide={can(session, "applications.admit")} />
      </div>
    </Container>
  );
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-ink">{value ?? "—"}</dd>
    </div>
  );
}
