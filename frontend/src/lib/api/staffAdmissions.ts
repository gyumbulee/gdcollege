import "server-only";
import { apiFetch } from "./client";
import type { Application } from "@/types/admissions";

export async function listStaffApplications(
  token: string,
  status?: string
) {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<{ data: Application[] }>(`/admissions/applications${query}`, { token });
}

export async function getStaffApplication(token: string, id: number) {
  return apiFetch<Application>(`/admissions/applications/${id}`, { token });
}

export async function reviewApplication(token: string, id: number) {
  return apiFetch<Application>(`/admissions/applications/${id}/review`, { method: "POST", token });
}

export async function shortlistApplication(token: string, id: number) {
  return apiFetch<Application>(`/admissions/applications/${id}/shortlist`, { method: "POST", token });
}

export async function decideApplication(
  token: string,
  id: number,
  decision: "ADMIT" | "HOLD" | "REJECT",
  reason?: string
) {
  return apiFetch<Application>(`/admissions/applications/${id}/decision`, {
    method: "POST",
    token,
    body: JSON.stringify({ decision, decision_reason: reason }),
  });
}

export async function convertApplication(token: string, id: number) {
  return apiFetch<{ matric_number: string; student_id: number }>(
    `/admissions/applications/${id}/convert`,
    { method: "POST", token }
  );
}
