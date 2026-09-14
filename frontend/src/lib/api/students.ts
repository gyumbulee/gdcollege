import "server-only";
import { apiFetch } from "./client";
import type { Student } from "@/types/students";

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

export type StudentListData = {
  items: Student[];
  pagination: PaginationMeta;
};

export async function listStudents(token: string, search?: string) {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";

  return apiFetch<StudentListData>(`/students${query}`, {
    token,
  });
}

export async function getStudent(token: string, id: number) {
  return apiFetch<Student>(`/students/${id}`, {
    token,
  });
}

export async function updateStudentStatus(
  token: string,
  id: number,
  status: string,
  reason?: string
) {
  return apiFetch<Student>(`/students/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status, reason }),
  });
}

export async function enrolStudent(
  token: string,
  id: number,
  academicSessionId: number,
  levelId: number
) {
  return apiFetch<Student>(`/students/${id}/enrolments`, {
    method: "POST",
    token,
    body: JSON.stringify({
      academic_session_id: academicSessionId,
      level_id: levelId,
    }),
  });
}

export async function transferStudentProgramme(
  token: string,
  id: number,
  toProgrammeId: number,
  reason?: string
) {
  return apiFetch<Student>(`/students/${id}/transfer`, {
    method: "POST",
    token,
    body: JSON.stringify({
      to_programme_id: toProgrammeId,
      reason,
    }),
  });
}

export async function getMyStudentRecord(token: string) {
  return apiFetch<Student>("/student/me", {
    token,
  });
}