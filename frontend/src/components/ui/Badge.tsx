export function Badge({
  tone = "sky",
  children,
}: {
  tone?: "sky" | "amber" | "muted";
  children: React.ReactNode;
}) {
  const tones = {
    sky: "bg-sky-light text-sky-dark",
    amber: "bg-amber-50 text-amber-700",
    muted: "bg-slate-100 text-muted",
  } as const;

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}
