"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export type EntityField =
  | { name: string; label: string; type: "text" | "number" | "date" | "datetime-local"; required?: boolean }
  | { name: string; label: string; type: "textarea"; required?: boolean }
  | { name: string; label: string; type: "checkbox" }
  | { name: string; label: string; type: "select"; required?: boolean; options: { value: string | number; label: string }[] };

/**
 * One generic form for every simple academic-structure entity — avoids
 * nine near-identical hand-written forms. Pass `entityId` to switch it
 * into edit mode: PATCH `/{resource}/{entityId}` instead of POST
 * `/{resource}`, and the submitted values stay on screen afterward
 * instead of resetting to blank (there's nothing to "create again").
 */
export function AcademicEntityForm({
  resource,
  title,
  fields,
  defaults = {},
  entityId,
}: {
  resource: string;
  title: string;
  fields: EntityField[];
  defaults?: Record<string, string | number | boolean>;
  entityId?: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string | number | boolean>>(defaults);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function setValue(name: string, value: string | number | boolean) {
    setValues((v) => ({ ...v, [name]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const url = entityId ? `/api/admin/academics/${resource}/${entityId}` : `/api/admin/academics/${resource}`;
      const response = await fetch(url, {
        method: entityId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not save." });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      if (!entityId) setValues(defaults);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">{title}</p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {fields.map((field) => (
          <label key={field.name} className={`text-sm text-muted ${field.type === "textarea" ? "sm:col-span-2" : ""}`}>
            {field.label}
            {field.type === "textarea" ? (
              <textarea
                rows={2}
                value={(values[field.name] as string) ?? ""}
                onChange={(e) => setValue(field.name, e.target.value)}
                className={fieldClass}
              />
            ) : field.type === "checkbox" ? (
              <input
                type="checkbox"
                checked={Boolean(values[field.name])}
                onChange={(e) => setValue(field.name, e.target.checked)}
                className="ml-2"
              />
            ) : field.type === "select" ? (
              <select
                required={field.required}
                value={(values[field.name] as string) ?? ""}
                onChange={(e) => setValue(field.name, e.target.value)}
                className={fieldClass}
              >
                <option value="">Select…</option>
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type}
                required={field.required}
                value={(values[field.name] as string) ?? ""}
                onChange={(e) => setValue(field.name, e.target.value)}
                className={fieldClass}
              />
            )}
          </label>
        ))}
      </div>

      {message && (
        <p className={`mt-3 rounded-md px-3 py-2 text-sm ${message.tone === "success" ? "bg-sky-light text-sky-dark" : "bg-red-50 text-danger"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-4">
        <Button type="submit" variant="secondary" aria-disabled={submitting}>
          {submitting ? "Saving…" : entityId ? "Save changes" : `Create ${title.toLowerCase()}`}
        </Button>
      </div>
    </form>
  );
}
