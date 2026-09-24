import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession, getSessionToken, can } from "@/lib/auth/session";
import { getStudent } from "@/lib/api/students";
import { getProgrammes } from "@/lib/api/academics";
import { apiFetch } from "@/lib/api/client";
import { StudentActionsPanel } from "@/components/students/StudentActionsPanel";

type SessionOption = { id: number; name: string };
type LevelOption = { id: number; name: string };

export default async function StaffStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  if (!session || !can(session, "students.view")) {
    return (
      <Container className="py-16">
        <EmptyState title="You don't have access to this page" description="Sign in with a Registry account." />
      </Container>
    );
  }

  const token = await getSessionToken();
  const [{ body }, { items: programmes }, sessionsRes, levelsRes] = await Promise.all([
    getStudent(token!, Number(id)),
    getProgrammes(),
    apiFetch<SessionOption[]>("/academic-sessions", { token: token! }),
    apiFetch<LevelOption[]>("/levels", { token: token! }),
  ]);

  if (!body.success) {
    return (
      <Container className="py-16">
        <EmptyState title="Student not found" description="It may have been removed, or you may not have access." />
      </Container>
    );
  }

  const student = body.data;
  const sessions = sessionsRes.body.success ? sessionsRes.body.data : [];
  const levels = levelsRes.body.success ? levelsRes.body.data : [];

  return (
    <Container className="py-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm text-muted">{student.matric_number}</p>
          <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">{student.user.name}</h1>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone="sky">{student.status}</Badge>
          {student.status === "GRADUATED" && student.graduated_at && (
            <span className="text-xs text-muted">
              {new Date(student.graduated_at).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-sm font-medium text-ink">Profile</h2>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <Field label="Email" value={student.user.email} />
              <Field label="Phone" value={student.user.phone} />
              <Field label="Programme" value={student.programme?.name ?? null} />
              <Field label="Department" value={student.programme?.department?.name ?? null} />
              <Field label="School" value={student.programme?.department?.school?.name ?? null} />
              <Field label="Current level" value={student.current_level?.name ?? null} />
              <Field label="Admission session" value={student.admission_session?.name ?? null} />
            </dl>
          </section>

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-sm font-medium text-ink">Enrolment history</h2>
            {!student.enrolments || student.enrolments.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No enrolments recorded yet.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm text-ink">
                {student.enrolments.map((e) => (
                  <li key={e.id}>
                    {e.academic_session} — {e.level} ({e.programme}) <span className="text-muted">· {e.status}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-lg border border-border bg-white p-5">
            <h2 className="text-sm font-medium text-ink">Programme history</h2>
            {!student.programme_histories || student.programme_histories.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No programme transfers recorded.</p>
            ) : (
              <ul className="mt-3 space-y-1 text-sm text-ink">
                {student.programme_histories.map((h) => (
                  <li key={h.id}>
                    {h.from_programme ?? "—"} → {h.to_programme}
                    {h.reason ? <span className="text-muted"> ({h.reason})</span> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <StudentActionsPanel
          student={student}
          programmes={programmes}
          sessions={sessions}
          levels={levels}
          canUpdate={can(session, "students.update")}
          canChangeStatus={can(session, "students.status.change")}
        />
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
