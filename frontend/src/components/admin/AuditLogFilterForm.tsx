"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Filters = { action?: string; target_type?: string; from?: string; to?: string };

export function AuditLogFilterForm({ initial }: { initial: Filters }) {
  const router = useRouter();
  const [filters, setFilters] = useState<Filters>(initial);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(params.toString() ? `/admin/audit-logs?${params}` : "/admin/audit-logs");
  }

  const fieldClass = "rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted">
        Action starts with
        <input
          placeholder="e.g. results."
          value={filters.action ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value }))}
          className={fieldClass}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Target type
        <select
          value={filters.target_type ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, target_type: e.target.value }))}
          className={fieldClass}
        >
          <option value="">Any</option>
          <option value="User">User</option>
          <option value="Result">Result</option>
          <option value="Application">Application</option>
          <option value="Student">Student</option>
          <option value="Payment">Payment</option>
          <option value="Invoice">Invoice</option>
          <option value="Role">Role</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        From
        <input type="date" value={filters.from ?? ""} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} className={fieldClass} />
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        To
        <input type="date" value={filters.to ?? ""} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} className={fieldClass} />
      </label>

      <div className="flex gap-2">
        <Button type="submit" variant="secondary">Apply filters</Button>
        <Button type="button" variant="ghost" onClick={() => { setFilters({}); router.push("/admin/audit-logs"); }}>Clear</Button>
      </div>
    </form>
  );
}
