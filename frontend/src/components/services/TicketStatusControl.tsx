"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"];

export function TicketStatusControl({ ticketId, status }: { ticketId: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function changeStatus(newStatus: string) {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/tickets/${ticketId}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not update status.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-danger">{error}</p>}
      <select
        value={status}
        onChange={(e) => changeStatus(e.target.value)}
        disabled={busy}
        className="rounded-md border border-border px-2 py-1 text-sm focus:border-sky-dark focus:outline-none"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
