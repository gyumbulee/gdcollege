import { redirect } from "next/navigation";
import { requireSession, getSessionToken } from "@/lib/auth/session";
import { getMyClearance } from "@/lib/api/clearance";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { RequestClearanceButton } from "@/components/documents/RequestClearanceButton";

const STAGE_LABELS: Record<string, string> = {
  DEPARTMENT: "Department (HOD)",
  LIBRARY: "Library",
  BURSARY: "Bursary",
  REGISTRY: "Registry",
  EXAMINATION: "Examination",
};

const STATUS_TONE: Record<string, "sky" | "amber" | "muted" | "success" | "danger"> = {
  PENDING: "muted",
  APPROVED: "success",
  REJECTED: "danger",
  IN_PROGRESS: "amber",
  COMPLETED: "success",
};

export default async function StudentClearancePage() {
  const session = await requireSession("/student/clearance");
  if (!session.roles.includes("student")) {
    redirect("/portal");
  }

  const token = await getSessionToken();
  const { body } = await getMyClearance(token!);

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Student Portal</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">My Clearance</h1>
      </div>

      {!body.success ? (
        <EmptyState title="Could not load your clearance status" description={body.message} />
      ) : !body.data ? (
        <div className="rounded-lg border border-border bg-white p-5">
          <p className="text-sm text-muted">
            You haven&apos;t started the clearance process yet. It goes through five stages —
            Department, Library, Bursary, Registry, then Examination — before it&apos;s complete.
          </p>
          <div className="mt-4">
            <RequestClearanceButton />
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="font-medium text-ink">Overall status</p>
            <Badge tone={STATUS_TONE[body.data.status] ?? "muted"}>{body.data.status}</Badge>
          </div>

          <ol className="mt-4 flex flex-col gap-3">
            {body.data.items?.map((item) => (
              <li key={item.id} className="flex items-center justify-between border-t border-border pt-3 first:border-t-0 first:pt-0">
                <div>
                  <p className="text-sm text-ink">{STAGE_LABELS[item.stage] ?? item.stage}</p>
                  {item.remark && <p className="text-xs text-muted">{item.remark}</p>}
                </div>
                <Badge tone={STATUS_TONE[item.status] ?? "muted"}>{item.status}</Badge>
              </li>
            ))}
          </ol>
        </div>
      )}
    </Container>
  );
}
