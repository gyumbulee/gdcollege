import { apiFetch } from "./client";

export type PublicSchool = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  departments_count?: number;
};

export type PublicDepartment = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  school: { id: number; name: string; slug: string } | null;
  programmes_count?: number;
};

export type PublicProgramme = {
  id: number;
  name: string;
  slug: string;
  award_type: string;
  duration_levels: number;
  description: string | null;
  is_active: boolean;
  department: {
    id: number;
    name: string;
    slug: string;
    school: { id: number; name: string; slug: string } | null;
  } | null;
};

/**
 * All three functions below fail soft: if the API is unreachable or
 * returns an error, they return an empty array rather than throwing, so a
 * backend outage degrades the public site to honest empty states instead
 * of a hard 500. Callers should still tell visitors the catalogue is
 * temporarily unavailable — see the `ok` flag.
 */
async function fetchList<T>(path: string): Promise<{ ok: boolean; items: T[] }> {
  try {
    const { body } = await apiFetch<T[]>(path);
    return body.success ? { ok: true, items: body.data } : { ok: false, items: [] };
  } catch {
    return { ok: false, items: [] };
  }
}

export function getSchools() {
  return fetchList<PublicSchool>("/schools");
}

export function getDepartments() {
  return fetchList<PublicDepartment>("/departments");
}

export function getProgrammes() {
  return fetchList<PublicProgramme>("/programmes");
}
