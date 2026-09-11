import { institutionConfig } from "@/config/institution.config";

/**
 * Placeholder institutional mark, drawn in CSS/SVG.
 *
 * This is used everywhere an official logo would normally appear (header,
 * footer, loading state) whenever `institutionConfig.assets.logoSrc` is
 * null. As soon as a real crest/logo is supplied, drop it at
 * public/branding/logo.png and set `logoSrc` in institution.config.ts —
 * every place that renders <CrestMark /> will automatically switch to the
 * real asset without further changes.
 */
export function CrestMark({ size = 40 }: { size?: number }) {
  const { assets, identity } = institutionConfig;

  if (assets.logoSrc) {
    return (
      <img
        src={assets.logoSrc}
        alt={`${identity.shortName} logo`}
        width={size}
        height={size}
        className="rounded-full object-cover"
      />
    );
  }

  const initials = identity.shortName
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
      aria-label={`${identity.shortName} placeholder crest`}
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
