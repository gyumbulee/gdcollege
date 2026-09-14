"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const TYPES = [
  { value: "TRANSCRIPT", label: "Transcript" },
  { value: "STATEMENT_OF_RESULT", label: "Statement of Result" },
  { value: "CLEARANCE_CERTIFICATE", label: "Clearance Certificate" },
];

export function RequestDocumentForm() {
  const router = useRouter();
  const [type, setType] = useState(TYPES[0].value);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/student/documents/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, notes }),
    });
    const result = await response.json();
    setBusy(false);

    if (!result.success) {
      setError(result.message ?? "Could not submit this request.");
      return;
    }

    setNotes("");
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">Request a document</p>
      <p className="mt-1 text-sm text-muted">
        These require Registry processing before they&apos;re issued — you&apos;ll see the request
        status below.
      </p>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-muted">Document type</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1 text-sm">
          <span className="text-muted">Notes (optional)</span>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
        </label>
        <Button variant="primary" onClick={submit} aria-disabled={busy}>
          {busy ? "Submitting…" : "Request"}
        </Button>
      </div>
    </div>
  );
}
