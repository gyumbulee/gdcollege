import { CrestMark } from "./CrestMark";

/**
 * Platform-wide loading spinner. Per the branding spec, the College mark
 * doubles as the loader: a slow rotating ring around the crest, rather than
 * a generic spinner, so the loading state itself reinforces institutional
 * identity.
 */
export function BrandSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-12">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-sky-light border-t-sky-dark" />
        <CrestMark size={32} />
      </div>
      <span className="text-sm text-muted">{label}</span>
    </div>
  );
}
