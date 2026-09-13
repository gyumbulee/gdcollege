"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function RegistrationActions({ registrationId }: { registrationId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function approve() {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/hod/registrations/${registrationId}/approve`, { method: "POST" });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not approve this registration.");
      return;
    }
    router.refresh();
  }

  async function reject() {
    if (!reason.trim()) {
      setError("A reason is required to return a registration to the student.");
      return;
    }
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/hod/registrations/${registrationId}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not return this registration.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-xs text-danger">{error}</p>}
      {!showReject ? (
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowReject(true)} aria-disabled={busy}>
            Return
          </Button>
          <Button variant="primary" onClick={approve} aria-disabled={busy}>
            {busy ? "Approving…" : "Approve"}
          </Button>
        </div>
      ) : (
        <div className="flex w-72 flex-col gap-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for returning this registration…"
            rows={2}
            className="rounded-md border border-border px-3 py-2 text-sm focus:border-sky-dark focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowReject(false)} aria-disabled={busy}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={reject} aria-disabled={busy}>
              {busy ? "Returning…" : "Confirm return"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
