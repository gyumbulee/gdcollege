import "server-only";
import { apiFetch } from "./client";
import type { LecturerOffering, Result, RosterStudent } from "@/types/results";

// --- Lecturer side ---

export async function listLecturerCourses(token: string) {
  return apiFetch<LecturerOffering[]>("/lecturer/courses", { token });
}

export async function getRoster(token: string, offeringId: number) {
  return apiFetch<RosterStudent[]>(`/lecturer/courses/${offeringId}/roster`, { token });
}

export async function listLecturerResults(token: string, offeringId: number) {
  return apiFetch<Result[]>(`/lecturer/courses/${offeringId}/results`, { token });
}

export async function upsertResults(
  token: string,
  offeringId: number,
  scores: { student_id: number; component_scores: Record<string, number> }[]
) {
  return apiFetch<Result[]>(`/lecturer/courses/${offeringId}/results`, {
    method: "PUT",
    token,
    body: JSON.stringify({ scores }),
  });
}

export async function submitResults(token: string, offeringId: number) {
  return apiFetch<Result[]>(`/lecturer/courses/${offeringId}/results/submit`, { method: "POST", token });
}

// --- Staff review side ---

export async function listStaffResults(token: string, status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<{ data: Result[] }>(`/staff/results${query}`, { token });
}

export async function transitionResult(
  token: string,
  resultId: number,
  action: "review" | "verify" | "approve" | "publish"
) {
  return apiFetch<Result>(`/staff/results/${resultId}/${action}`, { method: "POST", token });
}

// --- Shared config ---

export async function listResultComponents(token: string) {
  return apiFetch<{ id: number; name: string; max_score: number; sort_order: number }[]>(
    "/result-components",
    { token }
  );
}

// --- Student side ---

export async function listMyResults(token: string) {
  return apiFetch<Result[]>("/student/results", { token });
}
