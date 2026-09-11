"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function StartApplicationCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/applications", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      const result = await response.json();
      if (!result.success) {
        setError(result.message ?? "Couldn't start an application right now.");
        return;
      }
      router.refresh();
    } catch {
      setError("Something went wrong reaching the server. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg rounded-lg border border-border bg-white p-8">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
        Begin your application
      </h1>
      <p className="mt-2 text-sm text-muted">
        You&apos;ll fill in your personal details, education history, and
        upload documents. You can save your progress and come back any
        time before submitting.
      </p>
      {error && (
        <p role="alert" className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <Button onClick={start} variant="primary" className="mt-6" aria-disabled={loading}>
        {loading ? "Starting…" : "Start application"}
      </Button>
    </div>
  );
}
