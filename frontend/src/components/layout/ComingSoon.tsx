import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

/**
 * Used for public routes that exist in the navigation/IA now, but whose
 * real content is built in a later phase (Phase 3: Public Website,
 * Phase 4: Applicant Portal, etc). This keeps navigation honest — no
 * dead links — without pretending unbuilt phases are finished.
 */
export function ComingSoon({
  title,
  phase,
  description,
}: {
  title: string;
  phase: string;
  description: string;
}) {
  return (
    <Container className="flex min-h-[60vh] flex-col items-start justify-center gap-4 py-20">
      <Badge tone="sky">{phase}</Badge>
      <h1 className="font-[family-name:var(--font-display)] text-3xl text-ink sm:text-4xl">
        {title}
      </h1>
      <p className="max-w-xl text-muted">{description}</p>
    </Container>
  );
}
