"use client";

import { SurveyIcon } from "@/components/cadastral/SurveyIcon";

/**
 * "Passport" — the printed record of a project, on one sheet.
 *
 * 🚨 IT IS THE BROWSER'S OWN PRINT DIALOGUE, NOT A GENERATED PDF, AND THE LABEL
 * SAYS SO. The app builds real PDFs through a Supabase edge function; this site
 * cannot deploy edge functions (no access token on this machine) and pulling a
 * PDF library into the client would add hundreds of kilobytes to a route whose
 * whole argument is that it loads fast.
 *
 * What makes that an honest answer rather than a shortcut: the deed sheet in
 * royal.css already lays this page out as a document — controls suppressed,
 * records kept whole, A4 portrait with a filing margin, a print-only masthead.
 * "Save as PDF" is the destination in every print dialogue on every platform,
 * so the reader gets a real PDF; it is simply their renderer producing it
 * rather than ours. It also works offline and costs nothing to serve.
 *
 * ⚠️ The button is `print:hidden` — a control that appears in its own output is
 * the classic printed-page bug.
 *
 * ⚠️ No `onBeforePrint` state, no "preparing…" spinner. `window.print()` is
 * synchronous and blocking; anything set before it would not paint until after
 * the dialogue closed, which is the opposite of what a spinner is for.
 */
/**
 * 🚨 THE PRINT-ONLY IMAGES ARE FORCED IN BEFORE THE DIALOGUE OPENS (report 18,
 * 2026-09-03: "property images are missing from the downloaded PDF"). The
 * printed gallery and the sanctioned sheet live in `.rj-print-only` blocks
 * that are `display:none` on screen and carry `loading="lazy"` — so they had
 * never intersected a viewport and had never been fetched. Chromium's
 * force-load of lazy images for print preview did not reach them in
 * practice: preview rasterised with empty frames. Flipping them to `eager`
 * starts the fetch whether or not they are displayed; the dialogue then
 * waits for the loads (capped at four seconds so a slow image can never
 * hold the button hostage). No React state is set — see the note above on
 * why nothing may be set before `window.print()`.
 */
async function printWithImages() {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".rj-print-only img"));
  const pending = imgs
    .filter((img) => !img.complete || img.naturalWidth === 0)
    .map(
      (img) =>
        new Promise<void>((resolve) => {
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
          img.loading = "eager";
          // Re-assigning the source is what wakes a lazy image the browser
          // has already decided not to fetch.
          const src = img.currentSrc || img.src;
          if (src) img.src = src;
        }),
    );
  if (pending.length) {
    await Promise.race([
      Promise.all(pending),
      new Promise<void>((resolve) => setTimeout(resolve, 4000)),
    ]);
  }
  window.print();
}

export function PassportButton() {
  return (
    <button
      type="button"
      onClick={() => {
        void printWithImages();
      }}
      /* 🚨 A STEP LARGER (report 14, 2026-08-21: "keep the Print button clearly
         visible and increase its size slightly. Or keep it at the top of the
         page at the right side" — it already moved to the header's top right
         in report 11, so this is the other half of the ask). `font-semibold`
         + `text-ink-soft` lift it off the page without turning a secondary
         utility into a call to action; the mark grows with it. */
      className="rj-deboss inline-flex min-h-[44px] items-center gap-2 rounded-full border border-line bg-canvas-alt px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.1em] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink print:hidden"
    >
      <SurveyIcon name="deed" size="h-[18px] w-[18px]" className="shrink-0 text-champagne-500" />
      Print this record
      {/* Named plainly. "Download passport" would promise a file this does not
          produce, and the reader's own dialogue is where the choice between
          paper and PDF actually gets made. */}
    </button>
  );
}
