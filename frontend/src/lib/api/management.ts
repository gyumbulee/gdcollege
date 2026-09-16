import "server-only";
import { apiFetch } from "./client";

export type ManagementFilters = {
  academic_session_id?: string;
  school_id?: string;
  department_id?: string;
  programme_id?: string;
  level_id?: string;
};

export type ManagementDashboard = {
  filters_applied: Record<string, number | null>;
  students: {
    total: number;
    active: number;
    by_status: Record<string, number>;
    by_level: Record<string, number>;
    by_programme: { programme_id: number; programme: string; total: number }[];
    by_school: { school_id: number; school: string; total: number }[];
  };
  admissions: {
    total_applicants: number;
    total_applications: number;
    by_status: Record<string, number>;
    by_decision: Record<string, number>;
    admissions_trend_by_session: Record<string, number>;
  };
  staff: {
    total_active_staff: number;
    lecturers_in_scope: number;
  };
  finance: {
    total_invoiced: number;
    total_collected: number;
    total_outstanding: number;
    revenue_trend_last_6_months: { month: string; amount: number }[];
  };
  academic_performance: {
    average_cgpa: number | null;
    students_with_published_results: number;
    grade_distribution: Record<string, number>;
  };
  graduation: {
    total_graduated: number;
  };
};

/** Builds the `?academic_session_id=...&school_id=...` query string, omitting unset filters. */
export function buildManagementQuery(filters: ManagementFilters): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  return params.toString();
}

export function getManagementDashboard(token: string, filters: ManagementFilters) {
  const qs = buildManagementQuery(filters);
  return apiFetch<ManagementDashboard>(`/management/dashboard${qs ? `?${qs}` : ""}`, { token });
}
