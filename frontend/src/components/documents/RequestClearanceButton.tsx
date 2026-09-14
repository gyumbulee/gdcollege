"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function RequestClearanceButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const response = await fetch("/api/student/clearance/request", { method: "POST" });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not start clearance.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-start gap-2">
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button variant="primary" onClick={submit} aria-disabled={busy}>
        {busy ? "Starting…" : "Start Clearance"}
      </Button>
    </div>
  );
}
