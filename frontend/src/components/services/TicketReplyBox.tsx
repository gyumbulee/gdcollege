"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function TicketReplyBox({ ticketId }: { ticketId: number }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!message.trim()) return;
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/tickets/${ticketId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not send this reply.");
      return;
    }
    setMessage("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      {error && <p className="text-xs text-danger">{error}</p>}
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Write a reply…"
        rows={3}
        className="rounded-md border border-border px-3 py-2 text-sm focus:border-sky-dark focus:outline-none"
      />
      <div className="flex justify-end">
        <Button variant="primary" onClick={submit} aria-disabled={busy || !message.trim()}>
          {busy ? "Sending…" : "Send reply"}
        </Button>
      </div>
    </div>
  );
}
