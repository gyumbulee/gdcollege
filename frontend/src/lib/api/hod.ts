import "server-only";
import { apiFetch } from "./client";

/**
 * Matches ApiResponse::normalizeData()'s pagination shape (backend Phase
 * 9 bugfix) — every paginated HOD endpoint returns { items, pagination }
 * instead of a bare array, so callers always know current/last page.
 */
export type Paginated<T> = {
  items: T[];
  pagination: {
    current_page: number;
    per_page: number;
    has_more_pages: boolean;
    total: number | null;
    last_page: number | null;
  };
};

export type HodDashboard = {
  department: { id: number; name: string; school: string | null };
  students: number;
  staff: number;
  pending_registrations: number;
  pending_results: number;
};

export type HodStudent = {
  id: number;
  matric_number: string | null;
  status: string;
  user?: { name: string; email: string; phone: string | null };
  programme?: {
    id: number;
    name: string;
    department: {
      id: number;
      name: string;
      school: { id: number; name: string } | null;
    } | null;
  } | null;
  current_level?: { id: number; name: string } | null;
};

export type HodStaffMember = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  course_offerings_count: number;
};

export type HodProgramme = {
  id: number;
  name: string;
  award_type: string;
  duration_levels: number;
  is_active: boolean;
};

export type HodCourseOffering = {
  id: number;
  capacity: number | null;
  course: { id: number; code: string; title: string; credit_units: number };
  level: { id: number; name: string };
  programme: { id: number; name: string };
  semester: { id: number; name: string };
  academic_session: { id: number; name: string };
  lecturer: { id: number; name: string } | null;
};

export type HodReport = {
  department: { id: number; name: string };
  students_by_status: Record<string, number>;
  registrations_by_status: Record<string, number>;
  results_by_status: Record<string, number>;
};

/** Shape of StaffCourseRegistrationController's index()/approve()/reject() (via CourseRegistrationResource). */
export type HodPendingRegistration = {
  id: number;
  status: string;
  rejection_reason: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  academic_session?: { id: number; name: string } | null;
  semester?: { id: number; name: string } | null;
  student?: { id: number; matric_number: string | null; name: string | null } | null;
  items?: {
    id: number;
    is_carryover: boolean;
    course_offering_id: number;
    course: { code: string; title: string; credit_units: number } | null;
    level: string | null;
  }[];
  total_credit_units?: number;
};

/** Shape of StaffResultReviewController's index()/review() (via ResultResource). */
export type HodPendingResult = {
  id: number;
  status: string;
  component_scores: Record<string, number> | null;
  total_score: number | null;
  grade: string | null;
  grade_point: number | null;
  submitted_at: string | null;
  published_at: string | null;
  student?: { id: number; matric_number: string | null; name: string | null } | null;
  course_offering?: { id: number; course: { code: string; title: string } | null } | null;
};

export function getHodDashboard(token: string) {
  return apiFetch<HodDashboard>("/hod/dashboard", { token });
}

export function getHodStudents(token: string, page = 1, status?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  return apiFetch<Paginated<HodStudent>>(`/hod/students?${params}`, { token });
}

export function getHodStaff(token: string) {
  return apiFetch<HodStaffMember[]>("/hod/staff", { token });
}

export function getHodProgrammes(token: string) {
  return apiFetch<HodProgramme[]>("/hod/programmes", { token });
}

export function getHodCourseOfferings(token: string, page = 1) {
  return apiFetch<Paginated<HodCourseOffering>>(`/hod/course-offerings?page=${page}`, { token });
}

export function getHodReports(token: string) {
  return apiFetch<HodReport>("/hod/reports", { token });
}

/**
 * These four hit the existing (Phase 7/8) staff endpoints directly, now
 * department-scoped by CourseRegistrationPolicy/ResultPolicy (Phase 9's
 * gap closure) — an HOD only ever sees/acts on their own department's
 * SUBMITTED items through them, even though the URL itself is
 * institution-wide.
 */
export function getHodPendingRegistrations(token: string, page = 1) {
  return apiFetch<Paginated<HodPendingRegistration>>(
    `/staff/course-registrations?status=SUBMITTED&page=${page}`,
    { token }
  );
}

export function approveRegistration(token: string, id: number) {
  return apiFetch<HodPendingRegistration>(`/staff/course-registrations/${id}/approve`, {
    method: "POST",
    token,
  });
}

export function rejectRegistration(token: string, id: number, reason: string) {
  return apiFetch<HodPendingRegistration>(`/staff/course-registrations/${id}/reject`, {
    method: "POST",
    token,
    body: JSON.stringify({ reason }),
  });
}

export function getHodPendingResults(token: string, page = 1) {
  return apiFetch<Paginated<HodPendingResult>>(`/staff/results?status=SUBMITTED&page=${page}`, {
    token,
  });
}

export function reviewResult(token: string, id: number) {
  return apiFetch<HodPendingResult>(`/staff/results/${id}/review`, { method: "POST", token });
}
