import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { getProgrammes } from "@/lib/api/academics";

const samplePreviewProgrammes = [
  { name: "Sample Programme A", school: "School to be assigned" },
  { name: "Sample Programme B", school: "School to be assigned" },
  { name: "Sample Programme C", school: "School to be assigned" },
];

export async function ProgrammesPreview() {
  const { ok, items } = await getProgrammes();
  const real = items.filter((p) => p.is_active).slice(0, 3);
  const usingRealData = ok && real.length > 0;

  return (
    <section className="py-16">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-ink sm:text-3xl">
              Programmes
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted">
              {usingRealData
                ? "A few of the programmes currently offered."
                : "Confirmed ND programmes will replace these placeholders once Academic Affairs configures the academic structure."}
            </p>
          </div>
          <Link href="/academics/programmes" className="text-sm text-sky-dark hover:underline">
            View all academics
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {usingRealData
            ? real.map((p) => (
                <div key={p.id} className="rounded-lg border border-border bg-white p-5">
                  <Badge tone="sky">{p.award_type}</Badge>
                  <p className="mt-3 font-medium text-ink">{p.name}</p>
                  <p className="mt-1 text-sm text-muted">
                    {p.department?.name ?? "Department to be assigned"}
                  </p>
                </div>
              ))
            : samplePreviewProgrammes.map((p) => (
                <div key={p.name} className="rounded-lg border border-border bg-white p-5">
                  <Badge tone="muted">Sample</Badge>
                  <p className="mt-3 font-medium text-ink">{p.name}</p>
                  <p className="mt-1 text-sm text-muted">{p.school}</p>
                </div>
              ))}
        </div>
      </Container>
    </section>
  );
}
