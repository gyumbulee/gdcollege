import "server-only";
import { apiFetch } from "./client";
import type { Paginated } from "./hod";

export type SiwesRecord = {
  id: number;
  organization_name: string;
  organization_address: string | null;
  supervisor_name: string | null;
  supervisor_phone: string | null;
  supervisor_email: string | null;
  start_date: string;
  end_date: string;
  status: string;
  assessment_score: number | null;
  assessment_remark: string | null;
  assessed_at: string | null;
  student?: { id: number; matric_number: string | null; name: string | null } | null;
};

export function getMySiwesRecords(token: string) {
  return apiFetch<SiwesRecord[]>("/student/siwes", { token });
}

export function submitSiwesRecord(
  token: string,
  data: {
    organization_name: string;
    organization_address?: string;
    supervisor_name?: string;
    supervisor_phone?: string;
    supervisor_email?: string;
    start_date: string;
    end_date: string;
  }
) {
  return apiFetch<SiwesRecord>("/student/siwes", { method: "POST", token, body: JSON.stringify(data) });
}

export function getSiwesRecords(token: string, page = 1, status?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  return apiFetch<Paginated<SiwesRecord>>(`/siwes?${params}`, { token });
}

export function updateSiwesStatus(token: string, id: number, status: string) {
  return apiFetch<SiwesRecord>(`/siwes/${id}/status`, { method: "POST", token, body: JSON.stringify({ status }) });
}

export function assessSiwesRecord(token: string, id: number, score: number, remark?: string) {
  return apiFetch<SiwesRecord>(`/siwes/${id}/assess`, {
    method: "POST",
    token,
    body: JSON.stringify({ assessment_score: score, assessment_remark: remark }),
  });
}
