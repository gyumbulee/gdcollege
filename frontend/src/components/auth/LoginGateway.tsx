"use client";

import { Suspense, useState } from "react";
import { Briefcase, GraduationCap, FileEdit, ArrowLeft } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";

type Category = "staff" | "student" | "applicant";

const CATEGORIES: Array<{
  key: Category;
  title: string;
  description: string;
  icon: typeof Briefcase;
}> = [
  {
    key: "staff",
    title: "Staff",
    description: "Lecturers, HODs, and all administrative offices.",
    icon: Briefcase,
  },
  {
    key: "student",
    title: "Student",
    description: "Registered students with a matriculation number.",
    icon: GraduationCap,
  },
  {
    key: "applicant",
    title: "Applicant",
    description: "Tracking or continuing an admission application.",
    icon: FileEdit,
  },
];

/**
 * Sign-in is a single unified account system underneath (one endpoint,
 * one session shape — see /api/session/login and LoginForm) — the
 * category picker below is purely a UX affordance so each visitor sees
 * only the framing relevant to them before typing credentials. Whichever
 * category is tapped, a successful sign-in still redirects to the
 * account's *actual* role-based dashboard (see lib/auth/dashboard.ts),
 * not to whatever was clicked here.
 */
export function LoginGateway() {
  const [category, setCategory] = useState<Category | null>(null);

  if (!category) {
    return (
      <div className="w-full max-w-3xl">
        <p className="text-sm text-muted">Who&apos;s signing in?</p>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {CATEGORIES.map(({ key, title, description, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className="flex flex-col items-start gap-3 rounded-lg border border-border bg-white p-5 text-left transition-colors hover:border-sky-dark hover:bg-sky-light/30 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-light text-sky-dark">
                <Icon size={22} strokeWidth={1.75} aria-hidden />
              </span>
              <span className="font-[family-name:var(--font-display)] text-lg text-ink">{title}</span>
              <span className="text-sm text-muted">{description}</span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted">
          Applying for the first time?{" "}
          <a href="/admissions/register" className="text-sky-dark hover:underline">
            Create an applicant account
          </a>
          .
        </p>
      </div>
    );
  }

  const active = CATEGORIES.find((c) => c.key === category)!;

  return (
    <div className="w-full max-w-sm">
      <button
        type="button"
        onClick={() => setCategory(null)}
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted hover:text-sky-dark"
      >
        <ArrowLeft size={16} aria-hidden />
        Choose a different account type
      </button>

      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-light text-sky-dark">
          <active.icon size={20} strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg text-ink">{active.title} sign in</p>
          <p className="text-xs text-muted">{active.description}</p>
        </div>
      </div>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
