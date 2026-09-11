"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { Application, EducationRecord } from "@/types/admissions";
import type { PublicProgramme } from "@/lib/api/academics";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

/**
 * Mirrors backend/config/admissions.php's `required_document_types` and
 * `document_types`. Keep these two in sync until Phase 21 exposes a
 * settings endpoint the frontend can read this from directly.
 */
const DOCUMENT_TYPES: Record<string, string> = {
  olevel_result: "O'Level Result",
  passport_photo: "Passport Photograph",
  birth_certificate: "Birth Certificate / Age Declaration",
  local_government_certificate: "Local Government Identification",
  other: "Other Supporting Document",
};
const REQUIRED_DOCUMENT_TYPES = ["olevel_result", "passport_photo"];

const STATUS_LABEL: Record<Application["status"], string> = {
  DRAFT: "Draft — not yet submitted",
  PAYMENT_PENDING: "Payment pending",
  PAYMENT_CONFIRMED: "Payment confirmed",
  SUBMITTED: "Submitted — awaiting review",
  UNDER_REVIEW: "Under review",
  SHORTLISTED: "Shortlisted",
  ADMITTED: "Admitted",
  REJECTED: "Not admitted",
  ON_HOLD: "On hold",
  WITHDRAWN: "Withdrawn",
};

