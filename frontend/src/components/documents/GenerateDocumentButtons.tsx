"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

function IdGenerateRow({
  label,
  hint,
  endpoint,
  buildBody,
}: {
  label: string;
  hint: string;
  endpoint: (id: string) => string;
  buildBody?: () => Record<string, unknown>;
}) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    const response = await fetch(endpoint(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: buildBody ? JSON.stringify(buildBody()) : undefined,
    });
    const result = await response.json();
    setBusy(false);

    if (!result.success) {
      setError(result.message ?? "Could not generate this document.");
      return;
    }

    setId("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-40 text-sm text-ink">{label}</span>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          type="number"
          min="1"
          placeholder="ID"
          className="w-24 rounded-md border border-border px-2 py-1 text-sm focus:border-sky-dark focus:outline-none"
        />
        <Button variant="ghost" onClick={generate} aria-disabled={busy || !id}>
          {busy ? "Generating…" : "Generate"}
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <p className="text-xs text-muted">{hint}</p>
    </div>
  );
}

function ResultSlipRow() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");
  const [semesterId, setSemesterId] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/student/documents/result-slip", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        academic_session_id: sessionId,
        semester_id: semesterId || undefined,
      }),
    });
    const result = await response.json();
    setBusy(false);

    if (!result.success) {
      setError(result.message ?? "Could not generate this document.");
      return;
    }

    setSessionId("");
    setSemesterId("");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-1 border-t border-border pt-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-40 text-sm text-ink">Result Slip</span>
        <input
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          type="number"
          min="1"
          placeholder="Session ID"
          className="w-28 rounded-md border border-border px-2 py-1 text-sm focus:border-sky-dark focus:outline-none"
        />
        <input
          value={semesterId}
          onChange={(e) => setSemesterId(e.target.value)}
          type="number"
          min="1"
          placeholder="Semester ID (optional)"
          className="w-36 rounded-md border border-border px-2 py-1 text-sm focus:border-sky-dark focus:outline-none"
        />
        <Button variant="ghost" onClick={generate} aria-disabled={busy || !sessionId}>
          {busy ? "Generating…" : "Generate"}
        </Button>
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <p className="text-xs text-muted">Only PUBLISHED results for that session/semester are included.</p>
    </div>
  );
}

export function GenerateDocumentButtons() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generateAdmissionLetter() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/student/documents/admission-letter", { method: "POST" });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not generate this document.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">Generate instantly</p>
      <p className="mt-1 text-sm text-muted">
        These are generated immediately from your existing records — no Registry processing
        needed.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <span className="w-40 text-sm text-ink">Admission Letter</span>
          <Button variant="ghost" onClick={generateAdmissionLetter} aria-disabled={busy}>
            {busy ? "Generating…" : "Generate"}
          </Button>
        </div>

        <IdGenerateRow
          label="Registration Slip"
          hint="Enter your course registration ID (no search yet — see Phase 22)."
          endpoint={(id) => `/api/student/documents/registration-slip/${id}`}
        />
        <ResultSlipRow />
        <IdGenerateRow
          label="Payment Receipt"
          hint="Enter a successful payment ID from your Fees page."
          endpoint={(id) => `/api/student/documents/receipt/${id}`}
        />
      </div>

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
