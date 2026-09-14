"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type PendingPayment = { id: number; reference: string; status: string };

export function PayInvoiceButton({ invoiceId, balance }: { invoiceId: number; balance: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingPayment | null>(null);

  async function pay() {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/student/invoices/${invoiceId}/pay`, { method: "POST" });
    const result = await response.json();
    setBusy(false);

    if (!result.success) {
      setError(result.message ?? "Could not start this payment.");
      return;
    }

    if (result.data.authorization_url) {
      window.location.href = result.data.authorization_url;
      return;
    }

    // No checkout URL — the 'test'/manual gateway: offer a way to
    // complete it right here rather than leaving the student stuck.
    setPending(result.data.payment);
  }

  async function simulateAndCheck() {
    if (!pending) return;
    setBusy(true);
    setError(null);

    await fetch("/api/payments/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: pending.reference }),
    });

    const statusResponse = await fetch(`/api/student/payments/${pending.id}/status`, { method: "POST" });
    const statusResult = await statusResponse.json();
    setBusy(false);

    if (!statusResult.success) {
      setError(statusResult.message ?? "Could not confirm this payment.");
      return;
    }

    setPending(null);
    router.refresh();
  }

  if (pending) {
    return (
      <div className="flex flex-col items-end gap-1">
        {error && <p className="text-xs text-danger">{error}</p>}
        <p className="text-xs text-muted">
          Payment {pending.reference} started via the test/manual gateway (no live checkout page).
        </p>
        <Button variant="primary" onClick={simulateAndCheck} aria-disabled={busy}>
          {busy ? "Confirming…" : "Simulate Payment (dev/demo)"}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button variant="primary" onClick={pay} aria-disabled={busy}>
        {busy ? "Starting…" : `Pay ₦${balance.toLocaleString()}`}
      </Button>
    </div>
  );
}
