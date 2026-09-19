"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function CmsActionButton({
  href,
  method,
  label,
  confirmMessage,
  variant = "ghost",
  jsonBody,
}: {
  href: string;
  method: "POST" | "DELETE" | "PATCH";
  label: string;
  confirmMessage?: string;
  variant?: "ghost" | "secondary";
  jsonBody?: Record<string, unknown>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;

    setPending(true);
    try {
      await fetch(href, {
        method,
        ...(jsonBody ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(jsonBody) } : {}),
      });
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" variant={variant} onClick={handleClick} aria-disabled={pending}>
      {label}
    </Button>
  );
}
