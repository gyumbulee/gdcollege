"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { AdminRole } from "@/lib/api/admin";

type Department = { id: number; name: string };

export function CreateUserForm({ roles, departments }: { roles: AdminRole[]; departments: Department[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleSlugs, setRoleSlugs] = useState<string[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function toggleRole(slug: string) {
    setRoleSlugs((current) => (current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug]));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          role_slugs: roleSlugs,
          department_id: departmentId || undefined,
        }),
      });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not create the account." });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      setName("");
      setEmail("");
      setPhone("");
      setRoleSlugs([]);
      setDepartmentId("");
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Something went wrong reaching the server." });
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">New staff account</p>

      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-sm text-muted">
          Name
          <input required value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          Email
          <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          Phone (optional)
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={fieldClass} />
        </label>
      </div>

      <div className="mt-3">
        <p className="text-sm text-muted">Roles</p>
        <div className="mt-1 flex flex-wrap gap-2">
          {roles.map((role) => (
            <label key={role.slug} className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-ink">
              <input
                type="checkbox"
                checked={roleSlugs.includes(role.slug)}
                onChange={() => toggleRole(role.slug)}
              />
              {role.name}
            </label>
          ))}
        </div>
      </div>

      <label className="mt-3 block text-sm text-muted sm:max-w-xs">
        Department scope (optional — for HOD and similar)
        <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={fieldClass}>
          <option value="">No department scope</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </label>

      {message && (
        <p className={`mt-3 rounded-md px-3 py-2 text-sm ${message.tone === "success" ? "bg-sky-light text-sky-dark" : "bg-red-50 text-danger"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-4">
        <Button type="submit" variant="secondary" aria-disabled={submitting}>
          {submitting ? "Creating…" : "Create account"}
        </Button>
      </div>
    </form>
  );
}
