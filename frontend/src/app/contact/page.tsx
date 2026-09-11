import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { institutionConfig } from "@/config/institution.config";

export default function ContactPage() {
  const { location, contact } = institutionConfig;

  const rows = [
    { label: "Address", value: location.address ?? "Pending confirmation by Registry" },
    { label: "City / State", value: `${location.city}, ${location.state}` },
    { label: "Phone", value: contact.phone ?? "Pending confirmation" },
    { label: "Email", value: contact.email ?? "Pending confirmation" },
  ];

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
        title="Contact"
        description="Reach the College directly, or visit in person."
      />
      <Container className="py-12">
        <dl className="max-w-lg divide-y divide-border rounded-lg border border-border bg-white">
          {rows.map((row) => (
            <div key={row.label} className="flex justify-between gap-6 px-5 py-4">
              <dt className="text-sm text-muted">{row.label}</dt>
              <dd className="text-right text-sm text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-lg text-sm text-muted">
          A contact form and campus map will be added once official details
          are confirmed and the messaging module (Phase 11) is built.
        </p>
      </Container>
    </>
  );
}
