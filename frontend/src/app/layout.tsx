import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getInstitutionData } from "@/lib/api/institution";

export async function generateMetadata(): Promise<Metadata> {
  const { identity } = await getInstitutionData();

  return {
    title: `${identity.shortName} — ${identity.formalName}`,
    description: `Official digital platform of ${identity.formalName} — admissions, academics, and student services.`,
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-surface font-[family-name:var(--font-body)] text-ink">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
