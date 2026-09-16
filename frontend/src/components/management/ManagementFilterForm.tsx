"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import type { ManagementFilters } from "@/lib/api/management";
import { Button } from "@/components/ui/Button";

type Option = { id: number; name: string };

export function ManagementFilterForm({
  initial,
  sessions,
  schools,
  departments,
  programmes,
  levels,
}: {
  initial: ManagementFilters;
  sessions: Option[];
  schools: Option[];
  departments: Option[];
  programmes: Option[];
  levels: Option[];
}) {
  const router = useRouter();
  const [filters, setFilters] = useState<ManagementFilters>(initial);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(params.toString() ? `/management/dashboard?${params}` : "/management/dashboard");
  }

  function handleClear() {
    setFilters({});
    router.push("/management/dashboard");
  }

  const fieldClass =
    "rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-muted">
        Session
        <select
          className={fieldClass}
          value={filters.academic_session_id ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, academic_session_id: e.target.value }))}
        >
          <option value="">All sessions</option>
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        School
        <select
          className={fieldClass}
          value={filters.school_id ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, school_id: e.target.value }))}
        >
          <option value="">All schools</option>
          {schools.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Department
        <select
          className={fieldClass}
          value={filters.department_id ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, department_id: e.target.value }))}
        >
          <option value="">All departments</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Programme
        <select
          className={fieldClass}
          value={filters.programme_id ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, programme_id: e.target.value }))}
        >
          <option value="">All programmes</option>
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-muted">
        Level
        <select
          className={fieldClass}
          value={filters.level_id ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, level_id: e.target.value }))}
        >
          <option value="">All levels</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </label>

      <div className="flex gap-2">
        <Button type="submit" variant="secondary">Apply filters</Button>
        <Button type="button" variant="ghost" onClick={handleClear}>Clear</Button>
      </div>
    </form>
  );
}
