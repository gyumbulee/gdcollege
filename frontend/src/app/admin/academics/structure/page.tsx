import { redirect } from "next/navigation";
import { requireSession, can } from "@/lib/auth/session";
import { getSchools, getDepartments, getProgrammes } from "@/lib/api/academics";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { AcademicEntityForm } from "@/components/academics/AcademicEntityForm";
import { CmsActionButton } from "@/components/cms/CmsActionButton";

export default async function AdminAcademicStructurePage() {
  const session = await requireSession("/admin/academics/structure");
  if (!can(session, "academic_structure.manage")) redirect("/admin/academics");

  const [schoolsResult, departmentsResult, programmesResult] = await Promise.all([
    getSchools(),
    getDepartments(),
    getProgrammes(),
  ]);

  return (
    <Container className="flex flex-col gap-10 py-12">
      <div>
        <p className="text-sm text-muted">System Administration · Academic Structure</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Schools, Departments &amp; Programmes</h1>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="font-medium text-ink">Schools</h2>
        <AcademicEntityForm
          resource="schools"
          title="New school"
          fields={[
            { name: "name", label: "Name", type: "text", required: true },
            { name: "slug", label: "Slug (URL-friendly, unique)", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
        {!schoolsResult.ok ? (
          <EmptyState title="Could not load schools" description="Please try again shortly." />
        ) : schoolsResult.items.length === 0 ? (
          <EmptyState title="No schools yet" description="Create the first one above." />
        ) : (
          <div className="flex flex-col gap-2">
            {schoolsResult.items.map((school) => (
              <div key={school.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
                <p className="text-sm text-ink">{school.name} <span className="text-muted">/{school.slug}</span></p>
                <CmsActionButton href={`/api/admin/academics/schools/${school.id}`} method="DELETE" label="Delete" confirmMessage="Delete this school?" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="font-medium text-ink">Departments</h2>
        <AcademicEntityForm
          resource="departments"
          title="New department"
          fields={[
            { name: "school_id", label: "School", type: "select", required: true, options: schoolsResult.items.map((s) => ({ value: s.id, label: s.name })) },
            { name: "name", label: "Name", type: "text", required: true },
            { name: "slug", label: "Slug (URL-friendly, unique)", type: "text", required: true },
            { name: "description", label: "Description", type: "textarea" },
          ]}
        />
        {!departmentsResult.ok ? (
          <EmptyState title="Could not load departments" description="Please try again shortly." />
        ) : departmentsResult.items.length === 0 ? (
          <EmptyState title="No departments yet" description="Create the first one above." />
        ) : (
          <div className="flex flex-col gap-2">
            {departmentsResult.items.map((department) => (
              <div key={department.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
                <p className="text-sm text-ink">{department.name} <span className="text-muted">/{department.slug} · {department.school?.name}</span></p>
                <CmsActionButton href={`/api/admin/academics/departments/${department.id}`} method="DELETE" label="Delete" confirmMessage="Delete this department?" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4 border-t border-border pt-8">
        <h2 className="font-medium text-ink">Programmes</h2>
        <AcademicEntityForm
          resource="programmes"
          title="New programme"
          defaults={{ is_active: true }}
          fields={[
            { name: "department_id", label: "Department", type: "select", required: true, options: departmentsResult.items.map((d) => ({ value: d.id, label: d.name })) },
            { name: "name", label: "Name", type: "text", required: true },
            { name: "slug", label: "Slug (URL-friendly, unique)", type: "text", required: true },
            { name: "award_type", label: "Award type (e.g. ND)", type: "text", required: true },
            { name: "duration_levels", label: "Duration (levels)", type: "number", required: true },
            { name: "description", label: "Description", type: "textarea" },
            { name: "is_active", label: "Active", type: "checkbox" },
          ]}
        />
        {!programmesResult.ok ? (
          <EmptyState title="Could not load programmes" description="Please try again shortly." />
        ) : programmesResult.items.length === 0 ? (
          <EmptyState title="No programmes yet" description="Create the first one above." />
        ) : (
          <div className="flex flex-col gap-2">
            {programmesResult.items.map((programme) => (
              <div key={programme.id} className="flex items-center justify-between rounded-lg border border-border bg-white p-3">
                <p className="text-sm text-ink">{programme.name} <span className="text-muted">/{programme.slug} · {programme.department?.name}</span></p>
                <CmsActionButton href={`/api/admin/academics/programmes/${programme.id}`} method="DELETE" label="Delete" confirmMessage="Delete this programme?" />
              </div>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
