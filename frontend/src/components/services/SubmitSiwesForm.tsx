"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function SubmitSiwesForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    organization_name: "",
    organization_address: "",
    supervisor_name: "",
    supervisor_phone: "",
    supervisor_email: "",
    start_date: "",
    end_date: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/student/siwes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    setBusy(false);

    if (!result.success) {
      setError(result.message ?? "Could not submit this placement.");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  if (!open) {
    return (
      <Button variant="primary" onClick={() => setOpen(true)}>
        Submit SIWES placement
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">Submit SIWES placement</p>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Organization name</span>
          <input
            value={form.organization_name}
            onChange={(e) => set("organization_name", e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Organization address</span>
          <input
            value={form.organization_address}
            onChange={(e) => set("organization_address", e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Supervisor name</span>
          <input
            value={form.supervisor_name}
            onChange={(e) => set("supervisor_name", e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Supervisor phone</span>
          <input
            value={form.supervisor_phone}
            onChange={(e) => set("supervisor_phone", e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Start date</span>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => set("start_date", e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">End date</span>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => set("end_date", e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setOpen(false)} aria-disabled={busy}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={submit}
          aria-disabled={busy || !form.organization_name || !form.start_date || !form.end_date}
        >
          {busy ? "Submitting…" : "Submit"}
        </Button>
      </div>
    </div>
  );
}
