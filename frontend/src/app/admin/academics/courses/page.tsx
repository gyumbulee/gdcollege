import { redirect } from "next/navigation";
import { requireSession, can, getSessionToken } from "@/lib/auth/session";
import { getAdminCourses, getAdminCourseTypes } from "@/lib/api/admin-academics";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { AcademicEntityForm } from "@/components/academics/AcademicEntityForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminCoursesPage() {
  const session = await requireSession("/admin/academics/courses");
  const canCreate = can(session, "courses.create");
  const canManageAny = canCreate || can(session, "courses.update") || can(session, "academic_structure.manage");
  if (!canManageAny) redirect("/admin/academics");

  const token = await getSessionToken();
  const [coursesResult, courseTypesResult] = await Promise.all([
    getAdminCourses(token!),
    getAdminCourseTypes(token!),
  ]);

  const courseTypes = courseTypesResult.body.success ? courseTypesResult.body.data : [];

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · Academic Structure</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Courses</h1>
      </div>

      {canCreate && (
        <AcademicEntityForm
          resource="courses"
          title="New course"
          fields={[
            { name: "code", label: "Code (e.g. CSC201)", type: "text", required: true },
            { name: "title", label: "Title", type: "text", required: true },
            { name: "credit_units", label: "Credit units", type: "number", required: true },
            { name: "course_type_id", label: "Course type", type: "select", options: courseTypes.map((c) => ({ value: c.id, label: c.name })) },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
      )}

      {!coursesResult.body.success ? (
        <EmptyState title="Could not load courses" description={coursesResult.body.message} />
      ) : coursesResult.body.data.items.length === 0 ? (
        <EmptyState title="No courses yet" description={canCreate ? "Create the first one above." : "None have been added yet."} />
      ) : (
        <div className="flex flex-col gap-2">
          {coursesResult.body.data.items.map((course) => (
            <div key={course.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
              <p className="text-sm text-ink">
                <span className="font-medium">{course.code}</span> — {course.title}
                <span className="text-muted"> · {course.credit_units} unit{course.credit_units === 1 ? "" : "s"}</span>
              </p>
              {can(session, "courses.update") && (
                <CmsActionButton href={`/api/admin/academics/courses/${course.id}`} method="DELETE" label="Delete" confirmMessage="Delete this course?" />
              )}
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
