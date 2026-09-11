/**
 * institution.config.ts
 *
 * SINGLE SOURCE OF TRUTH for institutional identity and branding.
 *
 * Per the platform specification: institution name, short name, brand
 * colour, logo location, and banner location must each live in exactly
 * one place. Nothing else in the codebase should hardcode these values —
 * import them from here instead.
 *
 * WHERE TO PLACE OFFICIAL ASSETS
 * -------------------------------
 * - College logo / seal   → public/branding/logo.png   (and update `logoSrc` below)
 * - College banner/image  → public/branding/banner.jpg (and update `bannerSrc` below)
 * - Favicon               → src/app/favicon.ico
 *
 * Until official assets are supplied, `logoSrc` / `bannerSrc` are `null`
 * and the UI falls back to the drawn placeholder mark in
 * `src/components/brand/CrestMark.tsx`. Do NOT fabricate a logo or photograph
 * — leave these `null` until a real asset is supplied, and swap them in here.
 *
 * WHERE TO CHANGE INSTITUTION NAME / SHORT NAME / BRAND COLOUR
 * --------------------------------------------------------------
 * Edit the values below. That is the only place they should be defined.
 * Later, once Phase 21 (System Administration) exists, these can move to
 * database-backed institution settings — but the shape of this file should
 * stay the single import site the rest of the app depends on.
 */

export const institutionConfig = {
  identity: {
    formalName: "Goran Dutse College of General Studies Wase",
    shortName: "GD College Wase",
    /** Set once confirmed by the Registrar. Leave null rather than guess. */
    motto: null as string | null,
  },

  location: {
    /** Leave null until confirmed by an official source. */
    address: null as string | null,
    city: "Wase",
    state: "Plateau State",
    country: "Nigeria",
  },

  contact: {
    phone: null as string | null,
    email: null as string | null,
  },

  /** Official brand assets. Null = not yet supplied; UI uses placeholders. */
  assets: {
    logoSrc: null as string | null, // e.g. "/branding/logo.png"
    bannerSrc: null as string | null, // e.g. "/branding/banner.jpg"
  },

  /**
   * Brand palette — sky blue as the primary institutional colour, per spec.
   * Mirrored as CSS custom properties in `src/app/globals.css` (@theme block).
   * Change the colour HERE and in globals.css together; these two files are
   * the only places a brand hex should appear.
   */
  colors: {
    skyPrimary: "#38BDF8",
    skyDark: "#0369A1",
    skyLight: "#E0F2FE",
    background: "#F8FAFC",
    white: "#FFFFFF",
    ink: "#0F172A",
    muted: "#64748B",
    border: "#E2E8F0",
    accent: "#F59E0B", // used sparingly: admissions CTAs, highlights
    success: "#16A34A",
    warning: "#F59E0B",
    danger: "#DC2626",
  },

  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Academics", href: "/academics" },
    { label: "Admissions", href: "/admissions" },
    { label: "News", href: "/news" },
    { label: "Events", href: "/events" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],
} as const;

export type InstitutionConfig = typeof institutionConfig;
