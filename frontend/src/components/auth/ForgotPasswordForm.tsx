"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await fetch("/api/session/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      setMessage(result.message ?? "If an account exists for that email address, a password reset link has been sent.");
    } catch {
      setMessage("Something went wrong reaching the server. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (message) {
    return (
      <p className="w-full max-w-sm rounded-md bg-sky-light px-3 py-2 text-sm text-sky-dark">
        {message}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark"
        />
      </div>

      <Button type="submit" variant="primary" className="w-full" aria-disabled={submitting}>
        {submitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
