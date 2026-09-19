import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminSessions, getAdminSemesters, getAdminLevels, getAdminCourseTypes } from "@/lib/api/admin-academics";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { AcademicEntityForm } from "@/components/academics/AcademicEntityForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminAcademicCalendarPage() {
  const session = await requireSession("/admin/academics/calendar");
  if (!can(session, "academic_structure.manage")) redirect("/admin/academics");

  const token = await getSessionToken();
  const [sessionsResult, semestersResult, levelsResult, courseTypesResult] = await Promise.all([
    getAdminSessions(token!),
    getAdminSemesters(token!),
    getAdminLevels(token!),
    getAdminCourseTypes(token!),
  ]);

  const sessions = sessionsResult.body.success ? sessionsResult.body.data : [];
  const semesters = semestersResult.body.success ? semestersResult.body.data : [];
  const levels = levelsResult.body.success ? levelsResult.body.data : [];
  const courseTypes = courseTypesResult.body.success ? courseTypesResult.body.data : [];

  return (
    <Container className="flex flex-col gap-10 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · Academic Structure</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
          Sessions, Semesters, Levels &amp; Course Types
        </h1>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium text-ink">Academic Sessions</h2>
        <AcademicEntityForm
          resource="academic-sessions"
          title="New session"
          fields={[
            { name: "name", label: "Name (e.g. 2026/2027)", type: "text", required: true },
            { name: "start_date", label: "Start date", type: "date" },
            { name: "end_date", label: "End date", type: "date" },
            { name: "is_current", label: "Current session", type: "checkbox" },
          ]}
        />
        {sessions.length === 0 ? (
          <EmptyState title="No sessions yet" description="Create the first one above." />
        ) : (
          <div className="flex flex-col gap-2">
            {sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
                <p className="text-sm text-ink">{s.name}</p>
                <div className="flex items-center gap-2">
                  {s.is_current && <Badge tone="success">Current</Badge>}
                  <CmsActionButton href={`/api/admin/academics/academic-sessions/${s.id}`} method="DELETE" label="Delete" confirmMessage="Delete this session?" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="font-medium text-ink">Semesters</h2>
        <AcademicEntityForm
          resource="semesters"
          title="New semester"
          fields={[
            { name: "academic_session_id", label: "Session", type: "select", required: true, options: sessions.map((s) => ({ value: s.id, label: s.name })) },
            { name: "name", label: "Name (e.g. First Semester)", type: "text", required: true },
            { name: "sort_order", label: "Sort order", type: "number" },
            { name: "start_date", label: "Start date", type: "date" },
            { name: "end_date", label: "End date", type: "date" },
            { name: "is_current", label: "Current semester", type: "checkbox" },
          ]}
        />
        {semesters.length === 0 ? (
          <EmptyState title="No semesters yet" description="Create the first one above." />
        ) : (
          <div className="flex flex-col gap-2">
            {semesters.map((s) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
                <p className="text-sm text-ink">{s.name}</p>
                <div className="flex items-center gap-2">
                  {s.is_current && <Badge tone="success">Current</Badge>}
                  <CmsActionButton href={`/api/admin/academics/semesters/${s.id}`} method="DELETE" label="Delete" confirmMessage="Delete this semester?" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="font-medium text-ink">Levels</h2>
        <AcademicEntityForm
          resource="levels"
          title="New level"
          fields={[
            { name: "name", label: "Name (e.g. ND I)", type: "text", required: true },
            { name: "sort_order", label: "Sort order", type: "number" },
          ]}
        />
        {levels.length === 0 ? (
          <EmptyState title="No levels yet" description="Create the first one above." />
        ) : (
          <div className="flex flex-col gap-2">
            {levels.map((l) => (
              <div key={l.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
                <p className="text-sm text-ink">{l.name}</p>
                <CmsActionButton href={`/api/admin/academics/levels/${l.id}`} method="DELETE" label="Delete" confirmMessage="Delete this level?" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="font-medium text-ink">Course Types</h2>
        <AcademicEntityForm
          resource="course-types"
          title="New course type"
          fields={[{ name: "name", label: "Name", type: "text", required: true }]}
        />
        {courseTypes.length === 0 ? (
          <EmptyState title="No course types yet" description="Create the first one above." />
        ) : (
          <div className="flex flex-col gap-2">
            {courseTypes.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
                <p className="text-sm text-ink">{c.name}</p>
                <CmsActionButton href={`/api/admin/academics/course-types/${c.id}`} method="DELETE" label="Delete" confirmMessage="Delete this course type?" />
              </div>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
