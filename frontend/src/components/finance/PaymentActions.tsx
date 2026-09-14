"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function PaymentActions({
  paymentId,
  amount,
  status,
}: {
  paymentId: number;
  amount: number;
  status: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRefund, setShowRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState(String(amount));
  const [reason, setReason] = useState("");

  async function verify() {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/bursary/payments/${paymentId}/verify`, { method: "POST" });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not re-check this payment.");
      return;
    }
    router.refresh();
  }

  async function refund() {
    if (!reason.trim()) {
      setError("A reason is required to record a refund.");
      return;
    }
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/bursary/payments/${paymentId}/refund`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(refundAmount), reason }),
    });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not record this refund.");
      return;
    }
    setShowRefund(false);
    router.refresh();
  }

  if (showRefund) {
    return (
      <div className="flex flex-col items-end gap-2">
        {error && <p className="text-xs text-danger">{error}</p>}
        <input
          value={refundAmount}
          onChange={(e) => setRefundAmount(e.target.value)}
          type="number"
          min="0.01"
          max={amount}
          className="w-32 rounded-md border border-border px-2 py-1 text-sm focus:border-sky-dark focus:outline-none"
        />
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Refund reason…"
          rows={2}
          className="w-56 rounded-md border border-border px-2 py-1 text-sm focus:border-sky-dark focus:outline-none"
        />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setShowRefund(false)} aria-disabled={busy}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={refund} aria-disabled={busy}>
            {busy ? "Refunding…" : "Confirm refund"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-danger">{error}</p>}
      <div className="flex gap-2">
        {status === "PENDING" && (
          <Button variant="ghost" onClick={verify} aria-disabled={busy}>
            {busy ? "Checking…" : "Re-check"}
          </Button>
        )}
        {status === "SUCCESSFUL" && (
          <Button variant="ghost" onClick={() => setShowRefund(true)} aria-disabled={busy}>
            Refund
          </Button>
        )}
      </div>
    </div>
  );
}
