"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

/**
 * Property gallery with a full-screen lightbox.
 *
 * Escape closes and the arrow keys move, because a full-screen overlay with no
 * keyboard exit is a trap — and the listener is only bound while the lightbox
 * is actually open.
 */
export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);

  const move = useCallback(
    (d: number) => setOpen((i) => (i == null ? i : (i + d + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (open == null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") move(1);
      if (e.key === "ArrowLeft") move(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, move]);

  if (images.length === 0) return null;

  const [lead, ...rest] = images;

  return (
    <>
      <div className="grid gap-2 sm:grid-cols-[1.618fr_1fr]">
        <button
          onClick={() => setOpen(0)}
          className="group relative aspect-[1.618/1] overflow-hidden rounded-card bg-canvas-sunken sm:aspect-auto sm:h-full"
          aria-label={`Open gallery for ${title}`}
        >
          <Image
            src={lead}
            alt={title}
            fill
            priority
            sizes="(max-width: 640px) 100vw, 60vw"
            className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
          />
        </button>

        {rest.length > 0 && (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-1 sm:grid-rows-2">
            {rest.slice(0, 2).map((src, i) => (
              <button
                key={src}
                onClick={() => setOpen(i + 1)}
                className="group relative aspect-[1.618/1] overflow-hidden rounded-card bg-canvas-sunken"
                aria-label={`Open image ${i + 2} of ${images.length}`}
              >
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 38vw"
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
                {i === 1 && images.length > 3 && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/55 text-base font-medium text-white backdrop-blur-[2px]">
                    +{images.length - 3} more
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {open != null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
          onClick={() => setOpen(null)}
        >
          <div className="relative h-full w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[open]}
              alt={`${title} — image ${open + 1} of ${images.length}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          <button
            onClick={() => setOpen(null)}
            className="absolute right-5 top-5 rounded-full border border-white/25 px-4 py-2 text-tiny uppercase tracking-[0.12em] text-white transition hover:bg-white/10"
          >
            Close
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  move(-1);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/25 px-4 py-3 text-white transition hover:bg-white/10"
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  move(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/25 px-4 py-3 text-white transition hover:bg-white/10"
                aria-label="Next image"
              >
                →
              </button>
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-tiny text-white/70">
                {open + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
