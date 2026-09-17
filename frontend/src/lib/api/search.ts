import "server-only";
import { apiFetch } from "./client";

export type SearchResults = {
  query: string;
  students: { id: number; matric_number: string; name: string | null; email: string | null; phone: string | null; programme: string | null; department: string | null; status: string }[];
  applications: { id: number; application_number: string; applicant_name: string | null; programme: string | null; status: string }[];
  payments: { id: number; reference: string; student_name: string | null; amount: number; status: string }[];
  courses: { id: number; code: string; title: string; credit_units: number }[];
};

export function globalSearch(token: string, query: string) {
  return apiFetch<SearchResults>(`/search?q=${encodeURIComponent(query)}`, { token });
}
