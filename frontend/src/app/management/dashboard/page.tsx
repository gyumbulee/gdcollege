import { getSessionToken } from "@/lib/auth/session";
import { getManagementDashboard, buildManagementQuery } from "@/lib/api/management";
import { getSchools, getDepartments, getProgrammes } from "@/lib/api/academics";
import { getAcademicSessionOptions, getLevelOptions } from "@/lib/api/finance";
import { EmptyState } from "@/components/ui/EmptyState";
import { ManagementFilterForm } from "@/components/management/ManagementFilterForm";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function BreakdownCard({ title, counts }: { title: string; counts: Record<string, number> }) {
  const entries = Object.entries(counts ?? {});
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">{title}</p>
      {entries.length === 0 ? (
        <p className="mt-2 text-sm text-muted">No records yet.</p>
      ) : (
        <dl className="mt-3 flex flex-col gap-2">
          {entries.map(([key, count]) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <dt className="text-muted">{key.replace(/_/g, " ")}</dt>
              <dd className="font-medium text-ink">{count}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

export default async function ManagementDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{
    academic_session_id?: string;
    school_id?: string;
    department_id?: string;
    programme_id?: string;
    level_id?: string;
  }>;
}) {
  const filters = await searchParams;
  const token = await getSessionToken();

  if (!token) {
    return <EmptyState title="Your session has expired" description="Please sign in again to view the dashboard." />;
  }

  const [{ body }, sessionsRes, schoolsRes, departmentsRes, programmesRes, levelsRes] = await Promise.all([
    getManagementDashboard(token, filters),
    getAcademicSessionOptions(token),
    getSchools(),
    getDepartments(),
    getProgrammes(),
    getLevelOptions(token),
  ]);

  const sessions = sessionsRes.body.success ? sessionsRes.body.data : [];
  const levels = levelsRes.body.success ? levelsRes.body.data : [];
  const schools = schoolsRes.items.map((s) => ({ id: s.id, name: s.name }));
  const departments = departmentsRes.items.map((d) => ({ id: d.id, name: d.name }));
  const programmes = programmesRes.items.map((p) => ({ id: p.id, name: p.name }));

  const exportQs = buildManagementQuery(filters);

  return (
    <div className="flex flex-col gap-6">
      <ManagementFilterForm
        initial={filters}
        sessions={sessions}
        schools={schools}
        departments={departments}
        programmes={programmes}
        levels={levels}
      />

      {!body.success ? (
        <EmptyState title="Could not load the dashboard" description={body.message} />
      ) : (
        <>
          <div className="flex justify-end">
            <a
              href={`/api/management/students-export${exportQs ? `?${exportQs}` : ""}`}
              className="rounded-md border border-border bg-white px-4 py-2 text-sm text-ink hover:border-sky-dark"
            >
              Export filtered students (CSV)
            </a>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Total students" value={body.data.students.total.toLocaleString()} hint={`${body.data.students.active.toLocaleString()} active`} />
            <StatCard label="Applicants" value={body.data.admissions.total_applicants.toLocaleString()} hint={`${body.data.admissions.total_applications.toLocaleString()} applications`} />
            <StatCard label="Active staff" value={body.data.staff.total_active_staff.toLocaleString()} hint={`${body.data.staff.lecturers_in_scope.toLocaleString()} lecturers in scope`} />
            <StatCard label="Graduated" value={body.data.graduation.total_graduated.toLocaleString()} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label="Total invoiced" value={`₦${body.data.finance.total_invoiced.toLocaleString()}`} />
            <StatCard label="Total collected" value={`₦${body.data.finance.total_collected.toLocaleString()}`} />
            <StatCard label="Total outstanding" value={`₦${body.data.finance.total_outstanding.toLocaleString()}`} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              label="Average CGPA"
              value={body.data.academic_performance.average_cgpa !== null ? body.data.academic_performance.average_cgpa.toFixed(2) : "—"}
              hint={
                body.data.academic_performance.students_with_published_results > 0
                  ? `Across ${body.data.academic_performance.students_with_published_results.toLocaleString()} students with published results`
                  : "No published results in scope yet"
              }
            />
            <div className="rounded-lg border border-border bg-white p-5">
              <p className="font-medium text-ink">Revenue — last 6 months</p>
              {body.data.finance.revenue_trend_last_6_months.length === 0 ? (
                <p className="mt-2 text-sm text-muted">No collected payments in this window yet.</p>
              ) : (
                <dl className="mt-3 flex flex-col gap-2">
                  {body.data.finance.revenue_trend_last_6_months.map((row) => (
                    <div key={row.month} className="flex items-center justify-between text-sm">
                      <dt className="text-muted">{row.month}</dt>
                      <dd className="font-medium text-ink">₦{row.amount.toLocaleString()}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <BreakdownCard title="Students by status" counts={body.data.students.by_status} />
            <BreakdownCard title="Students by level" counts={body.data.students.by_level} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <BreakdownCard
              title="Students by school"
              counts={Object.fromEntries(body.data.students.by_school.map((r) => [r.school, r.total]))}
            />
            <BreakdownCard
              title="Students by programme"
              counts={Object.fromEntries(body.data.students.by_programme.map((r) => [r.programme, r.total]))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <BreakdownCard title="Applications by status" counts={body.data.admissions.by_status} />
            <BreakdownCard title="Admission decisions" counts={body.data.admissions.by_decision} />
          </div>

          <BreakdownCard title="Applications by session" counts={body.data.admissions.admissions_trend_by_session} />

          <BreakdownCard title="Graduation trend (by month)" counts={body.data.graduation.trend} />
        </>
      )}
    </div>
  );
}
