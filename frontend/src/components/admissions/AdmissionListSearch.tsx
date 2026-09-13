"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

type Result = {
  application_number: string;
  applicant_name: string;
  programme: string | null;
  decision: "ADMIT" | "HOLD" | "REJECT";
  decided_at: string;
};

const DECISION_LABEL: Record<Result["decision"], string> = {
  ADMIT: "Admitted",
  HOLD: "On hold",
  REJECT: "Not admitted",
};

export function AdmissionListSearch() {
  const [applicationNumber, setApplicationNumber] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!applicationNumber.trim()) return;

    setLoading(true);
    setResult(null);
    setNotFound(false);

    try {
      const response = await fetch(
        `/api/admission-list/search?application_number=${encodeURIComponent(applicationNumber.trim())}`
      );
      const json = await response.json();
      if (json.success) {
        setResult(json.data);
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          required
          placeholder="Application number, e.g. APP/20262027/000123"
          value={applicationNumber}
          onChange={(e) => setApplicationNumber(e.target.value)}
          aria-label="Application number"
          className="flex-1 rounded-md border border-border bg-white px-3 py-2.5 text-sm text-ink focus:border-sky-dark"
        />
        <Button type="submit" variant="primary" aria-disabled={loading}>
          {loading ? "Checking…" : "Check status"}
        </Button>
      </form>

      {result && (
        <div className="mt-6 rounded-lg border border-border bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="font-medium text-ink">{result.applicant_name}</p>
            <Badge tone={result.decision === "ADMIT" ? "sky" : result.decision === "HOLD" ? "amber" : "muted"}>
              {DECISION_LABEL[result.decision]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">{result.programme ?? "Programme not on record"}</p>
          <p className="mt-3 text-xs text-muted">{result.application_number}</p>
        </div>
      )}

      {notFound && (
        <div className="mt-6">
          <EmptyState
            title="No decision found"
            description="Check the application number and try again — a decision may not have been recorded yet."
          />
        </div>
      )}
    </div>
  );
}
