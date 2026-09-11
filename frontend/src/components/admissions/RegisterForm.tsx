"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", password_confirmation: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/session/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const result = await response.json();

      if (!result.success) {
        setError(result.message ?? "Couldn't create your account. Check your details and try again.");
        return;
      }

      router.push("/admissions/application");
      router.refresh();
    } catch {
      setError("Something went wrong reaching the server. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
      <Field label="Full name" id="name" value={form.name} onChange={(v) => update("name", v)} autoComplete="name" />
      <Field label="Email" id="email" type="email" value={form.email} onChange={(v) => update("email", v)} autoComplete="email" />
      <Field label="Phone (optional)" id="phone" value={form.phone} onChange={(v) => update("phone", v)} autoComplete="tel" required={false} />
      <Field label="Password" id="password" type="password" value={form.password} onChange={(v) => update("password", v)} autoComplete="new-password" />
      <Field
        label="Confirm password"
        id="password_confirmation"
        type="password"
        value={form.password_confirmation}
        onChange={(v) => update("password_confirmation", v)}
        autoComplete="new-password"
      />

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <Button type="submit" variant="primary" className="w-full" aria-disabled={submitting}>
        {submitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-xs text-muted">
        Already have an account?{" "}
        <a href="/student/login" className="text-sky-dark hover:underline">
          Sign in
        </a>
        .
      </p>
    </form>
  );
}

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  autoComplete,
  required = true,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink focus:border-sky-dark"
      />
    </div>
  );
}
