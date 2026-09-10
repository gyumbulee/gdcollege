/**
 * countdown.config.ts
 *
 * SINGLE SOURCE OF TRUTH for the temporary "Coming Soon" gate.
 *
 * Nothing else in the codebase should hardcode a launch date, an enabled
 * flag, or the institution's contact details. Everything reads from here
 * (or from the environment variables this file wraps).
 *
 * TO DISABLE THE COUNTDOWN WHEN THE FULL PLATFORM LAUNCHES:
 *   Set NEXT_PUBLIC_COUNTDOWN_ENABLED=false in your environment, or flip
 *   the fallback below to `false`. Nothing else needs to change — see
 *   CountdownGate.tsx, which is the only component that reads this flag.
 */

export interface CountdownConfig {
  /** Whether the temporary gate should intercept the public root route. */
  enabled: boolean;
  /** ISO-8601 datetime (with offset) the countdown counts down to. */
  targetDate: string;
  institution: {
    formalName: string;
    shortName: string;
  };
  copy: {
    eyebrow: string;
    headline: string;
    intro: string;
    launchMessage: string;
    completedHeadline: string;
    completedMessage: string;
  };
  /**
   * Contact info is intentionally left blank until the College supplies it.
   * Do not invent phone numbers, emails, or addresses — see project rule
   * "Do not hardcode institutional contact information."
   */
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  /**
   * Path to the official banner/crest image, once supplied by the College.
   * Until then this stays null and the UI falls back to a drawn placeholder
   * emblem — never a fabricated photo.
   */
  bannerImageSrc: string | null;
}

const targetDateFallback = "2026-10-10T00:00:00+01:00"; // WAT, ~30 days out — adjust to the real date when confirmed

export const countdownConfig: CountdownConfig = {
  enabled: (process.env.NEXT_PUBLIC_COUNTDOWN_ENABLED ?? "true") !== "false",
  targetDate: process.env.NEXT_PUBLIC_COUNTDOWN_TARGET_DATE ?? targetDateFallback,
  institution: {
    formalName: "Goran Dutse College of General Studies Wase",
    shortName: "GD College Wase",
  },
  copy: {
    eyebrow: "GD College Wase",
    headline: "Our new platform is almost here.",
    intro:
      "We're building a complete digital home for admissions, academics, and student life at Goran Dutse College of General Studies Wase — so every stage of your journey, from application to graduation, happens in one place.",
    launchMessage: "Admissions open when the countdown ends. Check back soon, or leave your details below and we'll let you know first.",
    completedHeadline: "Applications are now open.",
    completedMessage: "The full platform has launched. Continue to the website to begin your application.",
  },
  contact: {
    email: null,
    phone: null,
    address: null,
  },
  bannerImageSrc: null,
};
