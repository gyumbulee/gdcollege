import Link from "next/link";
import { CalendarCheck, Clock, XCircle, CalendarClock, Archive } from "lucide-react";
import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
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

export default async function AdmissionsPage() {
  const { body } = await getPublicAdmissionSessions();
  const sessions = body.success ? body.data : [];
  const openSession = sessions.find((s) => s.status === "open");

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Admissions" }]}
        title="Admissions"
        description="Current and past admission cycles — select one for details."
        actions={
          openSession ? (
            <Button href="/admissions/application" variant="primary">
              Start an Application
            </Button>
          ) : undefined
        }
      />
      <Container className="py-12">
        <div className="mb-8 flex flex-wrap gap-4 text-sm">
          <Link href="/admissions/requirements" className="text-sky-dark hover:underline">
            Admission requirements
          </Link>
          <Link href="/admissions/admission-list" className="text-sky-dark hover:underline">
            Admission list
          </Link>
          <Link href="/academics/programmes" className="text-sky-dark hover:underline">
            Available programmes
          </Link>
        </div>

        {sessions.length === 0 ? (
          <EmptyState
            title="No admission sessions yet"
            description="Admission cycles will appear here once configured by the Admissions Office."
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => {
              const { icon: Icon, tone } = STATUS_STYLE[session.status];
              return (
                <Link
                  key={session.id}
                  href={`/admissions/sessions/${session.id}`}
                  className="group flex flex-col gap-4 rounded-lg border border-border bg-white p-6 transition-colors hover:border-sky-dark hover:bg-sky-light/20"
                >
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-light text-sky-dark transition-colors group-hover:bg-sky-dark group-hover:text-white">
                      <Icon size={22} strokeWidth={1.75} aria-hidden />
                    </span>
                    {session.is_current && <Badge tone="sky">Current session</Badge>}
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-lg text-ink">{session.name}</p>
                    <div className="mt-2">
                      <Badge tone={tone}>{session.label}</Badge>
                    </div>
                  </div>
                  <span className="mt-auto text-sm text-sky-dark">View details →</span>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </>
  );
}
