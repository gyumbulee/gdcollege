# GD College Wase — Frontend (Next.js)

## Run it

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

`npm run build` has been verified to compile cleanly in this phase.

## Where things live

| What | Where |
|---|---|
| Institution name, short name, brand colours | `src/config/institution.config.ts` |
| College logo | `public/branding/logo.png` (set `assets.logoSrc` in the config once supplied) |
| College banner | `public/branding/banner.jpg` (set `assets.bannerSrc` in the config once supplied) |
| Design tokens (CSS variables) | `src/app/globals.css` (`@theme` block — must mirror the hex values in `institution.config.ts`) |
| Reusable UI primitives | `src/components/ui/` (Button, Container, Badge, EmptyState) |
| Site chrome | `src/components/layout/` (SiteHeader, MobileNav, SiteFooter, ComingSoon) |
| Homepage sections | `src/components/home/` |

Until an official logo/banner is supplied, the UI falls back to a drawn
placeholder crest (`src/components/brand/CrestMark.tsx`) rather than a
fabricated image.

## Structure

```
src/
  app/            route segments (App Router) — currently: public homepage
                  + stub pages for nav destinations not yet built
  components/
    ui/           generic, content-agnostic primitives
    layout/       header/footer/nav/ComingSoon
    home/         homepage-specific sections
    brand/        crest mark + loading spinner
  config/         institution.config.ts — single source of truth
```

Routes under `(applicant)/`, `(student)/`, `(lecturer)/`, `(hod)/`,
`(admin)/`, etc. are added phase-by-phase per the implementation order in
`../docs/PROJECT_STATUS.md` — they don't exist yet, by design.

## Notes on this phase's choices

- **Fonts** use system serif/sans stacks, not `next/font/google` — this
  build environment has no outbound access to Google Fonts. Self-host a
  serif (e.g. Source Serif 4) and a sans (e.g. Inter) under a `public/fonts`
  folder when you have network access, and wire them up in `layout.tsx`.
- **No screenshot/browser tooling** was available to visually inspect the
  rendered page in this environment — `npm run build`, a live
  `npm run start` + HTTP checks, and (from Phase 1 onward) a minimal stub
  standing in for the Laravel endpoints were used to verify correctness
  instead. Worth a visual pass once you have the app running locally.
- Nav links point to real routes (no `#` placeholders). Pages with no data
  source yet (News, Events, Gallery, Downloads, Admissions) render an
  honest "nothing published yet" empty state instead of 404ing or faking
  finished content; pages needing real institutional facts (About,
  Management, Contact) are fully structured but leave the facts themselves
  as clearly-marked placeholders until the College supplies them.
- `src/lib/api/academics.ts` fails soft: if the Laravel API is unreachable,
  public academics pages show a "temporarily unavailable" empty state
  rather than crashing — this matters once this is deployed and the
  backend has a bad moment.
