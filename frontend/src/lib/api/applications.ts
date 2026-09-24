import "server-only";
import { apiFetch } from "./client";
import type { Application, EducationRecord } from "@/types/admissions";

type Envelope<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string; errors: Record<string, string[]> };

export type AdmissionsStatus = {
  is_open: boolean;
  session_name: string | null;
  admissions_open_at: string | null;
  admissions_close_at: string | null;
};

/** Public — no token. Read before showing the "Start an Application" CTA so a closed window is a clear message, not a failed submit. */
export async function getAdmissionsStatus() {
  return apiFetch<AdmissionsStatus>("/admissions/status");
}

export type PublicAdmissionSession = {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  admissions_open_at: string | null;
  admissions_close_at: string | null;
  /** Computed server-side — see AcademicSession::publicAdmissionStatus(). */
  status: "open" | "scheduled" | "closed" | "upcoming" | "past";
  label: string;
};

/** Public — no token. Every admission cycle (past, current, upcoming) for the /admissions grid. */
export async function getPublicAdmissionSessions() {
  return apiFetch<PublicAdmissionSession[]>("/admissions/sessions");
}

export async function listApplications(token: string) {
  return apiFetch<Application[]>("/applications", { token });
}

export async function createApplication(token: string, programmeId?: number) {
  return apiFetch<Application>("/applications", {
    method: "POST",
    token,
    body: JSON.stringify({ programme_id: programmeId ?? null }),
  });
}

export async function getApplication(token: string, id: number) {
  return apiFetch<Application>(`/applications/${id}`, { token });
}

export async function updateApplication(
  token: string,
  id: number,
  data: Record<string, unknown>
) {
  return apiFetch<Application>(`/applications/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(data),
  });
}

export async function replaceEducationRecords(
  token: string,
  id: number,
  records: EducationRecord[]
) {
  return apiFetch<Application>(`/applications/${id}/education`, {
    method: "PUT",
    token,
    body: JSON.stringify({ records }),
  });
}

export async function submitApplication(token: string, id: number) {
  return apiFetch<Application>(`/applications/${id}/submit`, {
    method: "POST",
    token,
  });
}

export async function payApplicationFee(token: string, id: number, gateway?: string) {
  return apiFetch<{ payment: { id: number; reference: string; status: string }; authorization_url: string | null }>(
    `/applications/${id}/pay`,
    {
      method: "POST",
      token,
      body: JSON.stringify(gateway ? { gateway } : {}),
    }
  );
}

export async function checkApplicationPaymentStatus(token: string, paymentId: number) {
  return apiFetch<Application>(`/applications/payments/${paymentId}/status`, {
    method: "POST",
    token,
  });
}

const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";

/** Multipart upload — bypasses apiFetch since it forces JSON headers. */
export async function uploadDocument(
  token: string,
  applicationId: number,
  documentType: string,
  file: File
): Promise<{ status: number; body: Envelope<unknown> }> {
  const form = new FormData();
  form.append("document_type", documentType);
  form.append("file", file);

  const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/documents`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    body: form,
  });

  return { status: response.status, body: await response.json() };
}

export async function deleteDocument(token: string, applicationId: number, documentId: number) {
  return apiFetch(`/applications/${applicationId}/documents/${documentId}`, {
    method: "DELETE",
    token,
  });
}
