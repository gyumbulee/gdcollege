"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

type Option = { id: number; name: string };
type ItemRow = { name: string; code: string; amount: string; is_mandatory: boolean };

const emptyRow = (): ItemRow => ({ name: "", code: "", amount: "", is_mandatory: true });

export function CreateFeeStructureForm({
  sessions,
  programmes,
  levels,
}: {
  sessions: Option[];
  programmes: Option[];
  levels: Option[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sessionId, setSessionId] = useState<string>(String(sessions[0]?.id ?? ""));
  const [programmeId, setProgrammeId] = useState<string>("");
  const [levelId, setLevelId] = useState<string>("");
  const [items, setItems] = useState<ItemRow[]>([emptyRow()]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function updateItem(index: number, patch: Partial<ItemRow>) {
    setItems((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function submit() {
    setBusy(true);
    setError(null);

    const payload = {
      name,
      academic_session_id: Number(sessionId),
      programme_id: programmeId ? Number(programmeId) : null,
      level_id: levelId ? Number(levelId) : null,
      items: items
        .filter((row) => row.name && row.amount)
        .map((row) => ({
          name: row.name,
          code: row.code || undefined,
          amount: Number(row.amount),
          is_mandatory: row.is_mandatory,
        })),
    };

    const response = await fetch("/api/bursary/fee-structures", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    setBusy(false);

    if (!result.success) {
      setError(result.message ?? "Could not create this fee structure.");
      return;
    }

    setName("");
    setItems([emptyRow()]);
    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        New fee structure
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">New fee structure</p>

      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. ND I Tuition & Fees"
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Academic session</span>
          <select
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Programme (optional — blank = all programmes)</span>
          <select
            value={programmeId}
            onChange={(e) => setProgrammeId(e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          >
            <option value="">All programmes</option>
            {programmes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Level (optional — blank = all levels)</span>
          <select
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          >
            <option value="">All levels</option>
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        <p className="text-sm text-muted">Fee items</p>
        {items.map((row, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <input
              value={row.name}
              onChange={(e) => updateItem(index, { name: e.target.value })}
              placeholder="Item name"
              className="flex-1 rounded-md border border-border px-3 py-2 text-sm focus:border-sky-dark focus:outline-none"
            />
            <input
              value={row.code}
              onChange={(e) => updateItem(index, { code: e.target.value })}
              placeholder="Code (optional)"
              className="w-32 rounded-md border border-border px-3 py-2 text-sm focus:border-sky-dark focus:outline-none"
            />
            <input
              value={row.amount}
              onChange={(e) => updateItem(index, { amount: e.target.value })}
              placeholder="Amount (₦)"
              type="number"
              min="0"
              className="w-32 rounded-md border border-border px-3 py-2 text-sm focus:border-sky-dark focus:outline-none"
            />
            <label className="flex items-center gap-1 text-xs text-muted">
              <input
                type="checkbox"
                checked={row.is_mandatory}
                onChange={(e) => updateItem(index, { is_mandatory: e.target.checked })}
              />
              Mandatory
            </label>
          </div>
        ))}
        <Button variant="ghost" onClick={() => setItems((rows) => [...rows, emptyRow()])}>
          + Add another item
        </Button>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)} aria-disabled={busy}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit} aria-disabled={busy || !name || !sessionId}>
          {busy ? "Creating…" : "Create fee structure"}
        </Button>
      </div>
    </div>
  );
}
