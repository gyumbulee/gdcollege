import { redirect } from "next/navigation";
import { requireSession, getSessionToken, can } from "@/lib/auth/session";
import { getClearanceRequests } from "@/lib/api/clearance";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ClearanceItemActions } from "@/components/documents/ClearanceItemActions";

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

/** Mirrors ClearanceItem::STAGE_ROLES on the backend — used only to
 * decide whether to render a decide action at all; the backend's
 * ClearanceItemPolicy is the actual enforcement, this is just so the UI
 * doesn't offer a button for a stage the viewer's role can't act on. */
const STAGE_ROLES: Record<string, string> = {
  DEPARTMENT: "hod",
  LIBRARY: "library_officer",
  BURSARY: "bursary_officer",
  REGISTRY: "registrar",
  EXAMINATION: "academic_officer",
};

export default async function ClearancePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await requireSession("/clearance");
  if (!can(session, "clearance.approve")) {
    redirect("/portal");
  }

  const { page } = await searchParams;
  const token = await getSessionToken();
  const { body } = await getClearanceRequests(token!, Number(page ?? 1));

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Clearance</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
          Clearance Requests
        </h1>
        <p className="mt-1 text-sm text-muted">
          Showing requests with at least one stage your role can decide.
        </p>
      </div>

      {!body.success ? (
        <EmptyState title="Could not load clearance requests" description={body.message} />
      ) : body.data.items.length === 0 ? (
        <EmptyState title="Nothing pending" description="No clearance requests need your attention right now." />
      ) : (
        <div className="flex flex-col gap-4">
          {body.data.items.map((request) => (
            <div key={request.id} className="rounded-lg border border-border bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-ink">
                    {request.student?.name ?? "—"}{" "}
                    <span className="text-xs text-muted">{request.student?.matric_number}</span>
                  </p>
                </div>
                <Badge tone={STATUS_TONE[request.status] ?? "muted"}>{request.status}</Badge>
              </div>

              <ul className="mt-4 flex flex-col gap-3">
                {request.items?.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between border-t border-border pt-3 first:border-t-0 first:pt-0"
                  >
                    <div>
                      <p className="text-sm text-ink">{STAGE_LABELS[item.stage] ?? item.stage}</p>
                      {item.remark && <p className="text-xs text-muted">{item.remark}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge tone={STATUS_TONE[item.status] ?? "muted"}>{item.status}</Badge>
                      {session.roles.includes(STAGE_ROLES[item.stage]) && (
                        <ClearanceItemActions itemId={item.id} status={item.status} />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {body.success && body.data.pagination.last_page && body.data.pagination.last_page > 1 && (
        <p className="text-center text-sm text-muted">
          Page {body.data.pagination.current_page} of {body.data.pagination.last_page}
        </p>
      )}
    </Container>
  );
}
