"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/session/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password, password_confirmation: passwordConfirmation }),
      });
      const result = await response.json();

      if (!result.success) {
        setError(result.message ?? "This password reset link is invalid or has expired.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/student/login"), 2000);
    } catch {
      setError("Something went wrong reaching the server. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token || !email) {
    return (
      <p role="alert" className="w-full max-w-sm rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
        This password reset link is missing its token or email. Request a new one from the{" "}
        <a href="/forgot-password" className="underline">forgot password</a> page.
      </p>
    );
  }

  if (success) {
    return (
      <p className="w-full max-w-sm rounded-md bg-sky-light px-3 py-2 text-sm text-sky-dark">
        Your password has been reset. Redirecting you to sign in…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-ink">
          New password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark"
        />
      </div>

      <div>
        <label htmlFor="password_confirmation" className="block text-sm font-medium text-ink">
          Confirm new password
        </label>
        <input
          id="password_confirmation"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={passwordConfirmation}
          onChange={(e) => setPasswordConfirmation(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" className="w-full" aria-disabled={submitting}>
        {submitting ? "Resetting…" : "Reset password"}
      </Button>
    </form>
  );
}
