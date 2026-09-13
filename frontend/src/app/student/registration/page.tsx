import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getSession, getSessionToken } from "@/lib/auth/session";
import { getMyStudentRecord } from "@/lib/api/students";
import { createOrGetDraftRegistration, listEligibleOfferings } from "@/lib/api/registration";
import { RegistrationWizard } from "@/components/registration/RegistrationWizard";

export default async function StudentRegistrationPage() {
  const session = await getSession();

  if (!session || !session.roles.includes("student")) {
    return (
      <Container className="py-16">
        <EmptyState
          title="This page is for student accounts"
          description="Sign in with your student account to register courses."
        />
      </Container>
    );
  }

  const token = await getSessionToken();
  const studentRes = await getMyStudentRecord(token!);

  if (!studentRes.body.success) {
    return (
      <Container className="py-16">
        <EmptyState title="No student record found" description="Contact the Registry if you believe this is an error." />
      </Container>
    );
  }

  const student = studentRes.body.data;
  const registrationRes = await createOrGetDraftRegistration(token!);

  if (!registrationRes.body.success) {
    return (
      <Container className="py-16">
        <EmptyState title="Registration is not currently open" description={registrationRes.body.message} />
      </Container>
    );
  }

  const registration = registrationRes.body.data;
  const offeringsRes = await listEligibleOfferings(token!, {
    programme_id: student.programme?.id,
    academic_session_id: registration.academic_session?.id,
    semester_id: registration.semester?.id,
  });
  const offerings = offeringsRes.body.success ? offeringsRes.body.data : [];

  return (
    <Container className="py-12">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-ink">
        Course Registration
      </h1>
      <p className="mt-1 text-sm text-muted">
        {registration.academic_session?.name} — {registration.semester?.name}
      </p>

      <div className="mt-8">
        <RegistrationWizard initialRegistration={registration} offerings={offerings} />
      </div>
    </Container>
  );
}
