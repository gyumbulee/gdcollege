"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function CreatePostForm() {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch("/api/admin/cms/posts", { method: "POST", body: form });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not create the post." });
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
      <p className="font-medium text-ink">New article</p>
      <label className="mt-3 block text-sm text-muted">
        Title
        <input name="title" required className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted">
        Excerpt (optional)
        <input name="excerpt" className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted">
        Content
        <textarea name="content" required rows={6} className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted">
        Cover image (optional)
        <input name="cover_image" type="file" accept="image/*" className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted sm:max-w-xs">
        Status
        <select name="status" defaultValue="DRAFT" className={fieldClass}>
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
          {submitting ? "Creating…" : "Create article"}
        </Button>
      </div>
    </form>
  );
}
