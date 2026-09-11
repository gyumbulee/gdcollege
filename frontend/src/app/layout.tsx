import type { Metadata } from "next";
import "./globals.css";
import { institutionConfig } from "@/config/institution.config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: `${institutionConfig.identity.shortName} — ${institutionConfig.identity.formalName}`,
  description:
    "Official digital platform of Goran Dutse College of General Studies Wase — admissions, academics, and student services.",
};

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
