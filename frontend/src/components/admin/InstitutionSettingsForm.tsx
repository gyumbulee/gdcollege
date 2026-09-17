"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { InstitutionSettings } from "@/lib/api/admin";

export function InstitutionSettingsForm({ settings }: { settings: InstitutionSettings }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/institution", { method: "POST", body: form });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not save institution settings." });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "Something went wrong reaching the server." });
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-white p-5">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm text-muted">
          Formal name
          <input name="formal_name" defaultValue={settings.formal_name} className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          Short name
          <input name="short_name" defaultValue={settings.short_name} className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          Motto
          <input name="motto" defaultValue={settings.motto ?? ""} className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          Phone
          <input name="phone" defaultValue={settings.phone ?? ""} className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          Email
          <input name="email" type="email" defaultValue={settings.email ?? ""} className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          Address
          <input name="address" defaultValue={settings.address ?? ""} className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          City
          <input name="city" defaultValue={settings.city ?? ""} className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          State
          <input name="state" defaultValue={settings.state ?? ""} className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          Country
          <input name="country" defaultValue={settings.country} className={fieldClass} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 sm:grid-cols-2">
        <label className="text-sm text-muted">
          Logo
          {settings.logo_url && <img src={settings.logo_url} alt="Current logo" className="mt-1 h-12 w-12 rounded object-contain" />}
          <input name="logo" type="file" accept="image/*" className={fieldClass} />
        </label>
        <label className="text-sm text-muted">
          Banner
          {settings.banner_url && <img src={settings.banner_url} alt="Current banner" className="mt-1 h-12 w-24 rounded object-cover" />}
          <input name="banner" type="file" accept="image/*" className={fieldClass} />
        </label>
      </div>

      {message && (
        <p className={`rounded-md px-3 py-2 text-sm ${message.tone === "success" ? "bg-sky-light text-sky-dark" : "bg-red-50 text-danger"}`}>
          {message.text}
        </p>
      )}

      <div>
        <Button type="submit" variant="secondary" aria-disabled={submitting}>
          {submitting ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
