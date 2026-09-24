"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function CreateGalleryForm({ hasFeatured = false }: { hasFeatured?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"STANDARD" | "FEATURED">("STANDARD");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/cms/galleries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description: description || undefined, type }),
      });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not create the gallery." });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      setTitle("");
      setDescription("");
      setType("STANDARD");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">New album</p>
      <label className="mt-3 block text-sm text-muted">
        Title
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted">
        Description (optional)
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className={fieldClass} />
      </label>

      <fieldset className="mt-3">
        <legend className="text-sm text-muted">Album type</legend>
        <div className="mt-2 flex flex-col gap-2 text-sm text-ink">
          <label className="flex items-start gap-2">
            <input type="radio" name="gallery-type" checked={type === "STANDARD"} onChange={() => setType("STANDARD")} className="mt-0.5" />
            <span>
              Standard album <span className="text-muted">— listed publicly at /gallery</span>
            </span>
          </label>
          <label className={`flex items-start gap-2 ${hasFeatured ? "opacity-50" : ""}`}>
            <input
              type="radio"
              name="gallery-type"
              checked={type === "FEATURED"}
              disabled={hasFeatured}
              onChange={() => setType("FEATURED")}
              className="mt-0.5"
            />
            <span>
              Homepage carousel <span className="text-muted">— shown in the homepage carousel only, not on the public gallery page</span>
            </span>
          </label>
          {hasFeatured && (
            <p className="text-xs text-muted">
              A homepage carousel album already exists — open it below to add or remove its photos.
            </p>
          )}
        </div>
      </fieldset>

      {message && (
        <p className={`mt-3 rounded-md px-3 py-2 text-sm ${message.tone === "success" ? "bg-sky-light text-sky-dark" : "bg-red-50 text-danger"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-4">
        <Button type="submit" variant="secondary" aria-disabled={submitting}>
          {submitting ? "Creating…" : "Create album"}
        </Button>
      </div>
    </form>
  );
}
