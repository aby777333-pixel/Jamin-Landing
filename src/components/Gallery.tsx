"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
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
                {/* The scrim was 55% ink, which is not a guaranteed contrast
                    ratio over an unknown photograph — a bright image beneath
                    left the white count at roughly 3:1. 72% holds AA whatever
                    the photo turns out to be. */}
                {i === 1 && images.length > 3 && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/72 text-base font-medium text-white backdrop-blur-[2px]">
                    +{images.length - 3} more
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ⚠️ PORTALLED TO `document.body`, and `z-50` alone could never have
          fixed this. cadastral.css gives `body > main` `z-index: 2`, which makes
          it a STACKING CONTEXT — so this overlay's 50 was only ever 50 *inside
          main*, and the header, a sibling of main at z-40, painted over it. The
          reported symptom was the navbar sitting on top of the fullscreen image
          with the Close button half-covered and unclickable.
          ZoomableImage already portals for exactly this reason; the gallery and
          the plot sheet were the two that had not been given the same fix. */}
      {open != null && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
          onClick={() => setOpen(null)}
        >
          {/* A constant stage. Filling the whole overlay meant a landscape shot
              sat as a thin centred band and a portrait one nearly filled the
              screen, so moving between them read as the layout jumping. The box
              is now fixed and the picture is centred inside it — every image is
              shown whole, in the same frame. */}
          <div
            className="relative aspect-[1.618/1] w-full max-w-6xl overflow-hidden rounded-card bg-white/[0.04] sm:h-full sm:max-h-[82vh] sm:aspect-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
            className="absolute right-4 top-4 rounded-full border border-white/30 bg-ink/70 px-4 py-2 text-tiny uppercase tracking-[0.12em] text-white backdrop-blur transition hover:bg-ink/90"
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
                className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-ink/70 text-xl text-white backdrop-blur transition hover:bg-ink/90 sm:left-4"
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  move(1);
                }}
                className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full border border-white/30 bg-ink/70 text-xl text-white backdrop-blur transition hover:bg-ink/90 sm:right-4"
                aria-label="Next image"
              >
                →
              </button>
              <div className="ledger absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-ink/70 px-3 py-1 text-tiny text-white/85 backdrop-blur">
                {open + 1} / {images.length}
              </div>
            </>
          )}
        </div>,
        document.body,
      )}
    </>
  );
}
