"use client";

import { useState } from "react";
import type { Result } from "@/types/results";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const NEXT_ACTION: Record<string, { action: "review" | "verify" | "approve" | "publish"; label: string; permKey: string } | null> = {
  SUBMITTED: { action: "review", label: "Mark reviewed", permKey: "canReview" },
  REVIEWED: { action: "verify", label: "Verify", permKey: "canVerify" },
  VERIFIED: { action: "approve", label: "Approve", permKey: "canApprove" },
  APPROVED: { action: "publish", label: "Publish", permKey: "canPublish" },
  PUBLISHED: null,
};

export function ResultQueueTable({
  initialResults,
  canReview,
  canVerify,
  canApprove,
  canPublish,
}: {
  initialResults: Result[];
  canReview: boolean;
  canVerify: boolean;
  canApprove: boolean;
  canPublish: boolean;
}) {
  const [results, setResults] = useState(initialResults);
  const [busyId, setBusyId] = useState<number | null>(null);

  const perms = { canReview, canVerify, canApprove, canPublish };

  async function act(result: Result, action: string) {
    setBusyId(result.id);
    const response = await fetch(`/api/staff/results/${result.id}/${action}`, { method: "POST" });
    const json = await response.json();
    setBusyId(null);
    if (json.success) {
      setResults((rs) => rs.map((r) => (r.id === result.id ? json.data : r)));
    }
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-surface text-left text-xs text-muted">
          <tr>
            <th className="px-4 py-3">Student</th>
            <th className="px-4 py-3">Course</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Grade</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {results.map((r) => {
            const next = NEXT_ACTION[r.status];
            const allowed = next && perms[next.permKey as keyof typeof perms];
            return (
              <tr key={r.id}>
                <td className="px-4 py-3 text-ink">{r.student?.name} <span className="text-xs text-muted">({r.student?.matric_number})</span></td>
                <td className="px-4 py-3 text-ink">{r.course_offering?.course?.code}</td>
                <td className="px-4 py-3 text-muted">{r.total_score ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{r.grade ?? "—"}</td>
                <td className="px-4 py-3"><Badge tone={r.status === "PUBLISHED" ? "sky" : "amber"}>{r.status}</Badge></td>
                <td className="px-4 py-3">
                  {allowed && (
                    <Button
                      variant="secondary"
                      onClick={() => act(r, next!.action)}
                      aria-disabled={busyId === r.id}
                    >
                      {next!.label}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
