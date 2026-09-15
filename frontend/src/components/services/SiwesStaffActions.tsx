"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const STATUSES = ["PENDING", "ACTIVE", "COMPLETED", "TERMINATED"];

export function SiwesStaffActions({ recordId, status }: { recordId: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssess, setShowAssess] = useState(false);
  const [score, setScore] = useState("");
  const [remark, setRemark] = useState("");

  async function changeStatus(newStatus: string) {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/siwes/${recordId}/status`, {
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

  async function assess() {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/siwes/${recordId}/assess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: Number(score), remark }),
    });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not record assessment.");
      return;
    }
    setShowAssess(false);
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
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

      {showAssess ? (
        <div className="flex w-56 flex-col gap-2">
          <input
            value={score}
            onChange={(e) => setScore(e.target.value)}
            type="number"
            min="0"
            max="100"
            placeholder="Score (0-100)"
            className="rounded-md border border-border px-2 py-1 text-sm focus:border-sky-dark focus:outline-none"
          />
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Remark (optional)"
            rows={2}
            className="rounded-md border border-border px-2 py-1 text-sm focus:border-sky-dark focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowAssess(false)} aria-disabled={busy}>
              Cancel
            </Button>
            <Button variant="primary" onClick={assess} aria-disabled={busy || !score}>
              {busy ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="ghost" onClick={() => setShowAssess(true)} aria-disabled={busy}>
          Assess
        </Button>
      )}
    </div>
  );
}
