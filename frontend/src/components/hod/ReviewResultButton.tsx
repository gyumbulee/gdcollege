"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ReviewResultButton({ resultId }: { resultId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function review() {
    setBusy(true);
    setError(null);
    const response = await fetch(`/api/hod/results/${resultId}/review`, { method: "POST" });
    const result = await response.json();
    setBusy(false);
    if (!result.success) {
      setError(result.message ?? "Could not review this result.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-1">
      {error && <p className="text-xs text-danger">{error}</p>}
      <Button variant="primary" onClick={review} aria-disabled={busy}>
        {busy ? "Marking reviewed…" : "Mark reviewed"}
      </Button>
    </div>
  );
}
