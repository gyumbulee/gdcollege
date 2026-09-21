import "server-only";
import { apiFetch } from "./client";

export type AdminAcademicSession = {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  admissions_open_at: string | null;
  admissions_close_at: string | null;
};
export type AdminSemester = { id: number; academic_session_id: number; name: string; sort_order: number; is_current: boolean };
export type AdminLevel = { id: number; name: string; sort_order: number };
export type AdminCourseType = { id: number; name: string };
export type AdminCourse = { id: number; code: string; title: string; credit_units: number; course_type_id: number | null; description: string | null };
export type AdminCourseOffering = {
  id: number;
  course_id: number;
  academic_session_id: number;
  semester_id: number;
  programme_id: number;
  level_id: number;
  lecturer_id: number | null;
  capacity: number | null;
  course?: { id: number; code: string; title: string };
};

export function getAdminSessions(token: string) {
  return apiFetch<AdminAcademicSession[]>("/academic-sessions", { token });
}
export function getAdminSemesters(token: string) {
  return apiFetch<AdminSemester[]>("/semesters", { token });
}
export function getAdminLevels(token: string) {
  return apiFetch<AdminLevel[]>("/levels", { token });
}
export function getAdminCourseTypes(token: string) {
  return apiFetch<AdminCourseType[]>("/course-types", { token });
}
export function getAdminCourses(token: string) {
  return apiFetch<{ items: AdminCourse[]; pagination: unknown }>("/courses", { token });
}
export function getAdminCourseOfferings(token: string) {
  return apiFetch<AdminCourseOffering[]>("/course-offerings", { token });
}
