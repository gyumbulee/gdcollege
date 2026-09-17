"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function UserStatusToggle({ userId, status }: { userId: number; status: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const nextStatus = status === "active" ? "suspended" : "active";

  async function handleClick() {
    setSubmitting(true);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Button type="button" variant="ghost" onClick={handleClick} aria-disabled={submitting}>
      {status === "active" ? "Suspend" : "Reactivate"}
    </Button>
  );
}
