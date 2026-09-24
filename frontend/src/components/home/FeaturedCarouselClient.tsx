"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type Slide = { id: number; image_url: string; caption: string | null };

const AUTOPLAY_MS = 6000;

export function FeaturedCarouselClient({
  slides,
  usingRealData,
}: {
  slides: Slide[];
  usingRealData: boolean;
}) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  useEffect(() => {
    if (count < 2) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % count), AUTOPLAY_MS);
    return () => clearInterval(timer);
  }, [count]);

  if (!usingRealData) {
    return (
      <div className="relative flex aspect-[16/7] w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface text-center">
        <Badge tone="muted">Sample</Badge>
        <p className="max-w-md px-4 text-sm text-muted">
          Featured campus photos will appear here once the homepage carousel album is curated in the CMS.
        </p>
      </div>
    );
  }

  const slide = slides[index];

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border bg-ink">
      <div className="relative aspect-[16/7] w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={slide.id}
          src={slide.image_url}
          alt={slide.caption ?? ""}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {slide.caption && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 sm:p-6">
            <p className="text-sm text-white sm:text-base">{slide.caption}</p>
          </div>
        )}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => setIndex((i) => (i - 1 + count) % count)}
            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink transition-colors hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => setIndex((i) => (i + 1) % count)}
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-ink transition-colors hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
