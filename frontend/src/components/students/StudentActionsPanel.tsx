"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Student } from "@/types/students";
import type { PublicProgramme } from "@/lib/api/academics";
import { Button } from "@/components/ui/Button";

type Option = { id: number; name: string };

const STATUSES: Student["status"][] = ["ACTIVE", "DEFERRED", "SUSPENDED", "WITHDRAWN", "EXPELLED", "GRADUATED"];

async function postJson(path: string, method: string, body: unknown) {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return response.json();
}

export function StudentActionsPanel({
  student,
  programmes,
  sessions,
  levels,
  canUpdate,
  canChangeStatus,
}: {
  student: Student;
  programmes: PublicProgramme[];
  sessions: Option[];
  levels: Option[];
  canUpdate: boolean;
  canChangeStatus: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [status, setStatus] = useState(student.status);
  const [statusReason, setStatusReason] = useState("");

  const [enrolSession, setEnrolSession] = useState<number | "">("");
  const [enrolLevel, setEnrolLevel] = useState<number | "">("");

  const [transferTo, setTransferTo] = useState<number | "">("");
  const [transferReason, setTransferReason] = useState("");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setMessage(null);
    const result = (await action()) as { success: boolean; message?: string };
    setBusy(false);
    setMessage(result.message ?? (result.success ? "Done." : "Something went wrong."));
    if (result.success) router.refresh();
  }

  return (
    <aside className="h-fit space-y-6 rounded-lg border border-border bg-white p-5">
      {canChangeStatus && (
        <div>
          <h2 className="text-sm font-medium text-ink">Status</h2>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as Student["status"])}
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <textarea
            value={statusReason}
            onChange={(e) => setStatusReason(e.target.value)}
            placeholder="Reason (optional)"
            rows={2}
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          <Button
            variant="secondary"
            className="mt-2 w-full"
            aria-disabled={busy}
            onClick={() => run(() => postJson(`/api/staff/students/${student.id}/status`, "PATCH", { status, reason: statusReason }))}
          >
            Update status
          </Button>
        </div>
      )}

      {canUpdate && (
        <div className="border-t border-border pt-4">
          <h2 className="text-sm font-medium text-ink">Enrol for a session</h2>
          <select
            value={enrolSession}
            onChange={(e) => setEnrolSession(e.target.value ? Number(e.target.value) : "")}
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">Academic session</option>
            {sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={enrolLevel}
            onChange={(e) => setEnrolLevel(e.target.value ? Number(e.target.value) : "")}
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">Level</option>
            {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <Button
            variant="secondary"
            className="mt-2 w-full"
            aria-disabled={busy || !enrolSession || !enrolLevel}
            onClick={() => run(() => postJson(`/api/staff/students/${student.id}/enrolments`, "POST", { academic_session_id: enrolSession, level_id: enrolLevel }))}
          >
            Add enrolment
          </Button>
        </div>
      )}

      {canUpdate && (
        <div className="border-t border-border pt-4">
          <h2 className="text-sm font-medium text-ink">Transfer programme</h2>
          <select
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value ? Number(e.target.value) : "")}
            className="mt-2 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
          >
            <option value="">New programme</option>
            {programmes.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <textarea
            value={transferReason}
            onChange={(e) => setTransferReason(e.target.value)}
            placeholder="Reason (optional)"
            rows={2}
            className="mt-2 w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          <Button
            variant="secondary"
            className="mt-2 w-full"
            aria-disabled={busy || !transferTo}
            onClick={() => run(() => postJson(`/api/staff/students/${student.id}/transfer`, "POST", { to_programme_id: transferTo, reason: transferReason }))}
          >
            Record transfer
          </Button>
        </div>
      )}

      {message && <p className="text-xs text-muted">{message}</p>}
    </aside>
  );
}
