"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import type { AdminPage } from "@/lib/api/admin-cms";

/**
 * The gap this closes: /admin/cms/pages could create and delete pages
 * but never edit one — the backend PATCH endpoint (and its Next.js
 * proxy) already worked, nothing in the frontend ever called it. Same
 * shape of gap as Academic Sessions before SessionEditToggle.tsx.
 */
export function PageEditToggle({ page }: { page: AdminPage }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(page.title);
  const [content, setContent] = useState(page.content);
  const [status, setStatus] = useState(page.status);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/cms/pages/${page.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, status }),
      });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not save." });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <div className="w-full">
      <button type="button" onClick={() => setOpen((v) => !v)} className="text-xs text-sky-dark hover:underline">
        {open ? "Close" : "Edit"}
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="mt-3 rounded-lg border border-border bg-white p-4">
          <label className="block text-sm text-muted">
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
              {submitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
