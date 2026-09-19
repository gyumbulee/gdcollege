"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function CreateFaqForm() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/admin/cms/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, answer, category: category || undefined }),
      });
      const result = await response.json();

      if (!result.success) {
        setMessage({ tone: "error", text: result.message ?? "Could not create the FAQ." });
        return;
      }

      setMessage({ tone: "success", text: result.message });
      setQuestion("");
      setAnswer("");
      setCategory("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">New FAQ</p>
      <label className="mt-3 block text-sm text-muted">
        Question
        <input required value={question} onChange={(e) => setQuestion(e.target.value)} className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted">
        Answer
        <textarea required rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} className={fieldClass} />
      </label>
      <label className="mt-3 block text-sm text-muted sm:max-w-xs">
        Category (optional)
        <input value={category} onChange={(e) => setCategory(e.target.value)} className={fieldClass} />
      </label>

      {message && (
        <p className={`mt-3 rounded-md px-3 py-2 text-sm ${message.tone === "success" ? "bg-sky-light text-sky-dark" : "bg-red-50 text-danger"}`}>
          {message.text}
        </p>
      )}

      <div className="mt-4">
        <Button type="submit" variant="secondary" aria-disabled={submitting}>
          {submitting ? "Creating…" : "Create FAQ"}
        </Button>
      </div>
    </form>
  );
}
