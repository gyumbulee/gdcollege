import Link from "next/link";
import { requireSession, getSessionToken } from "@/lib/auth/session";
import { globalSearch } from "@/lib/api/search";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SearchBox } from "@/components/search/SearchBox";

function ResultSection({ title, children, empty }: { title: string; children: React.ReactNode; empty: boolean }) {
  if (empty) return null;
  return (
    <div className="rounded-lg border border-border bg-white p-5">
      <p className="font-medium text-ink">{title}</p>
      <div className="mt-3 flex flex-col gap-2">{children}</div>
    </div>
  );
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requireSession("/search");
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const token = await getSessionToken();
  const result = query.length >= 2 ? await globalSearch(token!, query) : null;

  const totalResults = result?.body.success
    ? result.body.data.students.length +
      result.body.data.applications.length +
      result.body.data.payments.length +
      result.body.data.courses.length
    : 0;

  return (
    <Container className="flex flex-col gap-6 py-12">
      <div>
        <p className="text-sm text-muted">Staff Tools</p>
        <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">Search</h1>
        <p className="mt-1 text-sm text-muted">
          Student name, matric number, phone or email; application number; payment reference; course code or title.
          Results only ever show what your account already has permission to view.
        </p>
      </div>

      <SearchBox initial={query} />

      {!query ? null : query.length < 2 ? (
        <EmptyState title="Keep typing" description="Enter at least 2 characters to search." />
      ) : !result?.body.success ? (
        <EmptyState title="Search failed" description={result?.body.message ?? "Something went wrong."} />
      ) : totalResults === 0 ? (
        <EmptyState title="No results" description={`Nothing matched "${query}".`} />
      ) : (
        <div className="flex flex-col gap-4">
          <ResultSection title="Students" empty={result.body.data.students.length === 0}>
            {result.body.data.students.map((s) => (
              <Link key={s.id} href={`/staff/students/${s.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 hover:border-sky-dark">
                <div>
                  <p className="text-sm font-medium text-ink">{s.name} — {s.matric_number}</p>
                  <p className="text-xs text-muted">{s.programme}{s.department ? ` · ${s.department}` : ""}{s.email ? ` · ${s.email}` : ""}</p>
                </div>
                <Badge tone={s.status === "ACTIVE" ? "success" : "muted"}>{s.status}</Badge>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title="Applications" empty={result.body.data.applications.length === 0}>
            {result.body.data.applications.map((a) => (
              <Link key={a.id} href={`/staff/admissions/${a.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 hover:border-sky-dark">
                <div>
                  <p className="text-sm font-medium text-ink">{a.application_number}</p>
                  <p className="text-xs text-muted">{a.applicant_name}{a.programme ? ` · ${a.programme}` : ""}</p>
                </div>
                <Badge tone="sky">{a.status}</Badge>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title="Payments" empty={result.body.data.payments.length === 0}>
            {result.body.data.payments.map((p) => (
              <Link key={p.id} href="/bursary/payments" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-3 hover:border-sky-dark">
                <div>
                  <p className="text-sm font-medium text-ink">{p.reference}</p>
                  <p className="text-xs text-muted">{p.student_name} · ₦{p.amount.toLocaleString()}</p>
                </div>
                <Badge tone={p.status === "successful" ? "success" : "muted"}>{p.status}</Badge>
              </Link>
            ))}
          </ResultSection>

          <ResultSection title="Courses" empty={result.body.data.courses.length === 0}>
            {result.body.data.courses.map((c) => (
              <div key={c.id} className="rounded-md border border-border p-3">
                <p className="text-sm font-medium text-ink">{c.code} — {c.title}</p>
                <p className="text-xs text-muted">{c.credit_units} unit{c.credit_units === 1 ? "" : "s"}</p>
              </div>
            ))}
          </ResultSection>
        </div>
      )}
    </Container>
  );
}
