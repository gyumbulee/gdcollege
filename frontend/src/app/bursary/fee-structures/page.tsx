import { getSessionToken } from "@/lib/auth/session";
import { getFeeStructures, getAcademicSessionOptions, getLevelOptions } from "@/lib/api/finance";
import { getProgrammes } from "@/lib/api/academics";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { CreateFeeStructureForm } from "@/components/finance/CreateFeeStructureForm";

export default async function BursaryFeeStructuresPage() {
  const token = await getSessionToken();
  const [structuresResult, sessionsResult, levelsResult, programmesResult] = await Promise.all([
    getFeeStructures(token!),
    getAcademicSessionOptions(token!),
    getLevelOptions(token!),
    getProgrammes(),
  ]);

  const sessions = sessionsResult.body.success ? sessionsResult.body.data : [];
  const levels = levelsResult.body.success ? levelsResult.body.data : [];
  const programmes = programmesResult.items.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="flex flex-col gap-6">
      <CreateFeeStructureForm sessions={sessions} programmes={programmes} levels={levels} />

      {!structuresResult.body.success ? (
        <EmptyState title="Could not load fee structures" description={structuresResult.body.message} />
      ) : structuresResult.body.data.length === 0 ? (
        <EmptyState
          title="No fee structures yet"
          description="Create one above — every fee item within it is configurable, nothing is hardcoded."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {structuresResult.body.data.map((structure) => (
            <div key={structure.id} className="rounded-lg border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-ink">{structure.name}</p>
                  <p className="text-sm text-muted">
                    {structure.academic_session?.name}
                    {structure.programme ? ` · ${structure.programme.name}` : " · All programmes"}
                    {structure.level ? ` · ${structure.level.name}` : " · All levels"}
                  </p>
                </div>
                {!structure.is_active && <Badge tone="muted">Inactive</Badge>}
              </div>

              <ul className="mt-3 flex flex-col gap-1 border-t border-border pt-3 text-sm">
                {structure.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between text-ink">
                    <span>
                      {item.name} {!item.is_mandatory && <span className="text-muted">(optional)</span>}
                    </span>
                    <span>₦{item.amount.toLocaleString()}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-sm font-medium text-ink">
                <span>Total</span>
                <span>₦{structure.total_amount.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
