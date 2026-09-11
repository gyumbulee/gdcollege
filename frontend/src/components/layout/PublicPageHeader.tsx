import { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Breadcrumbs } from "./Breadcrumbs";

type Crumb = { label: string; href?: string };

export function PublicPageHeader({
  crumbs,
  title,
  description,
  actions,
}: {
  crumbs: Crumb[];
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="border-b border-border bg-white">
      <Container className="flex flex-col gap-4 py-10 sm:py-12">
        <Breadcrumbs items={crumbs} />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-ink sm:text-4xl">
              {title}
            </h1>
            {description && (
              <p className="mt-3 max-w-2xl text-muted">{description}</p>
            )}
          </div>
          {actions}
        </div>
      </Container>
    </div>
  );
}
