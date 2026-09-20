import { institutionConfig } from "@/config/institution.config";

/**
 * Placeholder institutional mark, drawn in CSS/SVG.
 *
 * This is used everywhere an official logo would normally appear (header,
 * footer, loading state) whenever no real logo is set. Accepts optional
 * `logoSrc`/`shortName` overrides so server components that have already
 * fetched live Institution Settings (see lib/api/institution.ts) can pass
 * the admin-uploaded logo straight through; omit them (or render from a
 * client component, which can't fetch that data itself) and this falls
 * back to institution.config.ts's static values — never a hardcoded logo,
 * and never a fabricated one.
 */
export function CrestMark({
  size = 40,
  logoSrc,
  shortName,
}: {
  size?: number;
  logoSrc?: string | null;
  shortName?: string;
}) {
  const resolvedLogoSrc = logoSrc !== undefined ? logoSrc : institutionConfig.assets.logoSrc;
  const resolvedShortName = shortName ?? institutionConfig.identity.shortName;

  if (resolvedLogoSrc) {
    return (
      <img
        src={resolvedLogoSrc}
        alt={`${resolvedShortName} logo`}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }

  const initials = resolvedShortName
    .split(" ")
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 3);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role="img"
      aria-label={`${resolvedShortName} placeholder crest`}
    >
      <circle cx="20" cy="20" r="19" fill="var(--color-sky-light)" stroke="var(--color-sky-dark)" strokeWidth="1.25" />
      <circle cx="20" cy="20" r="15" fill="none" stroke="var(--color-sky-dark)" strokeWidth="0.75" strokeDasharray="1 2.5" />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontSize="12"
        fill="var(--color-sky-dark)"
      >
        {initials || "GD"}
      </text>
    </svg>
  );
}
