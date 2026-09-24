"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const STORAGE_KEY = "gdcollege_banner_shown_on";

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function BannerPopupClient({ bannerUrl, institutionName }: { bannerUrl: string; institutionName: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const lastShown = window.localStorage.getItem(STORAGE_KEY);
      if (lastShown === today()) return;
      window.localStorage.setItem(STORAGE_KEY, today());
      // One-time check against an external system (localStorage) on mount, not
      // a derived-from-props/state value — the recommended alternative (a lazy
      // useState initializer) would read localStorage during the client's first
      // render and mismatch the server-rendered (closed) HTML.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
    } catch {
      // localStorage unavailable (e.g. private browsing) — skip the popup rather than show it every load.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${institutionName} announcement`}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white"
        >
          <X className="h-4 w-4" />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={bannerUrl} alt={institutionName} className="max-h-[80vh] w-full object-contain" />
      </div>
    </div>
  );
}
