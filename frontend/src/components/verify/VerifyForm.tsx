"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function VerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!code.trim()) return;
    router.push(`/verify/${encodeURIComponent(code.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-md flex-col gap-3 sm:flex-row">
      <input
        type="text"
        required
        placeholder="e.g. GDCW-2026-000123"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        aria-label="Document verification code"
        className="flex-1 rounded-md border border-border bg-white px-3 py-2.5 text-sm text-ink focus:border-sky-dark"
      />
      <Button type="submit" variant="primary">
        Verify
      </Button>
    </form>
  );
}
