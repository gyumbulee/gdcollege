"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Result, RosterStudent } from "@/types/results";
import { Button } from "@/components/ui/Button";

type ComponentDef = { id: number; name: string; max_score: number; sort_order: number };

export function ResultEntryGrid({
  offeringId,
  roster,
  initialResults,
  components,
}: {
  offeringId: number;
  roster: RosterStudent[];
  initialResults: Result[];
  components: ComponentDef[];
}) {
  const router = useRouter();
  const resultByStudent = new Map(initialResults.map((r) => [r.student?.id, r]));

  const [scores, setScores] = useState<Record<number, Record<string, string>>>(() =>
    Object.fromEntries(
      roster.map((s) => [
        s.id,
        Object.fromEntries(
          components.map((c) => [c.name, String(resultByStudent.get(s.id)?.component_scores?.[c.name] ?? "")])
        ),
      ])
    )
  );
  const [locked, setLocked] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(roster.map((s) => [s.id, resultByStudent.get(s.id)?.status !== "DRAFT" && !!resultByStudent.get(s.id)]))
  );
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  function setScore(studentId: number, componentName: string, value: string) {
    setScores((s) => ({ ...s, [studentId]: { ...s[studentId], [componentName]: value } }));
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    setErrors(null);

    const payload = roster
      .filter((s) => !locked[s.id])
      .map((s) => ({
        student_id: s.id,
        component_scores: Object.fromEntries(
          components.map((c) => [c.name, Number(scores[s.id]?.[c.name] || 0)])
        ),
      }));

    const response = await fetch(`/api/lecturer/courses/${offeringId}/results`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scores: payload }),
    });
    const result = await response.json();
    setSaving(false);
    if (result.success) {
      setMessage("Saved.");
    } else {
      setErrors(result.errors ?? {});
      setMessage(result.message ?? "Couldn't save.");
    }
  }

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    const response = await fetch(`/api/lecturer/courses/${offeringId}/results/submit`, { method: "POST" });
    const result = await response.json();
    setSubmitting(false);
    if (result.success) {
      setLocked(Object.fromEntries(roster.map((s) => [s.id, true])));
      router.refresh();
    } else {
      setMessage(result.message ?? "Couldn't submit.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-surface text-left text-xs text-muted">
            <tr>
              <th className="px-4 py-3">Matric No</th>
              <th className="px-4 py-3">Student</th>
              {components.map((c) => (
                <th key={c.id} className="px-4 py-3">{c.name} (max {c.max_score})</th>
              ))}
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roster.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 text-ink">{s.matric_number}</td>
                <td className="px-4 py-3 text-ink">{s.name}</td>
                {components.map((c) => (
                  <td key={c.id} className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      max={c.max_score}
                      disabled={locked[s.id]}
                      value={scores[s.id]?.[c.name] ?? ""}
                      onChange={(e) => setScore(s.id, c.name, e.target.value)}
                      className="w-20 rounded-md border border-border px-2 py-1 text-sm disabled:bg-surface"
                    />
                  </td>
                ))}
                <td className="px-4 py-3 text-xs text-muted">
                  {resultByStudent.get(s.id)?.status ?? "Not entered"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {errors && Object.keys(errors).length > 0 && (
        <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-danger">
          <ul className="list-disc pl-5">
            {Object.values(errors).flat().map((msg, i) => <li key={i}>{msg}</li>)}
          </ul>
        </div>
      )}
      {message && <p className="text-xs text-muted">{message}</p>}

      <div className="flex gap-3">
        <Button variant="secondary" onClick={save} aria-disabled={saving}>
          {saving ? "Saving…" : "Save draft"}
        </Button>
        <Button variant="primary" onClick={submit} aria-disabled={submitting}>
          {submitting ? "Submitting…" : "Submit for review"}
        </Button>
      </div>
    </div>
  );
}
