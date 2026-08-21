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
/**
 * The three lightbox controls share one recipe so they cannot drift apart
 * again — same height, same ring, same scrim. Only the width and the label
 * differ at the call sites.
 *
 * ⚠️ `bg-onyx-900`, NEVER `bg-ink`. The dark scope sets
 * `--color-ink: var(--color-bone)`, so an ink scrim INVERTS to a light wash
 * in carbon while `text-white` on it does not — which is exactly how these
 * three came to be white on white. `--color-onyx-900` is not remapped by
 * that scope, so it is the same colour in both modes.
 */
const CONTROL =
  "grid h-12 place-items-center rounded-full border border-white/40 bg-onyx-900/80 text-white shadow-raise backdrop-blur transition hover:bg-onyx-900";

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
      {/* 🚨 THE PRINTED GALLERY (report 11, 2026-08-21: "All important
          property images should be printed as actual images. Do not show:
          +2 more, gallery controls, wishlist icon, carousel controls"). The
          interactive grid below is print-hidden — its "+N more" scrim and
          button chrome with it — and this print-only grid prints EVERY image
          as a plain figure. Plain <img>, not next/image: the optimiser
          pipeline buys nothing on paper. `loading="lazy"` is safe here —
          Chromium force-loads lazy images when building print preview — and
          it keeps the hidden grid from costing every screen visitor the full
          set. */}
      <div className="rj-print-only">
        <div className="grid grid-cols-2 gap-3">
          {images.map((src) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={src}
              src={src}
              alt={title}
              loading="lazy"
              decoding="async"
              className="aspect-[1.618/1] w-full rounded-card border border-line object-cover"
              style={{ breakInside: "avoid" }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-2 print:hidden sm:grid-cols-[1.618fr_1fr]">
        <button
          onClick={() => setOpen(0)}
          className="rj-sheen group relative aspect-[1.618/1] overflow-hidden rounded-card bg-canvas-sunken sm:aspect-auto sm:h-full"
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
                className="rj-sheen group relative aspect-[1.618/1] overflow-hidden rounded-card bg-canvas-sunken"
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
                {/* ⚠️ `z-10` PUTS THE SCRIM ABOVE `rj-sheen`, and it is a
                    contrast guard rather than a stacking preference. The sheen
                    is a generated ::after, so it paints above every real child —
                    including this scrim. Its band is white at 0.22, and over a
                    bright photograph the 72% ink ground already sits near
                    rgb(88); the band lifts it to ~rgb(125), where this white
                    count measures about 4.2:1 and drops under AA for the second
                    or so the sweep lasts. Transient or not, the number is the
                    one thing here a reader has to be able to read. Above the
                    sheen, the sweep passes beneath it untouched. */}
                {i === 1 && images.length > 3 && (
                  <span className="absolute inset-0 z-10 grid place-items-center bg-onyx-900/72 text-base font-medium text-white backdrop-blur-[2px]">
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
          className="fixed inset-0 z-[60] flex items-center justify-center bg-onyx-900/95 p-4"
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
            /* 🚨 THREE THINGS AT ONCE (owner, 2026-08-19 evening: "close and
                 forward, backward arrows are not visible. Drag the tab
                 little down. make the tabs same height").

                 · `bg-onyx-900`, not `bg-ink` — the note on CONTROL above
                   explains it. That is the whole reason it was invisible.
                 · `top-6 sm:top-8`, down from `top-4`. It sat hard against
                   the window edge, level with the site header showing
                   through the (then light) scrim.
                 · `h-12` via CONTROL, which is the arrows' height. It was
                   `py-2` — about 34px against their 48 — so the three
                   controls were two different sizes. `px-5` keeps the word
                   off the ends now the box is taller. */
              className={`absolute right-3 top-6 px-5 text-tiny uppercase tracking-[0.12em] sm:right-4 sm:top-8 ${CONTROL}`}
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
                className={`absolute left-3 top-1/2 w-12 -translate-y-1/2 text-xl sm:left-4 ${CONTROL}`}
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  move(1);
                }}
                className={`absolute right-3 top-1/2 w-12 -translate-y-1/2 text-xl sm:right-4 ${CONTROL}`}
                aria-label="Next image"
              >
                →
              </button>
              <div className="ledger absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/25 bg-onyx-900/80 px-3 py-1 text-tiny text-white/90 backdrop-blur">
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
