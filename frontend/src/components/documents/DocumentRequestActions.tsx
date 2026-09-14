"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function DocumentRequestActions({ requestId, status }: { requestId: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState("");

  async function approve() {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/staff/document-requests/${requestId}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "approve" }),
    });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not mark this ready.");
      return;
    }
    router.refresh();
  }

  async function reject() {
    if (!reason.trim()) {
      setError("A reason is required to reject a request.");
      return;
    }
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/staff/document-requests/${requestId}/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision: "reject", reason }),
    });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not reject this request.");
      return;
    }
    router.refresh();
  }

  async function issue() {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/staff/document-requests/${requestId}/issue`, { method: "POST" });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not issue this document.");
      return;
    }
    router.refresh();
  }

  if (status === "READY") {
    return (
      <div className="flex flex-col items-end gap-1">
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button variant="primary" onClick={issue} aria-disabled={busy}>
          {busy ? "Issuing…" : "Issue document"}
        </Button>
      </div>
    );
  }

  if (status !== "REQUESTED" && status !== "PROCESSING") {
    return null;
  }

  if (showReject) {
    return (
      <div className="flex flex-col items-end gap-2">
        {error && <p className="text-xs text-danger">{error}</p>}
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for rejecting…"
          rows={2}
          className="w-64 rounded-md border border-border px-3 py-2 text-sm focus:border-sky-dark focus:outline-none"
        />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowReject(false)} aria-disabled={busy}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={reject} aria-disabled={busy}>
            {busy ? "Rejecting…" : "Confirm reject"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setShowReject(true)} aria-disabled={busy}>
          Reject
        </Button>
        <Button variant="primary" onClick={approve} aria-disabled={busy}>
          {busy ? "Marking ready…" : "Mark ready"}
        </Button>
      </div>
    </div>
  );
}
