import "server-only";
import { apiFetch } from "./client";
import type {
  CourseRegistration,
  EligibleOffering,
} from "@/types/registration";

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

// --- Student side ---

export async function listMyRegistrations(token: string) {
  return apiFetch<CourseRegistration[]>("/course-registrations", {
    token,
  });
}

export async function createOrGetDraftRegistration(token: string) {
  return apiFetch<CourseRegistration>("/course-registrations", {
    method: "POST",
    token,
  });
}

export async function getRegistration(token: string, id: number) {
  return apiFetch<CourseRegistration>(`/course-registrations/${id}`, {
    token,
  });
}

export async function updateRegistrationItems(
  token: string,
  id: number,
  courseOfferingIds: number[]
) {
  return apiFetch<CourseRegistration>(`/course-registrations/${id}`, {
    method: "PUT",
    token,
    body: JSON.stringify({
      course_offering_ids: courseOfferingIds,
    }),
  });
}

export async function submitRegistration(token: string, id: number) {
  return apiFetch<CourseRegistration>(
    `/course-registrations/${id}/submit`,
    {
      method: "POST",
      token,
    }
  );
}

export async function listEligibleOfferings(
  token: string,
  params: {
    programme_id?: number;
    academic_session_id?: number;
    semester_id?: number;
  }
) {
  const query = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    )
  ).toString();

  return apiFetch<EligibleOffering[]>(
    `/course-offerings${query ? `?${query}` : ""}`,
    {
      token,
    }
  );
}

// --- Staff (HOD) side ---

export type StaffRegistrationListData = {
  items: CourseRegistration[];
  pagination: PaginationMeta;
};

export async function listStaffRegistrations(
  token: string,
  status?: string
) {
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : "";

  return apiFetch<StaffRegistrationListData>(
    `/staff/course-registrations${query}`,
    {
      token,
    }
  );
}

export async function getStaffRegistration(
  token: string,
  id: number
) {
  return apiFetch<CourseRegistration>(
    `/staff/course-registrations/${id}`,
    {
      token,
    }
  );
}

export async function approveRegistration(
  token: string,
  id: number
) {
  return apiFetch<CourseRegistration>(
    `/staff/course-registrations/${id}/approve`,
    {
      method: "POST",
      token,
    }
  );
}

export async function rejectRegistration(
  token: string,
  id: number,
  reason?: string
) {
  return apiFetch<CourseRegistration>(
    `/staff/course-registrations/${id}/reject`,
    {
      method: "POST",
      token,
      body: JSON.stringify({ reason }),
    }
  );
}