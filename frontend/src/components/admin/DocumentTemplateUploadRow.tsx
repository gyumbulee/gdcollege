"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Upload, CheckCircle2 } from "lucide-react";
import type { DocumentTemplateSetting } from "@/lib/api/admin";

export function DocumentTemplateUploadRow({ template }: { template: DocumentTemplateSetting }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setError(null);

    const form = new FormData();
    form.append("file", file);

    const response = await fetch(`/api/admin/document-templates/${template.id}/upload`, {
      method: "POST",
      body: form,
    });
    const result = await response.json();
    setBusy(false);

    if (!result.success) {
      setError(result.message ?? "Could not upload this file.");
      return;
    }

    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-4 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-sky-light text-sky-dark">
          <FileText size={18} aria-hidden />
        </span>
        <div>
          <p className="text-sm font-medium text-ink">{template.name}</p>
          <p className="text-xs text-muted">
            {template.type} · {template.requires_request ? "Staff-processed request" : "Generated instantly"}
          </p>
          {template.file_url ? (
            <a
              href={template.file_url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 text-xs text-sky-dark hover:underline"
            >
              <CheckCircle2 size={13} aria-hidden />
              {template.original_filename} — view current file
            </a>
          ) : (
            <p className="mt-1 text-xs text-muted">No reference file uploaded yet.</p>
          )}
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        </div>
      </div>

      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-sky-dark hover:text-sky-dark">
        <Upload size={15} aria-hidden />
        {busy ? "Uploading…" : template.file_url ? "Replace file" : "Upload file"}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          className="hidden"
          disabled={busy}
          onChange={handleChange}
        />
      </label>
    </div>
  );
}
