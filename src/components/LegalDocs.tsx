"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * The three legal documents in the footer (owner, 2026-09-03: "add the
 * attached in the footer, when clicked it pop ups with a close button").
 *
 * The documents are the owner's own PDFs, served as-is from `public/legal/`
 * — they are the signed instruments, not copy to be re-typeset, so they are
 * shown inside a frame rather than rebuilt as pages. Each also opens in a
 * new tab from inside the popup: a phone browser may refuse to render a PDF
 * inline, and a reader who wants to save or print the document should have
 * the file itself, not a picture of it.
 *
 * ⚠️ PORTALLED TO <body>. The footer re-scopes the colour tokens to onyx
 * (`.rj-footer`) and gold (`.rj-gilded`); a popup rendered inside it would
 * inherit both and read as a footer fragment floating over the page. On the
 * body it takes the page's own tokens, so it is ivory in light mode, onyx in
 * carbon and cream in grove like every other panel. This is also the repo's
 * standing overlay pattern (MasterPlan's plot sheet) — a fixed overlay inside
 * a stacking context gets trapped under it.
 *
 * ⚠️ NO `<dialog>` element. It would have been the shorter answer, but the
 * repo's overlays are all portalled divs with their own focus handling, and
 * one native dialog among them would be the only element on the site whose
 * backdrop, close semantics and z-order the stylesheet does not own.
 */
const DOCS = [
  { key: "privacy", label: "Privacy Policy", file: "/legal/jamin-bazaar-privacy-policy.pdf" },
  { key: "refund", label: "Booking & Refund Policy", file: "/legal/jamin-bazaar-booking-refund-policy.pdf" },
  { key: "terms", label: "Terms of Use", file: "/legal/jamin-bazaar-terms-of-use.pdf" },
] as const;

type DocKey = (typeof DOCS)[number]["key"];

export function LegalDocs() {
  const [open, setOpen] = useState<DocKey | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const doc = DOCS.find((d) => d.key === open) ?? null;

  /* Escape closes; the page behind does not scroll while the popup is up;
     focus lands on the close button so a keyboard reader is never stranded
     behind the overlay. All three are undone on close. */
  useEffect(() => {
    if (!doc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    const t = setTimeout(() => closeRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [doc]);

  return (
    <>
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 print:hidden" aria-label="Legal documents">
        {DOCS.map((d) => (
          <li key={d.key}>
            <button
              type="button"
              onClick={() => setOpen(d.key)}
              className="rj-underline text-tiny text-ink-faint transition-colors hover:text-champagne-300"
            >
              {d.label}
            </button>
          </li>
        ))}
      </ul>

      {doc &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/60 p-0 sm:items-center sm:p-6"
            onClick={() => setOpen(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={doc.label}
              onClick={(e) => e.stopPropagation()}
              className="flex h-[92dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-card border border-line bg-canvas shadow-raise sm:h-[88dvh] sm:rounded-card"
            >
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p className="text-micro font-semibold uppercase tracking-[0.18em] text-ink-faint">
                    Jamin Bazaar
                  </p>
                  <h2 className="truncate text-lg text-ink">{doc.label}</h2>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <a
                    href={doc.file}
                    target="_blank"
                    rel="noopener"
                    className="hidden rounded-full border border-line px-3 py-1.5 text-tiny font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink sm:inline-flex"
                  >
                    Open in new tab
                  </a>
                  <button
                    ref={closeRef}
                    type="button"
                    onClick={() => setOpen(null)}
                    aria-label="Close"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line text-xl leading-none text-ink transition-colors hover:border-ink-faint hover:bg-canvas-alt"
                  >
                    ×
                  </button>
                </div>
              </div>
              {/* The PDF itself. `#toolbar=0` asks Chromium's viewer to hide
                  its own chrome so the document sits inside ours; other
                  viewers ignore the fragment harmlessly. */}
              <iframe
                src={`${doc.file}#toolbar=0&navpanes=0`}
                title={doc.label}
                className="min-h-0 w-full flex-1 bg-canvas-alt"
              />
              <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5 text-tiny text-ink-faint sm:px-5">
                <span>Effective 16 Aug 2026 · Jamin Properties I PVT LTD</span>
                {/* On a phone the header keeps only the close button; the
                    file link lives here, where there is room for it. */}
                <a href={doc.file} target="_blank" rel="noopener" className="rj-underline text-ink-soft hover:text-ink sm:hidden">
                  Open the PDF
                </a>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
