"use client";

import { Printer } from "lucide-react";
import { institutionConfig } from "@/config/institution.config";
import { CrestMark } from "@/components/brand/CrestMark";
import type { InstitutionData } from "@/lib/api/institution";
import type { IssuedDocument } from "@/lib/api/documents";

const TYPE_LABELS: Record<string, string> = {
  ADMISSION_LETTER: "Admission Letter",
  COURSE_REG_SLIP: "Course Registration Slip",
  RESULT_SLIP: "Result Slip",
  PAYMENT_RECEIPT: "Payment Receipt",
  STATEMENT_OF_RESULT: "Statement of Result",
  TRANSCRIPT: "Transcript",
  CLEARANCE_CERTIFICATE: "Clearance Certificate",
};

function field(label: string, value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-b-0">
      <span className="text-muted">{label}</span>
      <span className="text-right font-medium text-ink">{String(value)}</span>
    </div>
  );
}

function CourseTable({ rows }: { rows: Array<Record<string, unknown>> }) {
  if (!rows?.length) return <p className="text-sm text-muted">No items on record.</p>;
  const hasGrade = "grade" in (rows[0] ?? {});

  return (
    <table className="mt-3 w-full text-sm">
      <thead>
        <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
          <th className="py-2">Code</th>
          <th className="py-2">Course</th>
          <th className="py-2 text-right">Units</th>
          {hasGrade && <th className="py-2 text-right">Score</th>}
          {hasGrade && <th className="py-2 text-right">Grade</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-border last:border-b-0">
            <td className="py-2">{String(row.code ?? "")}</td>
            <td className="py-2">{String(row.title ?? "")}{row.is_carryover ? " (Carryover)" : ""}</td>
            <td className="py-2 text-right">{String(row.credit_units ?? "")}</td>
            {hasGrade && <td className="py-2 text-right">{String(row.total_score ?? "")}</td>}
            {hasGrade && <td className="py-2 text-right">{String(row.grade ?? "")}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DocumentBody({ document }: { document: IssuedDocument }) {
  const c = document.content ?? {};

  switch (document.type) {
    case "ADMISSION_LETTER":
      return (
        <div>
          {field("Applicant", c.student_name)}
          {field("Matric number", c.matric_number)}
          {field("Programme", c.programme)}
          {field("Department", c.department)}
          {field("Admission session", c.admission_session)}
          {field("Decision date", c.decision_date)}
        </div>
      );
    case "COURSE_REG_SLIP":
      return (
        <div>
          {field("Student", c.student_name)}
          {field("Matric number", c.matric_number)}
          {field("Session", c.academic_session)}
          {field("Semester", c.semester)}
          {field("Status", c.status)}
          <CourseTable rows={(c.items as Array<Record<string, unknown>>) ?? []} />
          {field("Total credit units", c.total_credit_units)}
        </div>
      );
    case "RESULT_SLIP":
    case "STATEMENT_OF_RESULT":
    case "TRANSCRIPT":
      return (
        <div>
          {field("Student", c.student_name)}
          {field("Matric number", c.matric_number)}
          {field("Programme", c.programme)}
          {field("Department", c.department)}
          {field("Session", c.academic_session)}
          {field("Semester", c.semester)}
          <CourseTable rows={(c.results as Array<Record<string, unknown>>) ?? []} />
        </div>
      );
    case "PAYMENT_RECEIPT":
      return (
        <div>
          {field("Paid by", c.student_name)}
          {field("Matric number", c.matric_number)}
          {field("Reference", c.reference)}
          {field("Invoice number", c.invoice_number)}
          {field("Gateway", c.gateway)}
          {field("Amount", c.amount != null ? `₦${Number(c.amount).toLocaleString()}` : null)}
          {field("Paid at", c.paid_at)}
        </div>
      );
    case "CLEARANCE_CERTIFICATE":
      return (
        <div>
          {field("Student", c.student_name)}
          {field("Matric number", c.matric_number)}
          {field("Completed at", c.completed_at)}
          <p className="mt-3 text-xs uppercase tracking-wide text-muted">Clearance stages</p>
          <div className="mt-1">
            {((c.stages as Array<Record<string, unknown>>) ?? []).map((s, i) => (
              <div key={i} className="flex justify-between border-b border-border py-2 text-sm last:border-b-0">
                <span className="text-ink">{String(s.stage ?? "")}</span>
                <span className="text-muted">{String(s.status ?? "")}</span>
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <pre className="whitespace-pre-wrap text-xs text-muted">{JSON.stringify(c, null, 2)}</pre>
      );
  }
}

export function DocumentPrintView({
  document,
  institution,
}: {
  document: IssuedDocument;
  /** Passed down by the (server component) page that fetched it — this is a client component and can't fetch it itself. Falls back to the static config if omitted. */
  institution?: InstitutionData;
}) {
  const identity = institution?.identity ?? institutionConfig.identity;
  const assets = institution?.assets ?? institutionConfig.assets;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex justify-end print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-md bg-sky-dark px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#025685]"
        >
          <Printer size={16} aria-hidden />
          Print / Save as PDF
        </button>
      </div>

      <div className="rounded-lg border border-border bg-white p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="flex items-center gap-3 border-b border-border pb-5">
          <CrestMark size={44} logoSrc={assets.logoSrc} shortName={identity.shortName} />
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg text-ink">
              {identity.formalName}
            </p>
            <p className="text-xs text-muted">{identity.shortName}</p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <h1 className="font-[family-name:var(--font-display)] text-xl text-ink">
            {TYPE_LABELS[document.type] ?? document.type}
          </h1>
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-medium ${
              document.status === "ACTIVE" ? "bg-sky-light text-sky-dark" : "bg-red-50 text-danger"
            }`}
          >
            {document.status}
          </span>
        </div>

        <div className="mt-1 text-xs text-muted">
          {document.document_number} · issued {new Date(document.issued_at).toLocaleDateString()}
        </div>

        <div className="mt-6">
          <DocumentBody document={document} />
        </div>

        {document.revoked_reason && (
          <p className="mt-4 rounded-md bg-red-50 px-4 py-3 text-sm text-danger">
            Revoked: {document.revoked_reason}
          </p>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-border pt-4 text-xs text-muted">
          <span>Verification code: {document.verification_code}</span>
          <span>Verify at /verify/{document.verification_code}</span>
        </div>
      </div>
    </div>
  );
}
