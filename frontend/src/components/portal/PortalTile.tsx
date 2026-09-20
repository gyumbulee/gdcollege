import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function PortalTile({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-start gap-3 rounded-lg border border-border bg-white p-5 transition-colors hover:border-sky-dark hover:bg-sky-light/30"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-light text-sky-dark transition-colors group-hover:bg-sky-dark group-hover:text-white">
        <Icon size={22} strokeWidth={1.75} aria-hidden />
      </span>
      <span className="font-medium text-ink">{title}</span>
      {description && <span className="text-xs leading-snug text-muted">{description}</span>}
    </Link>
  );
}
