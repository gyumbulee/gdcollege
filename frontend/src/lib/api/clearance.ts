import "server-only";
import { apiFetch } from "./client";
import type { Paginated } from "./hod";

export type ClearanceItem = {
  id: number;
  stage: string;
  status: string;
  remark: string | null;
  approved_at: string | null;
};

export type ClearanceRequest = {
  id: number;
  status: string;
  completed_at: string | null;
  created_at: string;
  student?: { id: number; matric_number: string | null; name: string | null } | null;
  items?: ClearanceItem[];
};

/* ------------------------------- Student ------------------------------- */

export function getMyClearance(token: string) {
  return apiFetch<ClearanceRequest | null>("/student/clearance", { token });
}

export function requestClearance(token: string) {
  return apiFetch<ClearanceRequest>("/student/clearance/request", { method: "POST", token, body: JSON.stringify({}) });
}

/* -------------------------------- Staff -------------------------------- */

export function getClearanceRequests(token: string, page = 1, status?: string) {
  const params = new URLSearchParams({ page: String(page) });
  if (status) params.set("status", status);
  return apiFetch<Paginated<ClearanceRequest>>(`/staff/clearance?${params}`, { token });
}

export function decideClearanceItem(token: string, itemId: number, decision: "APPROVED" | "REJECTED", remark?: string) {
  return apiFetch<ClearanceRequest>(`/staff/clearance-items/${itemId}/decide`, {
    method: "POST",
    token,
    body: JSON.stringify({ decision, remark }),
  });
}
