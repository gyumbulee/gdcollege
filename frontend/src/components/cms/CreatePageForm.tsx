"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function CreatePageForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/cms/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, status }),
      });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not create the page." });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      setTitle("");
      setContent("");
      setStatus("DRAFT");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">New page</p>
      <label className="mt-3 block text-sm text-muted">
        Title
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted">
        Content
        <textarea required rows={6} value={content} onChange={(e) => setContent(e.target.value)} className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted sm:max-w-xs">
        Status
        <select value={status} onChange={(e) => setStatus(e.target.value)} className={fieldClass}>
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </label>

      {message && (
        <p className={`mt-3 rounded-md px-3 py-2 text-sm ${message.tone === "success" ? "bg-sky-light text-sky-dark" : "bg-red-50 text-danger"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-4">
        <Button type="submit" variant="secondary" aria-disabled={submitting}>
          {submitting ? "Creating…" : "Create page"}
        </Button>
      </div>
    </form>
  );
}
