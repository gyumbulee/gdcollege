"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AddGalleryItemForm({ galleryId }: { galleryId: number }) {
  const router = useRouter();
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const form = new FormData(event.currentTarget);
      const response = await fetch(`/api/admin/cms/galleries/${galleryId}/items`, { method: "POST", body: form });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not add the photo." });
        return;
      }

      event.currentTarget.reset();
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">Add a photo</p>
      <label className="mt-3 block text-sm text-muted">
        Image
        <input name="image" type="file" accept="image/*" required className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted">
        Caption (optional)
        <input name="caption" className={fieldClass} />
      </label>

      {message && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{message.text}</p>
      )}

      <div className="mt-4">
        <Button type="submit" variant="secondary" aria-disabled={submitting}>
          {submitting ? "Uploading…" : "Add photo"}
        </Button>
      </div>
    </form>
  );
}
