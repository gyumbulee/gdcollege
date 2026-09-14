"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function VoidInvoiceButton({ invoiceId }: { invoiceId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!reason.trim()) {
      setError("A reason is required to void an invoice.");
      return;
    }
    setBusy(true);
    setError(null);

    const response = await fetch(`/api/bursary/invoices/${invoiceId}/void`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const result = await response.json();
    setBusy(false);

    if (!result.success) {
      setError(result.message ?? "Could not void this invoice.");
      return;
    }

    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="ghost" onClick={() => setOpen(true)}>
        Void
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {error && <p className="text-xs text-danger">{error}</p>}
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Reason for voiding…"
        rows={2}
        className="w-64 rounded-md border border-border px-3 py-2 text-sm focus:border-sky-dark focus:outline-none"
      />
      <div className="flex gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)} aria-disabled={busy}>
          Cancel
        </Button>
        <Button variant="secondary" onClick={submit} aria-disabled={busy}>
          {busy ? "Voiding…" : "Confirm void"}
        </Button>
      </div>
    </div>
  );
}
