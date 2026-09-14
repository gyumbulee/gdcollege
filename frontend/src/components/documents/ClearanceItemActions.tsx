"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ClearanceItemActions({ itemId, status }: { itemId: number; status: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [remark, setRemark] = useState("");

  async function decide(decision: "APPROVED" | "REJECTED") {
    if (decision === "REJECTED" && !remark.trim()) {
      setError("A remark is required to reject a clearance stage.");
      return;
    }
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/staff/clearance-items/${itemId}/decide`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, remark: remark || undefined }),
    });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not record this decision.");
      return;
    }
    router.refresh();
  }

  if (status !== "PENDING") {
    return null;
  }

  if (showReject) {
    return (
      <div className="flex flex-col items-end gap-2">
        {error && <p className="text-xs text-danger">{error}</p>}
        <textarea
          value={remark}
          onChange={(e) => setRemark(e.target.value)}
          placeholder="Reason…"
          rows={2}
          className="w-56 rounded-md border border-border px-2 py-1 text-sm focus:border-sky-dark focus:outline-none"
        />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowReject(false)} aria-disabled={busy}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={() => decide("REJECTED")} aria-disabled={busy}>
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
        <Button variant="primary" onClick={() => decide("APPROVED")} aria-disabled={busy}>
          {busy ? "Approving…" : "Approve"}
        </Button>
      </div>
    </div>
  );
}
