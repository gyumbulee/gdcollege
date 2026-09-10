"use client";

import { useCountdown } from "../hooks/useCountdown";
import { countdownConfig } from "../config/countdown.config";

const UNITS: Array<{ key: "days" | "hours" | "minutes" | "seconds"; label: string }> = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

export default function CountdownPage() {
  const { copy, institution, targetDate, contact, motto, bannerImageSrc } = countdownConfig;
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

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:px-10">
        {/* Left column — text + countdown */}
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="text-sm font-medium tracking-wide text-[#0369A1]">
            {institution.formalName}
          </p>
          {motto ? <p className="mt-1 text-xs italic text-[#64748B]">"{motto}"</p> : null}

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

              <div
                className="mt-12 grid w-full max-w-md grid-cols-4 gap-2 sm:gap-4"
                role="timer"
                aria-live="polite"
                aria-atomic="true"
              >
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

          <div className="mt-16 w-full pt-8 lg:mt-auto">
            <div className="mx-auto h-px w-16 bg-[#E2E8F0] lg:mx-0" />
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

        {/* Right column — official banner */}
        {bannerImageSrc ? (
          <div className="mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-[#E2E8F0] bg-white shadow-sm lg:max-w-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={bannerImageSrc}
              alt={`${institution.formalName} — official admission notice`}
              className="w-full"
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
