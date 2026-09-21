"use client";

import { useState } from "react";
import { AcademicEntityForm } from "./AcademicEntityForm";
import type { AdminAcademicSession } from "@/lib/api/admin-academics";

/** ISO datetime -> the "YYYY-MM-DDTHH:mm" shape <input type="datetime-local"> requires. */
function toLocalInput(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toDateInput(iso: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export function SessionEditToggle({ session }: { session: AdminAcademicSession }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-sky-dark hover:underline"
      >
        {open ? "Close" : "Edit"}
      </button>

      {open && (
        <div className="mt-3">
          <AcademicEntityForm
            resource="academic-sessions"
            title={`Edit ${session.name}`}
            entityId={session.id}
            defaults={{
              name: session.name,
              start_date: toDateInput(session.start_date),
              end_date: toDateInput(session.end_date),
              is_current: session.is_current,
              admissions_open_at: toLocalInput(session.admissions_open_at),
              admissions_close_at: toLocalInput(session.admissions_close_at),
            }}
            fields={[
              { name: "name", label: "Name (e.g. 2026/2027)", type: "text", required: true },
              { name: "start_date", label: "Start date", type: "date" },
              { name: "end_date", label: "End date", type: "date" },
              { name: "is_current", label: "Current session", type: "checkbox" },
              { name: "admissions_open_at", label: "Admissions open at (leave blank = no lower bound)", type: "datetime-local" },
              { name: "admissions_close_at", label: "Admissions close at (leave blank = no upper bound)", type: "datetime-local" },
            ]}
          />
        </div>
      )}
    </div>
  );
}
