import "server-only";

import { apiFetch } from "./client";
import type { Application } from "@/types/admissions";

/**
 * Pagination metadata returned by the Laravel API.
 *
 * The backend normalizes paginated ResourceCollections into:
 *
 * {
 *   items: [...],
 *   pagination: {
 *     current_page: 1,
 *     per_page: 25,
 *     has_more_pages: false,
 *     total: 10,
 *     last_page: 1
 *   }
 * }
 */
export type StaffApplicationsPagination = {
  current_page: number;
  per_page: number;
  has_more_pages: boolean;
  total: number | null;
  last_page: number | null;
};

/**
 * Paginated admissions application response.
 */
export type StaffApplicationsList = {
  items: Application[];
  pagination: StaffApplicationsPagination;
};

/**
 * List admissions applications available to staff.
 *
 * Backend endpoint:
 * GET /admissions/applications
 *
 * The Laravel backend returns paginated data in the following shape:
 *
 * {
 *   success: true,
 *   message: "...",
 *   data: {
 *     items: Application[],
 *     pagination: {...}
 *   }
 * }
 */
export async function listStaffApplications(
  token: string,
  status?: string
) {
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : "";

  return apiFetch<StaffApplicationsList>(
    `/admissions/applications${query}`,
    {
      token,
    }
  );
}

/**
 * Get a single admissions application.
 *
 * Backend endpoint:
 * GET /admissions/applications/{id}
 */
export async function getStaffApplication(
  token: string,
  id: number
) {
  return apiFetch<Application>(
    `/admissions/applications/${id}`,
    {
      token,
    }
  );
}

/**
 * Move an application into review.
 *
 * Backend endpoint:
 * POST /admissions/applications/{id}/review
 */
export async function reviewApplication(
  token: string,
  id: number
) {
  return apiFetch<Application>(
    `/admissions/applications/${id}/review`,
    {
      method: "POST",
      token,
    }
  );
}

/**
 * Shortlist an application.
 *
 * Backend endpoint:
 * POST /admissions/applications/{id}/shortlist
 */
export async function shortlistApplication(
  token: string,
  id: number
) {
  return apiFetch<Application>(
    `/admissions/applications/${id}/shortlist`,
    {
      method: "POST",
      token,
    }
  );
}

/**
 * Make a final admissions decision.
 *
 * Backend endpoint:
 * POST /admissions/applications/{id}/decision
 */
export async function decideApplication(
  token: string,
  id: number,
  decision: "ADMIT" | "HOLD" | "REJECT",
  reason?: string
) {
  return apiFetch<Application>(
    `/admissions/applications/${id}/decision`,
    {
      method: "POST",
      token,
      body: JSON.stringify({
        decision,
        decision_reason: reason,
      }),
    }
  );
}

/**
 * Convert an admitted application into a student.
 *
 * Backend endpoint:
 * POST /admissions/applications/{id}/convert
 */
export async function convertApplication(
  token: string,
  id: number
) {
  return apiFetch<{
    matric_number: string;
    student_id: number;
  }>(
    `/admissions/applications/${id}/convert`,
    {
      method: "POST",
      token,
    }
  );
}