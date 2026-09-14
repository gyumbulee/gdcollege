"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type StructureOption = { id: number; name: string };

export function GenerateInvoiceForm({ structures }: { structures: StructureOption[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [structureId, setStructureId] = useState<string>(String(structures[0]?.id ?? ""));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);

    const response = await fetch("/api/bursary/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_id: Number(studentId), fee_structure_id: Number(structureId) }),
    });
    const result = await response.json();
    setBusy(false);

    if (!result.success) {
      setError(result.message ?? "Could not generate this invoice.");
      return;
    }

    setStudentId("");
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        Generate invoice
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">Generate invoice</p>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Student ID</span>
          <input
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            type="number"
            min="1"
            placeholder="e.g. 5"
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
          <span className="text-xs text-muted">
            No student search yet (Phase 22 — Global Search) — use the numeric student ID for now.
          </span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Fee structure</span>
          <select
            value={structureId}
            onChange={(e) => setStructureId(e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          >
            {structures.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)} aria-disabled={busy}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit} aria-disabled={busy || !studentId || !structureId}>
          {busy ? "Generating…" : "Generate"}
        </Button>
      </div>
    </div>
  );
}
