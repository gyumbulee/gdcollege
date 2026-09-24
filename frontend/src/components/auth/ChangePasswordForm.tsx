"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/Button";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const response = await fetch("/api/account/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: currentPassword,
          password,
          password_confirmation: passwordConfirmation,
        }),
      });
      const result = await response.json();

      if (!result.success) {
        setError(result.message ?? "Could not change your password.");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirmation("");
    } catch {
      setError("Something went wrong reaching the server. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <div>
        <label htmlFor="current_password" className="block text-sm font-medium text-ink">
          Current password
        </label>
        <input
          id="current_password"
          type="password"
          required
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark"
        />
      </div>

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
      {success && (
        <p className="rounded-md bg-sky-light px-3 py-2 text-sm text-sky-dark">
          Your password has been changed. You&apos;ve been signed out of every other device.
        </p>
      )}

      <Button type="submit" variant="primary" className="w-full" aria-disabled={submitting}>
        {submitting ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
