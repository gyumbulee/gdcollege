"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseRegistration } from "@/types/registration";
import { Button } from "@/components/ui/Button";

export function RegistrationDecisionPanel({
  registration,
  canDecide,
}: {
  registration: CourseRegistration;
  canDecide: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function approve() {
    setBusy(true);
    const response = await fetch(`/api/staff/course-registrations/${registration.id}/approve`, { method: "POST" });
    const result = await response.json();
    setBusy(false);
    setMessage(result.message ?? null);
    if (result.success) router.refresh();
  }

  async function reject() {
    setBusy(true);
    const response = await fetch(`/api/staff/course-registrations/${registration.id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const result = await response.json();
    setBusy(false);
    setMessage(result.message ?? null);
    if (result.success) router.refresh();
  }

  if (!canDecide || registration.status !== "SUBMITTED") {
    return message ? <p className="text-xs text-muted">{message}</p> : null;
  }

  return (
    <aside className="h-fit space-y-3 rounded-lg border border-border bg-white p-5">
      <h2 className="text-sm font-medium text-ink">Decision</h2>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for returning (if rejecting)"
        rows={2}
        className="w-full rounded-md border border-border px-3 py-2 text-sm"
      />
      <div className="flex gap-2">
        <Button variant="primary" onClick={approve} aria-disabled={busy}>
          Approve
        </Button>
        <Button variant="ghost" onClick={reject} aria-disabled={busy}>
          Return to student
        </Button>
      </div>
      {message && <p className="text-xs text-muted">{message}</p>}
    </aside>
  );
}
