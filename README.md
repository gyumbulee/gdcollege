# Temporary Countdown Gate — GD College Wase

Drop-in module for gating the public root route behind a "Coming Soon" page
while the full platform is under development.

## Files

```
config/countdown.config.ts   ← single source of truth (date, enabled flag, copy, contact)
hooks/useCountdown.ts        ← live D/H/M/S calculation, recomputed from wall-clock time
components/CountdownPage.tsx ← the visible UI
components/CountdownGate.tsx ← the ONLY place that checks the enabled flag
app/page.tsx                 ← example wiring for the public root route
```

## Install into your Next.js app

1. Copy `config/`, `hooks/`, and `components/` into your project (adjust
   import paths if your structure differs).
2. In `app/page.tsx`, wrap your real homepage in `<CountdownGate>`, as shown
   in the example file here.
3. Make sure Tailwind is already set up — this uses arbitrary-value classes
   (`bg-[#F8FAFC]`, etc.) so it works without editing `tailwind.config`, but
   feel free to promote the palette into your theme's `extend.colors` later.
4. Add a serif font for `font-serif` if you want the exact type pairing shown
   (e.g. a Google Font like Newsreader or Source Serif 4) — otherwise it
   falls back to the browser/Tailwind default serif stack.

## Configuration

All of it lives in `config/countdown.config.ts`, optionally overridden by
environment variables:

| Env var | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_COUNTDOWN_ENABLED` | `"false"` disables the gate | `true` |
| `NEXT_PUBLIC_COUNTDOWN_TARGET_DATE` | ISO-8601 datetime with offset | `2026-10-10T00:00:00+01:00` (placeholder — confirm real date) |

No other file contains a date or an enabled flag. That's intentional — see
project rule "the countdown target date must be stored in one configurable
location."

## Turning it off at launch

Set `NEXT_PUBLIC_COUNTDOWN_ENABLED=false` in your environment and redeploy.
`CountdownGate` becomes a harmless passthrough and the real homepage renders
at `/`. No files need to be deleted or restructured — that's the point of
keeping the gate architecturally separate from the eventual homepage.

Alternatively, once the countdown reaches zero client-side, `CountdownPage`
itself swaps to a "Applications are now open" state with a link into
`/admissions` — useful as a soft landing even before you've flipped the env
var server-side.

## Banner image — supplied 2026-09-09

The official banner (`images/gdcollege-banner.jpg` / `public/images/gdcollege-banner.jpg`
in the Next.js version) has been received and is wired in:

- `countdownConfig.crestImageSrc` — a circular crop of the crest from the
  banner's top-left corner, used in the page header in place of the drawn
  `<Seal />` placeholder.
- `countdownConfig.bannerImageSrc` — the full banner, shown as a framed
  "official notice" card near the bottom of the page, since it carries the
  College's own current 2026/2027 admission messaging.

If a cleaner, higher-resolution, or cropped version of either asset is
supplied later, just replace the files at those paths — no component code
needs to change.

## Contact info

`countdownConfig.contact` and `countdownConfig.motto` are now populated with
the phone numbers, address, and motto printed on the official banner above.
Update these only from another officially supplied source — never invent a
phone number, email, or address that isn't on record.
