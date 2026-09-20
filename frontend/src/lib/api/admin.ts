import "server-only";
import { apiFetch } from "./client";

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: "active" | "suspended" | "inactive";
  roles: { slug: string; name: string; scope_type: string | null; scope_id: number | null }[];
  created_at: string;
};

export type AdminRole = {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  permissions: string[];
};

export type AdminPermission = { id: number; slug: string; description: string | null };

export type AdminAuditLog = {
  id: number;
  action: string;
  user: { id: number; name: string; email: string } | null;
  target_type: string | null;
  target_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
};

export type InstitutionSettings = {
  id: number;
  formal_name: string;
  short_name: string;
  motto: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  banner_url: string | null;
};

export function getAdminUsers(token: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<{ items: AdminUser[]; pagination: Record<string, number | boolean | null> }>(
    `/admin/users${qs ? `?${qs}` : ""}`,
    { token }
  );
}

export function getAdminRoles(token: string) {
  return apiFetch<AdminRole[]>("/admin/roles", { token });
}

export function getAdminPermissions(token: string) {
  return apiFetch<AdminPermission[]>("/admin/permissions", { token });
}

export function getAdminAuditLogs(token: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch<{ items: AdminAuditLog[]; pagination: Record<string, number | boolean | null> }>(
    `/admin/audit-logs${qs ? `?${qs}` : ""}`,
    { token }
  );
}

export function getInstitutionSettings(token: string) {
  return apiFetch<InstitutionSettings>("/admin/institution", { token });
}

export type DocumentTemplateSetting = {
  id: number;
  type: string;
  name: string;
  description: string | null;
  is_active: boolean;
  requires_request: boolean;
  original_filename: string | null;
  file_url: string | null;
  uploaded_at: string | null;
};

export function getDocumentTemplates(token: string) {
  return apiFetch<DocumentTemplateSetting[]>("/admin/document-templates", { token });
}
