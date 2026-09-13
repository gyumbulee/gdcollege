"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Application } from "@/types/admissions";
import { Button } from "@/components/ui/Button";

async function post(path: string, body?: unknown) {
  const response = await fetch(path, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  return response.json();
}

export function DecisionPanel({
  application,
  canDecide,
}: {
  application: Application;
  canDecide: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setMessage(null);
    const result = (await action()) as { success: boolean; message?: string };
    setBusy(false);
    setMessage(result.message ?? null);
    if (result.success) router.refresh();
  }

  const { status } = application;

  return (
    <aside className="h-fit space-y-4 rounded-lg border border-border bg-white p-5">
      <h2 className="text-sm font-medium text-ink">Actions</h2>

      {status === "SUBMITTED" && (
        <Button
          variant="secondary"
          className="w-full"
          aria-disabled={busy}
          onClick={() => run(() => post(`/api/staff/admissions/${application.id}/review`))}
        >
          Mark under review
        </Button>
      )}

      {status === "UNDER_REVIEW" && (
        <Button
          variant="secondary"
          className="w-full"
          aria-disabled={busy}
          onClick={() => run(() => post(`/api/staff/admissions/${application.id}/shortlist`))}
        >
          Shortlist
        </Button>
      )}

      {canDecide && ["UNDER_REVIEW", "SHORTLISTED", "ON_HOLD"].includes(status) && (
        <div className="space-y-2 border-t border-border pt-4">
          <label className="block text-xs text-muted">Reason (optional)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            className="w-full rounded-md border border-border px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="primary"
              aria-disabled={busy}
              onClick={() => run(() => post(`/api/staff/admissions/${application.id}/decision`, { decision: "ADMIT", decision_reason: reason }))}
            >
              Admit
            </Button>
            <Button
              variant="ghost"
              aria-disabled={busy}
              onClick={() => run(() => post(`/api/staff/admissions/${application.id}/decision`, { decision: "HOLD", decision_reason: reason }))}
            >
              Hold
            </Button>
            <Button
              variant="ghost"
              aria-disabled={busy}
              onClick={() => run(() => post(`/api/staff/admissions/${application.id}/decision`, { decision: "REJECT", decision_reason: reason }))}
            >
              Reject
            </Button>
          </div>
        </div>
      )}

      {status === "ADMITTED" && (
        <div className="border-t border-border pt-4">
          {application.student ? (
            <p className="text-sm text-ink">
              Student account ready — matric number{" "}
              <span className="font-medium">{application.student.matric_number}</span>
            </p>
          ) : (
            <Button
              variant="primary"
              className="w-full"
              aria-disabled={busy}
              onClick={() => run(() => post(`/api/staff/admissions/${application.id}/convert`))}
            >
              Convert to student account
            </Button>
          )}
        </div>
      )}

      {message && <p className="text-xs text-muted">{message}</p>}
    </aside>
  );
}
