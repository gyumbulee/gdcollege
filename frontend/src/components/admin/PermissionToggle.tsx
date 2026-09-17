"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function PermissionToggle({
  roleId,
  roleSlug,
  permissionId,
  permissionSlug,
  granted,
}: {
  roleId: number;
  roleSlug: string;
  permissionId: number;
  permissionSlug: string;
  granted: boolean;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const disabled = submitting || roleSlug === "super_administrator";

  async function handleChange() {
    setSubmitting(true);
    try {
      await fetch(`/api/admin/roles/${roleId}/permissions/${permissionId}/toggle`, { method: "POST" });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <label className="flex items-center gap-2 text-xs text-ink">
      <input type="checkbox" checked={granted} disabled={disabled} onChange={handleChange} />
      {permissionSlug}
    </label>
  );
}
