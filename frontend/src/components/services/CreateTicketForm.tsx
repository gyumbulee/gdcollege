"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export function CreateTicketForm() {
  const router = useRouter();
  const [category, setCategory] = useState("General");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category, subject, description, priority }),
    });
    const result = await response.json();
    setBusy(false);

    if (!result.success) {
      setError(result.message ?? "Could not create this ticket.");
      return;
    }

    router.push(`/tickets/${result.data.id}`);
  }

  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">New support ticket</p>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}

      <div className="mt-4 flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Category</span>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-muted">Priority</span>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Subject</span>
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-muted">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="rounded-md border border-border px-3 py-2 focus:border-sky-dark focus:outline-none"
          />
        </label>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="primary" onClick={submit} aria-disabled={busy || !subject || !description}>
          {busy ? "Submitting…" : "Submit ticket"}
        </Button>
      </div>
    </div>
  );
}
