"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function UploadDownloadForm() {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/cms/downloads", { method: "POST", body: form });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not upload the file." });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      event.currentTarget.reset();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">Upload a file</p>
      <label className="mt-3 block text-sm text-muted">
        Title
        <input name="title" required className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted sm:max-w-xs">
        Category (optional)
        <input name="category" className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted">
        File
        <input name="file" type="file" required className={fieldClass} />
      </label>

      {message && (
        <p className={`mt-3 rounded-md px-3 py-2 text-sm ${message.tone === "success" ? "bg-sky-light text-sky-dark" : "bg-red-50 text-danger"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-4">
        <Button type="submit" variant="secondary" aria-disabled={submitting}>
          {submitting ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </form>
  );
}