export function ApplicationWizard({
  initialApplication,
  programmes,
}: {
  initialApplication: Application;
  programmes: PublicProgramme[];
}) {
  const router = useRouter();
  const [application, setApplication] = useState(initialApplication);
  const editable = application.status === "DRAFT";

  return (
    <div className="space-y-8">
      <StatusHeader application={application} />

      {!editable && (
        <p className="rounded-md border border-sky-light bg-sky-light/40 px-4 py-3 text-sm text-sky-dark">
          This application has been submitted and can no longer be edited here.
        </p>
      )}

      <ProgrammeSection
        application={application}
        programmes={programmes}
        editable={editable}
        onSaved={setApplication}
      />
      <PersonalInfoSection application={application} editable={editable} onSaved={setApplication} />
      <EducationSection application={application} editable={editable} onSaved={setApplication} />
      <DocumentsSection application={application} editable={editable} onSaved={setApplication} />

      {editable && (
        <SubmitSection
          application={application}
          onSubmitted={(updated) => {
            setApplication(updated);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

function StatusHeader({ application }: { application: Application }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-white p-5">
      <div>
        <p className="text-sm text-muted">Application number</p>
        <p className="font-[family-name:var(--font-display)] text-xl text-ink">
          {application.application_number}
        </p>
      </div>
      <Badge tone={application.status === "DRAFT" ? "muted" : "sky"}>
        {STATUS_LABEL[application.status]}
      </Badge>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-white p-6">
      <h2 className="font-[family-name:var(--font-display)] text-lg text-ink">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

async function patchApplication(id: number, data: Record<string, unknown>) {
  const response = await fetch(`/api/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}

function ProgrammeSection({
  application,
  programmes,
  editable,
  onSaved,
}: {
  application: Application;
  programmes: PublicProgramme[];
  editable: boolean;
  onSaved: (a: Application) => void;
}) {
  const [programmeId, setProgrammeId] = useState(application.programme?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    const result = await patchApplication(application.id, { programme_id: programmeId || null });
    setSaving(false);
    if (result.success) {
      onSaved(result.data);
      setMessage("Saved.");
    } else {
      setMessage(result.message ?? "Couldn't save.");
    }
  }

  return (
    <SectionCard title="Programme">
      <label htmlFor="programme" className="block text-sm text-muted">
        Which programme are you applying for?
      </label>
      <select
        id="programme"
        disabled={!editable}
        value={programmeId}
        onChange={(e) => setProgrammeId(e.target.value ? Number(e.target.value) : "")}
        className="mt-1 w-full max-w-sm rounded-md border border-border bg-white px-3 py-2 text-sm text-ink disabled:bg-surface"
      >
        <option value="">Select a programme</option>
        {programmes.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
      {editable && (
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={save} variant="secondary" aria-disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          {message && <span className="text-xs text-muted">{message}</span>}
        </div>
      )}
    </SectionCard>
  );
}

const PERSONAL_FIELDS: { key: keyof Application["applicant"]; label: string; type?: string }[] = [
  { key: "date_of_birth", label: "Date of birth", type: "date" },
  { key: "gender", label: "Gender" },
  { key: "nationality", label: "Nationality" },
  { key: "state_of_origin", label: "State of origin" },
  { key: "lga", label: "LGA" },
  { key: "address", label: "Residential address" },
  { key: "next_of_kin_name", label: "Next of kin — name" },
  { key: "next_of_kin_phone", label: "Next of kin — phone" },
  { key: "next_of_kin_relationship", label: "Next of kin — relationship" },
  { key: "next_of_kin_address", label: "Next of kin — address" },
];

function PersonalInfoSection({
  application,
  editable,
  onSaved,
}: {
  application: Application;
  editable: boolean;
  onSaved: (a: Application) => void;
}) {
  const [form, setForm] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      PERSONAL_FIELDS.map((f) => [f.key, (application.applicant[f.key] as string) ?? ""])
    )
  );
  const [phone, setPhone] = useState(application.applicant.user.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setMessage(null);
    const result = await patchApplication(application.id, { ...form, phone });
    setSaving(false);
    if (result.success) {
      onSaved(result.data);
      setMessage("Saved.");
    } else {
      setMessage(result.message ?? "Couldn't save.");
    }
  }

  return (
    <SectionCard title="Personal, contact & next of kin">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput label="Phone" value={phone} onChange={setPhone} disabled={!editable} />
        {PERSONAL_FIELDS.map((f) => (
          <TextInput
            key={f.key}
            label={f.label}
            type={f.type}
            value={form[f.key]}
            onChange={(v) => setForm((s) => ({ ...s, [f.key]: v }))}
            disabled={!editable}
          />
        ))}
      </div>
      {editable && (
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save} variant="secondary" aria-disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
          {message && <span className="text-xs text-muted">{message}</span>}
        </div>
      )}
    </SectionCard>
  );
}

function TextInput({
  label,
  value,
  onChange,
  type = "text",
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-muted">{label}</label>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-ink disabled:bg-surface"
      />
    </div>
  );
}

function emptyRecord(): EducationRecord {
  return { exam_body: "", exam_year: new Date().getFullYear(), school_attended: "", subjects: [{ subject: "", grade: "" }] };
}

function EducationSection({
  application,
  editable,
  onSaved,
}: {
  application: Application;
  editable: boolean;
  onSaved: (a: Application) => void;
}) {
  const [records, setRecords] = useState<EducationRecord[]>(
    application.education_records.length ? application.education_records : [emptyRecord()]
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function updateRecord(i: number, patch: Partial<EducationRecord>) {
    setRecords((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function updateSubject(i: number, j: number, key: "subject" | "grade", value: string) {
    setRecords((rs) =>
      rs.map((r, idx) =>
        idx === i ? { ...r, subjects: r.subjects.map((s, k) => (k === j ? { ...s, [key]: value } : s)) } : r
      )
    );
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    const response = await fetch(`/api/applications/${application.id}/education`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ records }),
    });
    const result = await response.json();
    setSaving(false);
    if (result.success) {
      onSaved(result.data);
      setMessage("Saved.");
    } else {
      setMessage(result.message ?? "Couldn't save.");
    }
  }

  return (
    <SectionCard title="Educational history (O'Level)">
      <div className="space-y-6">
        {records.map((record, i) => (
          <div key={i} className="rounded-md border border-border p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <TextInput label="Exam body (e.g. WAEC)" value={record.exam_body} onChange={(v) => updateRecord(i, { exam_body: v })} disabled={!editable} />
              <TextInput label="Exam year" type="number" value={String(record.exam_year)} onChange={(v) => updateRecord(i, { exam_year: Number(v) })} disabled={!editable} />
              <TextInput label="School attended" value={record.school_attended ?? ""} onChange={(v) => updateRecord(i, { school_attended: v })} disabled={!editable} />
            </div>

            <p className="mt-4 text-xs font-medium text-muted">Subjects & grades</p>
            <div className="mt-2 space-y-2">
              {record.subjects.map((s, j) => (
                <div key={j} className="grid grid-cols-[1fr_100px] gap-2">
                  <TextInput label="" value={s.subject} onChange={(v) => updateSubject(i, j, "subject", v)} disabled={!editable} />
                  <TextInput label="" value={s.grade} onChange={(v) => updateSubject(i, j, "grade", v)} disabled={!editable} />
                </div>
              ))}
              {editable && (
                <button
                  type="button"
                  onClick={() => updateRecord(i, { subjects: [...record.subjects, { subject: "", grade: "" }] })}
                  className="text-xs text-sky-dark hover:underline"
                >
                  + Add subject
                </button>
              )}
            </div>

            {editable && records.length > 1 && (
              <button
                type="button"
                onClick={() => setRecords((rs) => rs.filter((_, idx) => idx !== i))}
                className="mt-3 text-xs text-danger hover:underline"
              >
                Remove this record
              </button>
            )}
          </div>
        ))}

        {editable && (
          <button
            type="button"
            onClick={() => setRecords((rs) => [...rs, emptyRecord()])}
            className="text-sm text-sky-dark hover:underline"
          >
            + Add another sitting
          </button>
        )}
      </div>

      {editable && (
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={save} variant="secondary" aria-disabled={saving}>
            {saving ? "Saving…" : "Save education history"}
          </Button>
          {message && <span className="text-xs text-muted">{message}</span>}
        </div>
      )}
    </SectionCard>
  );
}

function DocumentsSection({
  application,
  editable,
  onSaved,
}: {
  application: Application;
  editable: boolean;
  onSaved: (a: Application) => void;
}) {
  const [docType, setDocType] = useState(Object.keys(DOCUMENT_TYPES)[0]);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function refresh() {
    const response = await fetch(`/api/applications/${application.id}`);
    const result = await response.json();
    if (result.success) onSaved(result.data);
  }

  async function upload() {
    if (!file) return;
    setUploading(true);
    setMessage(null);
    const form = new FormData();
    form.append("document_type", docType);
    form.append("file", file);
    const response = await fetch(`/api/applications/${application.id}/documents`, { method: "POST", body: form });
    const result = await response.json();
    setUploading(false);
    if (result.success) {
      setFile(null);
      setMessage("Uploaded.");
      await refresh();
    } else {
      setMessage(result.message ?? "Upload failed.");
    }
  }

  async function remove(documentId: number) {
    const response = await fetch(`/api/applications/${application.id}/documents/${documentId}`, { method: "DELETE" });
    const result = await response.json();
    if (result.success) await refresh();
  }

  return (
    <SectionCard title="Documents">
      <ul className="mb-4 divide-y divide-border rounded-md border border-border">
        {application.documents.length === 0 && (
          <li className="px-4 py-3 text-sm text-muted">No documents uploaded yet.</li>
        )}
        {application.documents.map((doc) => (
          <li key={doc.id} className="flex items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="text-sm text-ink">{doc.original_filename}</p>
              <p className="text-xs text-muted">{DOCUMENT_TYPES[doc.document_type] ?? doc.document_type}</p>
            </div>
            {editable && (
              <button type="button" onClick={() => remove(doc.id)} className="text-xs text-danger hover:underline">
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      {editable && (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-muted">Document type</label>
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="mt-1 rounded-md border border-border bg-white px-3 py-2 text-sm text-ink"
            >
              {Object.entries(DOCUMENT_TYPES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-muted">File (PDF or image)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 text-sm"
            />
          </div>
          <Button onClick={upload} variant="secondary" aria-disabled={uploading || !file}>
            {uploading ? "Uploading…" : "Upload"}
          </Button>
        </div>
      )}
      {message && <p className="mt-2 text-xs text-muted">{message}</p>}

      <p className="mt-4 text-xs text-muted">
        Required before submission: {REQUIRED_DOCUMENT_TYPES.map((t) => DOCUMENT_TYPES[t]).join(", ")}.
      </p>
    </SectionCard>
  );
}

function SubmitSection({
  application,
  onSubmitted,
}: {
  application: Application;
  onSubmitted: (a: Application) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]> | null>(null);

  async function submit() {
    setSubmitting(true);
    setErrors(null);
    const response = await fetch(`/api/applications/${application.id}/submit`, { method: "POST" });
    const result = await response.json();
    setSubmitting(false);
    if (result.success) {
      onSubmitted(result.data);
    } else {
      setErrors(result.errors ?? {});
    }
  }

  return (
    <SectionCard title="Review & submit">
      <p className="text-sm text-muted">
        There is currently no application fee to pay — online payment goes
        live once the payment gateway (Phase 13) is implemented. Review
        everything above, then submit.
      </p>

      {errors && Object.keys(errors).length > 0 && (
        <div className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">
          <p className="font-medium">Please complete the following before submitting:</p>
          <ul className="mt-1 list-disc pl-5">
            {Object.values(errors).flat().map((msg, i) => (
              <li key={i}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <Button onClick={submit} variant="primary" className="mt-4" aria-disabled={submitting}>
        {submitting ? "Submitting…" : "Submit application"}
      </Button>
    </SectionCard>
  );
}
