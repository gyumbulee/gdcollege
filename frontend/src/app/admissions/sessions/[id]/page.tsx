import { notFound } from "next/navigation";
import { CalendarCheck, Clock, XCircle, CalendarClock, Archive } from "lucide-react";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getPublicAdmissionSessions, type PublicAdmissionSession } from "@/lib/api/applications";

const STATUS_STYLE: Record<
  PublicAdmissionSession["status"],
  { icon: typeof CalendarCheck; tone: "success" | "amber" | "sky" | "muted" }
> = {
  open: { icon: CalendarCheck, tone: "success" },
  scheduled: { icon: Clock, tone: "amber" },
  closed: { icon: XCircle, tone: "muted" },
  upcoming: { icon: CalendarClock, tone: "sky" },
  past: { icon: Archive, tone: "muted" },
};

export default async function AdmissionSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { body } = await getPublicAdmissionSessions();
  const session = body.success ? body.data.find((s) => s.id === Number(id)) : undefined;

  if (!session) notFound();

  const { icon: Icon, tone } = STATUS_STYLE[session.status];

  const rows = [
    { label: "Session runs", value: session.start_date && session.end_date ? `${new Date(session.start_date).toLocaleDateString()} – ${new Date(session.end_date).toLocaleDateString()}` : "To be confirmed" },
    { label: "Applications open", value: session.admissions_open_at ? new Date(session.admissions_open_at).toLocaleString() : "No fixed opening time" },
    { label: "Applications close", value: session.admissions_close_at ? new Date(session.admissions_close_at).toLocaleString() : "No fixed closing time" },
  ];

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Admissions", href: "/admissions" }, { label: session.name }]}
        title={session.name}
        description={session.is_current ? "The institution's current academic session." : undefined}
      />
      <Container className="py-12">
        <div className="max-w-lg rounded-lg border border-border bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-light text-sky-dark">
              <Icon size={22} strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <Badge tone={tone}>{session.label}</Badge>
              {session.is_current && <span className="ml-2"><Badge tone="sky">Current session</Badge></span>}
            </div>
          </div>

          <dl className="mt-5 divide-y divide-border border-t border-border">
            {rows.map((row) => (
              <div key={row.label} className="flex justify-between gap-6 py-3">
                <dt className="text-sm text-muted">{row.label}</dt>
                <dd className="text-right text-sm text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>

          {session.status === "open" ? (
            <Button href="/admissions/application" variant="primary" className="mt-6">
              Start an Application
            </Button>
          ) : (
            <p className="mt-6 text-sm text-muted">
              {session.status === "scheduled" && "This session isn't accepting applications yet."}
              {session.status === "closed" && "Applications for this session have closed."}
              {session.status === "upcoming" && "This session hasn't started yet."}
              {session.status === "past" && "This admission cycle has ended."}
              {" "}Check the{" "}
              <a href="/admissions/admission-list" className="text-sky-dark hover:underline">
                admission list
              </a>{" "}
              if you already applied.
            </p>
          )}
        </div>
      </Container>
    </>
  );
}
