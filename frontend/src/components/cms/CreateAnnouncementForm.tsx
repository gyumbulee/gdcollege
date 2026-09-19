"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

const AUDIENCES = ["ALL", "STUDENTS", "STAFF", "SCHOOL", "DEPARTMENT", "PROGRAMME", "LEVEL"];

export function CreateAnnouncementForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audienceType, setAudienceType] = useState("ALL");
  const [audienceId, setAudienceId] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const needsAudienceId = !["ALL", "STUDENTS", "STAFF"].includes(audienceType);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/cms/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          audience_type: audienceType,
          audience_id: needsAudienceId && audienceId ? Number(audienceId) : undefined,
        }),
      });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not create the announcement." });
        return;
      }

      setMessage({ tone: "success", text: `${result.message} Remember to publish it — a draft never notifies anyone.` });
      setTitle("");
      setContent("");
      setAudienceType("ALL");
      setAudienceId("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">New announcement</p>
      <label className="mt-3 block text-sm text-muted">
        Title
        <input required value={title} onChange={(e) => setTitle(e.target.value)} className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted">
        Content
        <textarea required rows={4} value={content} onChange={(e) => setContent(e.target.value)} className={fieldClass} />
      </label>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="text-sm text-muted">
          Audience
          <select value={audienceType} onChange={(e) => setAudienceType(e.target.value)} className={fieldClass}>
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        {needsAudienceId && (
          <label className="text-sm text-muted">
            {audienceType.charAt(0) + audienceType.slice(1).toLowerCase()} ID
            <input
              type="number"
              value={audienceId}
              onChange={(e) => setAudienceId(e.target.value)}
              placeholder="e.g. the department's ID"
              className={fieldClass}
            />
          </label>
        )}
      </div>

      {message && (
        <p className={`mt-3 rounded-md px-3 py-2 text-sm ${message.tone === "success" ? "bg-sky-light text-sky-dark" : "bg-red-50 text-danger"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-4">
        <Button type="submit" variant="secondary" aria-disabled={submitting}>
          {submitting ? "Creating…" : "Create as draft"}
        </Button>
      </div>
    </form>
  );
}
