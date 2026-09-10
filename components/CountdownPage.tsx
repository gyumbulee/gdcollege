"use client";

import { useCountdown } from "../hooks/useCountdown";
import { countdownConfig } from "../config/countdown.config";

const UNITS: Array<{ key: "days" | "hours" | "minutes" | "seconds"; label: string }> = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

function Seal() {
  // Drawn placeholder emblem — swapped for the official crest/banner once
  // supplied, via countdownConfig.bannerImageSrc. Never a fabricated photo.
  return (
    <svg
      viewBox="0 0 120 120"
      className="h-20 w-20 sm:h-24 sm:w-24"
      role="img"
      aria-label="GD College Wase emblem placeholder"
    >
      <circle cx="60" cy="60" r="58" fill="none" stroke="#0369A1" strokeWidth="2" />
      <circle cx="60" cy="60" r="49" fill="none" stroke="#38BDF8" strokeWidth="1.5" />
      <path
        d="M60 34 L74 70 L46 70 Z"
        fill="none"
        stroke="#0369A1"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <line x1="60" y1="70" x2="60" y2="86" stroke="#0369A1" strokeWidth="2.5" />
      <circle cx="60" cy="60" r="3" fill="#38BDF8" />
    </svg>
  );
}

export default function CountdownPage() {
  const { copy, institution, targetDate, contact } = countdownConfig;
  const countdown = useCountdown(targetDate);
  const hasContact = contact.email || contact.phone || contact.address;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-[#0F172A]">
      {/* Subtle top wash — sky blue is used deliberately, not everywhere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{
          background:
            "radial-gradient(120% 100% at 50% -20%, #E0F2FE 0%, rgba(224,242,254,0) 70%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col items-center px-6 py-16 text-center sm:py-24">
        <Seal />

        <p className="mt-6 text-sm font-medium tracking-wide text-[#0369A1]">
          {institution.formalName}
        </p>

        {countdown.isComplete ? (
          <>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-[#0F172A] sm:text-5xl">
              {copy.completedHeadline}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#64748B] sm:text-lg">
              {copy.completedMessage}
            </p>
            <a
              href="/admissions"
              className="mt-9 inline-flex items-center justify-center rounded-md bg-[#38BDF8] px-7 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:bg-[#0369A1] hover:text-white"
            >
              Begin your application
            </a>
          </>
        ) : (
          <>
            <h1 className="mt-4 font-serif text-4xl leading-tight text-[#0F172A] sm:text-5xl">
              {copy.headline}
            </h1>

            <p className="mt-5 max-w-xl text-base leading-relaxed text-[#64748B] sm:text-lg">
              {copy.intro}
            </p>

            <div className="mt-12 grid w-full max-w-md grid-cols-4 gap-2 sm:gap-4" role="timer" aria-live="polite" aria-atomic="true">
              {UNITS.map((unit, i) => (
                <div key={unit.key} className="flex flex-col items-center">
                  <div
                    className={`flex h-16 w-full items-center justify-center rounded-md border border-[#E2E8F0] bg-white sm:h-20 ${
                      i === 0 ? "shadow-[inset_0_0_0_1px_#38BDF8]" : ""
                    }`}
                  >
                    <span className="font-serif text-2xl tabular-nums text-[#0F172A] sm:text-4xl">
                      {String(countdown[unit.key]).padStart(2, "0")}
                    </span>
                  </div>
                  <span className="mt-2 text-xs text-[#64748B] sm:text-sm">{unit.label}</span>
                </div>
              ))}
            </div>

            <p className="mt-10 max-w-md text-sm leading-relaxed text-[#64748B]">
              {copy.launchMessage}
            </p>
          </>
        )}

        <div className="mt-auto w-full pt-16">
          <div className="mx-auto h-px w-16 bg-[#E2E8F0]" />
          {hasContact ? (
            <p className="mt-6 text-xs text-[#64748B]">
              {[contact.email, contact.phone, contact.address].filter(Boolean).join(" · ")}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-[#64748B]">
            &copy; {new Date().getFullYear()} {institution.shortName}. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
