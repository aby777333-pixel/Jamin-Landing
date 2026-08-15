"use client";

import type { Heading } from "@/components/Prose";
import { useActiveHeading } from "@/hooks/useActiveHeading";

/**
 * The running head: the book convention where the verso carries the work and
 * the recto carries the chapter, so a reader who looks up always knows where
 * they are without turning back.
 *
 * A long guide here can run past twenty screens. The article title scrolls away
 * in the first one and never returns, and `TableOfContents` — which knows the
 * answer — is a sidebar that does not exist below `xl`.
 *
 * ⚠️ IT SHARES `useActiveHeading` WITH THE CONTENTS LIST RATHER THAN COMPUTING
 * ITS OWN. Two scroll heuristics would disagree somewhere in the middle of a
 * long page, and both would look right in isolation.
 *
 * ⚠️ Offset by `--header-h`, the token the sticky navbar owns. Anything fixed
 * to the top of this site has to compose with that header rather than guess a
 * pixel value — the site-wide sticky header is itself a fixed high-priority
 * bug, and a hard-coded offset here would break the moment it changes.
 *
 * ⚠️ NO FOLIO NUMBER, deliberately. A folio is a page number and a continuously
 * scrolling document does not have pages, so any number printed here would be
 * invented — the same rule that keeps the title block free of a revision letter
 * and the chain of record free of a patta reference. What a web article does
 * have is sections, so the section is what it names.
 *
 * ⚠️ `aria-hidden`: every word here is already on the page — the title as the
 * `<h1>`, the section as the heading it names — and the contents list is the
 * real navigation. This is orientation for the eye, and a screen reader has
 * better ways to answer the same question.
 */
export function RunningHead({ title, headings }: { title: string; headings: Heading[] }) {
  const active = useActiveHeading(headings);
  const section = headings.find((h) => h.id === active);

  /* Nothing to orient by on a short piece: under three headings the contents
     list is not drawn either, and a running head on a two-screen article is
     furniture for its own sake. */
  if (headings.length <= 2) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none sticky z-30 hidden lg:block"
      style={{ top: "var(--header-h)" }}
    >
      <div className="flex items-baseline justify-between gap-phi3 border-b border-line/70 bg-canvas/85 px-phi3 py-1.5 backdrop-blur">
        {/* Verso: the work. `truncate` on both, and `min-w-0` on the flex items
            themselves — a long place name in a heading has pushed this site
            sideways before, and a truncate on a child cannot save an item whose
            default `min-width` is its content. */}
        <span className="ledger-label min-w-0 truncate text-ink-muted">{title}</span>
        {/* Recto: the chapter. */}
        <span className="ledger-label min-w-0 shrink-[2] truncate text-champagne-700">
          {section?.text ?? ""}
        </span>
      </div>
    </div>
  );
}
