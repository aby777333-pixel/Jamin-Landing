"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * An image you can actually read.
 *
 * Journal covers are frequently dense infographics — a 21-step checklist set in
 * 10px type. Shown at column width the words are decorative rather than
 * legible, and cropping one to fit a card slot removes the very content it
 * exists to carry. So the inline image is never cropped, and it opens into a
 * viewer that zooms and pans.
 *
 * Deliberately hand-built rather than a lightbox dependency: this is ~3KB and
 * the brief caps total added JS at 12KB.
 *
 * Everything animates on `transform` only — no layout property is touched, so
 * opening the viewer cannot shift the page behind it.
 */
const STEP = 0.5;
const MIN = 1;
const MAX = 5;

export function ZoomableImage({
  src,
  alt,
  priority = false,
  className = "",
  sizes = "(max-width: 1280px) 100vw, 1200px",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
}) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  /** Whether the pointer travelled between down and up — see the click handler. */
  const moved = useRef(false);
  /* The cursor depends on whether a drag is in progress, and a ref cannot be
     read during render — so the fact of dragging is state even though the
     coordinates stay in the ref, where they belong. */
  const [dragging, setDragging] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const reset = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  // Zooming back out to 1 should also recentre, or the image can be left
  // parked off-screen with no way to find it again.
  const zoom = useCallback((next: number) => {
    const s = Math.min(MAX, Math.max(MIN, next));
    setScale(s);
    if (s === 1) setPan({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "+" || e.key === "=") zoom(scale + STEP);
      if (e.key === "-") zoom(scale - STEP);
      if (e.key === "0") reset();
    };
    document.addEventListener("keydown", onKey);
    // The page behind must not scroll while the viewer is up.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, zoom, reset, scale]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Open ${alt} at full size`}
        className={`group relative block w-full cursor-zoom-in overflow-hidden rounded-card border border-line bg-canvas-sunken ${className}`}
      >
        {/* No fixed ratio and no `object-cover`: the whole image, always. */}
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={600}
          priority={priority}
          sizes={sizes}
          className="h-auto w-full"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1.5 text-micro font-semibold uppercase tracking-[0.12em] text-canvas opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 max-lg:opacity-100"
        >
          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5 14 14M7 5v4M5 7h4" strokeLinecap="round" />
          </svg>
          Zoom
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-50 flex flex-col bg-charcoal/95"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 px-phi3 py-phi2">
            <p className="ledger min-w-0 truncate text-tiny text-white/70">
              {Math.round(scale * 100)}%
            </p>
            <div className="flex items-center gap-1.5">
              <ViewerButton onClick={() => zoom(scale - STEP)} disabled={scale <= MIN} label="Zoom out">
                &minus;
              </ViewerButton>
              <ViewerButton onClick={reset} disabled={scale === 1 && pan.x === 0 && pan.y === 0} label="Reset zoom">
                Fit
              </ViewerButton>
              <ViewerButton onClick={() => zoom(scale + STEP)} disabled={scale >= MAX} label="Zoom in">
                +
              </ViewerButton>
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                className="rounded-full border border-white/25 px-4 py-1.5 text-micro font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:border-white/60"
              >
                Close
              </button>
            </div>
          </div>

          <div
            className="min-h-0 flex-1 overflow-hidden"
            style={{ cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
            onWheel={(e) => zoom(scale + (e.deltaY < 0 ? STEP : -STEP))}
            onPointerDown={(e) => {
              moved.current = false;
              if (scale <= 1) return;
              drag.current = { x: e.clientX, y: e.clientY, px: pan.x, py: pan.y };
              setDragging(true);
              (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            }}
            onPointerMove={(e) => {
              const d = drag.current;
              if (!d) return;
              // A few pixels of travel while pressing is a drag, not a click.
              // Without this threshold, panning the image and releasing over
              // the surround would be read as "clicked outside" and close it.
              if (Math.abs(e.clientX - d.x) > 4 || Math.abs(e.clientY - d.y) > 4) {
                moved.current = true;
              }
              setPan({ x: d.px + (e.clientX - d.x), y: d.py + (e.clientY - d.y) });
            }}
            onPointerUp={() => {
              drag.current = null;
              setDragging(false);
            }}
            onPointerCancel={() => {
              drag.current = null;
              setDragging(false);
            }}
            /* Clicking the surround closes, which is what everyone tries before
               reaching for Escape. The image itself is excluded so a mis-click
               while reading does not dismiss the thing being read. */
            onClick={(e) => {
              if (moved.current) return;
              if ((e.target as HTMLElement).tagName !== "IMG") close();
            }}
            onDoubleClick={() => zoom(scale > 1 ? 1 : 2)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              draggable={false}
              className="mx-auto h-full w-auto max-w-none object-contain will-change-transform"
              style={{
                transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${scale})`,
                transformOrigin: "center center",
              }}
            />
          </div>

          <p className="shrink-0 px-phi3 pb-phi2 text-center text-micro text-white/50">
            Scroll or use + and &minus; to zoom &middot; drag to move &middot; click outside or press
            Esc to close
          </p>
        </div>
      )}
    </>
  );
}

function ViewerButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="min-w-9 rounded-full border border-white/25 px-3 py-1.5 text-tiny font-semibold text-white transition-colors hover:border-white/60 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
