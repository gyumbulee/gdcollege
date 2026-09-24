import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminCourseOfferings, getAdminCourses, getAdminSessions, getAdminSemesters, getAdminLevels, getStaffDirectory } from "@/lib/api/admin-academics";
import { getProgrammes } from "@/lib/api/academics";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { AcademicEntityForm } from "@/components/academics/AcademicEntityForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminCourseOfferingsPage() {
  const session = await requireSession("/admin/academics/course-offerings");
  if (!can(session, "academic_structure.manage")) redirect("/admin/academics");

  const token = await getSessionToken();
  const [offeringsResult, coursesResult, sessionsResult, semestersResult, levelsResult, programmesResult, lecturersResult] = await Promise.all([
    getAdminCourseOfferings(token!),
    getAdminCourses(token!),
    getAdminSessions(token!),
    getAdminSemesters(token!),
    getAdminLevels(token!),
    getProgrammes(),
    getStaffDirectory(token!, "lecturer"),
  ]);

  const offerings = offeringsResult.body.success ? offeringsResult.body.data : [];
  const courses = coursesResult.body.success ? coursesResult.body.data.items : [];
  const sessions = sessionsResult.body.success ? sessionsResult.body.data : [];
  const semesters = semestersResult.body.success ? semestersResult.body.data : [];
  const levels = levelsResult.body.success ? levelsResult.body.data : [];
  const lecturers = lecturersResult.body.success ? lecturersResult.body.data : [];

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · Academic Structure</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Course Offerings</h1>
      </div>

      <AcademicEntityForm
        resource="course-offerings"
        title="New offering"
        fields={[
          { name: "course_id", label: "Course", type: "select", required: true, options: courses.map((c) => ({ value: c.id, label: `${c.code} — ${c.title}` })) },
          { name: "academic_session_id", label: "Session", type: "select", required: true, options: sessions.map((s) => ({ value: s.id, label: s.name })) },
          { name: "semester_id", label: "Semester", type: "select", required: true, options: semesters.map((s) => ({ value: s.id, label: s.name })) },
          { name: "programme_id", label: "Programme", type: "select", required: true, options: programmesResult.items.map((p) => ({ value: p.id, label: p.name })) },
          { name: "level_id", label: "Level", type: "select", required: true, options: levels.map((l) => ({ value: l.id, label: l.name })) },
          { name: "lecturer_id", label: "Lecturer (optional)", type: "select", options: lecturers.map((l) => ({ value: l.id, label: `${l.name} (${l.email})` })) },
          { name: "capacity", label: "Capacity (optional)", type: "number" },
        ]}
      />

      {offerings.length === 0 ? (
        <EmptyState title="No course offerings yet" description="Create the first one above." />
      ) : (
        <div className="flex flex-col gap-2">
          {offerings.map((offering) => (
            <div key={offering.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
              <p className="text-sm text-ink">
                {offering.course?.code ?? `Course #${offering.course_id}`} — {offering.course?.title}
              </p>
              <CmsActionButton href={`/api/admin/academics/course-offerings/${offering.id}`} method="DELETE" label="Delete" confirmMessage="Delete this offering?" />
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
