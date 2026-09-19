import { PublicPageHeader } from "@/components/layout/PublicPageHeader";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDownloads } from "@/lib/api/cms";

export default async function DownloadsPage() {
  const { ok, items } = await getDownloads();
  const byCategory = items.reduce<Record<string, typeof items>>((acc, item) => {
    const key = item.category ?? "General";
    acc[key] = [...(acc[key] ?? []), item];
    return acc;
  }, {});

  return (
    <>
      <PublicPageHeader
        crumbs={[{ label: "Home", href: "/" }, { label: "Downloads" }]}
        title="Downloads"
        description="Forms, brochures, and other official documents."
      />
      <Container className="py-12">
        {!ok ? (
          <EmptyState title="Downloads are temporarily unavailable" description="Please check back shortly." />
        ) : items.length === 0 ? (
          <EmptyState title="No downloads published yet" description="Official forms and documents will appear here." />
        ) : (
          <div className="flex flex-col gap-6">
            {Object.entries(byCategory).map(([category, files]) => (
              <div key={category}>
                <p className="font-medium text-ink">{category}</p>
                <ul className="mt-2 flex flex-col gap-1">
                  {files.map((file) => (
                    <li key={file.id}>
                      <a href={file.file_url ?? "#"} className="text-sm text-sky-dark hover:underline" download>
                        {file.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
