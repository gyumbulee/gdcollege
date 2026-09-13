"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { CourseRegistration, EligibleOffering } from "@/types/registration";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

const STATUS_LABEL: Record<CourseRegistration["status"], string> = {
  DRAFT: "Draft — not yet submitted",
  SUBMITTED: "Submitted — awaiting HOD approval",
  APPROVED: "Approved",
  REJECTED: "Returned — please review and resubmit",
  CLOSED: "Closed",
};

export function RegistrationWizard({
  initialRegistration,
  offerings,
}: {
  initialRegistration: CourseRegistration;
  offerings: EligibleOffering[];
}) {
  const router = useRouter();
  const [registration, setRegistration] = useState(initialRegistration);
  const [selected, setSelected] = useState<Set<number>>(
    new Set(initialRegistration.items.map((i) => i.course_offering_id))
  );
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  const editable = registration.status === "DRAFT";
  const totalCredits = offerings
    .filter((o) => selected.has(o.id))
    .reduce((sum, o) => sum + o.course.credit_units, 0);

  function toggle(id: number) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    setErrors(null);
    const response = await fetch(`/api/course-registrations/${registration.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ course_offering_ids: Array.from(selected) }),
    });
    const result = await response.json();
    setSaving(false);
    if (result.success) {
      setRegistration(result.data);
      setMessage("Saved.");
    } else {
      setErrors(result.errors ?? {});
      setMessage(result.message ?? "Couldn't save.");
    }
  }

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    setErrors(null);
    const response = await fetch(`/api/course-registrations/${registration.id}/submit`, { method: "POST" });
    const result = await response.json();
    setSubmitting(false);
    if (result.success) {
      setRegistration(result.data);
      router.refresh();
    } else {
      setErrors(result.errors ?? {});
      setMessage(result.message ?? "Couldn't submit.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-5">
        <Badge tone={registration.status === "DRAFT" ? "muted" : "sky"}>
          {STATUS_LABEL[registration.status]}
        </Badge>
        <p className="text-sm text-muted">
          {totalCredits} credit units selected
        </p>
      </div>

      {registration.status === "REJECTED" && registration.rejection_reason && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">
          Returned: {registration.rejection_reason}
        </p>
      )}

      {offerings.length === 0 ? (
        <EmptyState
          title="No course offerings available"
          description="Course offerings for your programme and semester haven't been configured yet — contact your department."
        />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs text-muted">
              <tr>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Units</th>
                <th className="px-4 py-3">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {offerings.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      disabled={!editable}
                      checked={selected.has(o.id)}
                      onChange={() => toggle(o.id)}
                    />
                  </td>
                  <td className="px-4 py-3 text-ink">{o.course.code}</td>
                  <td className="px-4 py-3 text-ink">{o.course.title}</td>
                  <td className="px-4 py-3 text-muted">{o.course.credit_units}</td>
                  <td className="px-4 py-3 text-muted">{o.level.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {errors && Object.keys(errors).length > 0 && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">
          <ul className="list-disc pl-5">
            {Object.values(errors).flat().map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {message && !errors && <p className="text-xs text-muted">{message}</p>}

      {editable && (
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={save} aria-disabled={saving}>
            {saving ? "Saving…" : "Save selections"}
          </Button>
          <Button variant="primary" onClick={submit} aria-disabled={submitting}>
            {submitting ? "Submitting…" : "Submit for approval"}
          </Button>
        </div>
      )}
    </div>
  );
}
