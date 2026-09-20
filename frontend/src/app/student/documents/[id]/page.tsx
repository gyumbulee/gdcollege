import { notFound, redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { requireSession, getSessionToken } from "@/lib/auth/session";
import { getMyDocuments } from "@/lib/api/documents";
import { getInstitutionData } from "@/lib/api/institution";
import { DocumentPrintView } from "@/components/documents/DocumentPrintView";

export default async function StudentDocumentDownloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession("/student/documents");
  if (!session.roles.includes("student")) {
    redirect("/portal");
  }

  const { id } = await params;
  const token = await getSessionToken();
  const [{ body }, institution] = await Promise.all([getMyDocuments(token!), getInstitutionData()]);

  if (!body.success) {
    notFound();
  }

  const document = body.data.find((d) => d.id === Number(id));
  if (!document) {
    notFound();
  }

  return (
    <Container className="py-12">
      <DocumentPrintView document={document} institution={institution} />
    </Container>
  );
}
