import "server-only";
import { apiFetch } from "./client";
import type { Paginated } from "./hod";

export type IssuedDocument = {
  id: number;
  document_number: string;
  verification_code: string;
  type: string;
  status: string;
  issued_at: string;
  revoked_reason: string | null;
  content: Record<string, unknown>;
  student?: { id: number; matric_number: string | null; name: string | null } | null;
};

export type DocumentRequest = {
  id: number;
  type: string;
  status: string;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  processed_at: string | null;
  student?: { id: number; matric_number: string | null; name: string | null } | null;
  issued_document?: { id: number; document_number: string; verification_code: string } | null;
};

/* ------------------------------- Student ------------------------------- */

export function getMyDocuments(token: string) {
  return apiFetch<IssuedDocument[]>("/student/documents", { token });
}

export function getMyDocumentRequests(token: string) {
  return apiFetch<DocumentRequest[]>("/student/documents/requests", { token });
}

export function requestDocument(token: string, type: string, notes?: string) {
  return apiFetch<DocumentRequest>("/student/documents/request", {
    method: "POST",
    token,
    body: JSON.stringify({ type, notes }),
  });
}

export function generateAdmissionLetter(token: string) {
  return apiFetch<IssuedDocument>("/student/documents/admission-letter", { method: "POST", token });
}

export function generateRegistrationSlip(token: string, courseRegistrationId: number) {
  return apiFetch<IssuedDocument>(`/student/documents/registration-slip/${courseRegistrationId}`, {
    method: "POST",
    token,
  });
}

export function generateResultSlip(token: string, academicSessionId: number, semesterId?: number) {
  return apiFetch<IssuedDocument>("/student/documents/result-slip", {
    method: "POST",
    token,
    body: JSON.stringify({ academic_session_id: academicSessionId, semester_id: semesterId }),
  });
}

export function generateReceipt(token: string, paymentId: number) {
  return apiFetch<IssuedDocument>(`/student/documents/receipt/${paymentId}`, { method: "POST", token });
}

/* -------------------------------- Staff -------------------------------- */

export function getDocumentRequests(token: string, page = 1, status?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  return apiFetch<Paginated<DocumentRequest>>(`/staff/document-requests?${params}`, { token });
}

export function processDocumentRequest(token: string, id: number, decision: "approve" | "reject", reason?: string) {
  return apiFetch<DocumentRequest>(`/staff/document-requests/${id}/process`, {
    method: "POST",
    token,
    body: JSON.stringify({ decision, reason }),
  });
}

export function issueDocumentRequest(token: string, id: number) {
  return apiFetch<IssuedDocument>(`/staff/document-requests/${id}/issue`, { method: "POST", token });
}

export function revokeIssuedDocument(token: string, id: number, reason: string) {
  return apiFetch<IssuedDocument>(`/staff/issued-documents/${id}/revoke`, {
    method: "POST",
    token,
    body: JSON.stringify({ reason }),
  });
}

export function getRegistrarDashboard(token: string) {
  return apiFetch<{
    active_students: number;
    pending_document_requests: number;
    ready_document_requests: number;
    clearance_in_progress: number;
    clearance_completed: number;
    students_by_status: Record<string, number>;
  }>("/registrar/dashboard", { token });
}
