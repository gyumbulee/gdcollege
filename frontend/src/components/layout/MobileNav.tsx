"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { SessionUser } from "@/types/auth";

type NavItem = { label: string; href: string };

export function MobileNav({
  nav,
  session,
}: {
  nav: readonly NavItem[];
  session: SessionUser | null;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await fetch("/api/session/logout", { method: "POST" });
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center rounded-md border border-border text-ink"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          {open ? (
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          ) : (
            <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-30 border-b border-border bg-white px-5 pb-6 pt-2 shadow-sm">
          <nav className="flex flex-col divide-y divide-border">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {session ? (
              <>
                <p className="text-sm text-muted">Signed in as {session.name}</p>
                <Button href="/portal" variant="ghost" onClick={() => setOpen(false)}>
                  My Portal
                </Button>
                <Button href="/account" variant="ghost" onClick={() => setOpen(false)}>
                  My Account
                </Button>
                <Button variant="secondary" onClick={handleSignOut} aria-disabled={signingOut}>
                  {signingOut ? "Signing out…" : "Sign out"}
                </Button>
              </>
            ) : (
              <>
                <Button href="/student/login" variant="ghost" onClick={() => setOpen(false)}>
                  Login
                </Button>
                <Button href="/admissions/application" variant="primary" onClick={() => setOpen(false)}>
                  Apply Now
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
