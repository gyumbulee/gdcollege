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
   * Contact info, sourced directly from the official college banner supplied
   * 2026-09-09 (IMG-20260909-WA0013.jpg). Do not edit these to values that
   * aren't printed on an official, supplied asset — see project rule
   * "Do not hardcode institutional contact information."
   */
  contact: {
    email: string | null;
    phone: string | null;
    address: string | null;
  };
  /** Motto as printed on the official banner. */
  motto: string;
  /**
   * Path to the official banner image, supplied by the College on
   * 2026-09-09. Swap this if a newer/cropped asset is provided later —
   * nothing else needs to change.
   */
  bannerImageSrc: string | null;
  /**
   * Small circular crest, cropped from the corner of the official banner
   * above. Used in the page header in place of the drawn placeholder.
   */
  crestImageSrc: string | null;
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
    phone: "08034592011, 07089154460",
    address: "No. 13B Along Dengi Road, Wase, Plateau State",
  },
  motto: "Knowledge for Development",
  bannerImageSrc: "/images/gdcollege-banner.jpg",
  crestImageSrc: "/images/gdcollege-crest.png",
};
