import Link from "next/link";
import { districtSlug } from "@/lib/site";
import { DISTRICT_STONE, STONE_FALLBACK } from "@/lib/stones";

/**
 * The thumb index: a ledger's cut tabs down the fore-edge, so a reader can go
 * straight to a district without going back through a menu.
 *
 * It is the one navigation object that suits this site's shape exactly — four
 * districts, a fixed set that does not grow with the catalogue, which is
 * precisely when a thumb index works and precisely why it fails on a site with
 * forty sections.
 *
 * ⚠️ `xl` AND UP ONLY, and not because narrow screens are an afterthought.
 * Below that the rail would sit over the measure; a physical thumb index lives
 * on the margin outside the text block, and there is no margin to spare on a
 * phone. The districts are already in the header's Locations panel and in the
 * footer at every width, so nothing is lost — this is a shortcut, never the
 * only path.
 *
 * ⚠️ `aria-hidden` is WRONG here and was my first instinct. These are real
 * navigation links to real pages; hiding them would take four routes away from
 * a keyboard or screen-reader user to save them a duplicate. It is a labelled
 * `<nav>` with `aria-current` on the active tab instead — the duplication is
 * the honest cost of a shortcut.
 *
 * ⚠️ `fixed`, so it must clear the sticky header — `--header-h` is the token
 * that owns that, never a guessed pixel value.
 */
export function ThumbIndex({
  districts,
  current,
}: {
  districts: string[];
  current?: string | null;
}) {
  if (districts.length < 2) return null;

  return (
    <nav
      aria-label="Districts"
      className="fixed right-0 z-20 hidden -translate-y-1/2 flex-col gap-1 xl:flex"
      style={{ top: "calc(var(--header-h) + 50vh - var(--header-h) / 2)" }}
    >
      {districts.map((d) => {
        const active = current?.toLowerCase() === d.toLowerCase();
        /* CARTOUCHE round 2026-08-17 — "color code all the tabs". Each tab
           carries its DISTRICT STONE, the same colour its filter pill and its
           card jewellery already wear, so the fore-edge reads as a colour-coded
           register. The stone is the TINT and the EDGE BAR, never the word —
           the stones are illegible as 10px labels (see lib/stones.ts); the
           label stays ink. */
        const stone = DISTRICT_STONE[d] ?? STONE_FALLBACK;
        return (
          <Link
            key={d}
            href={`/locations/${districtSlug(d)}`}
            aria-current={active ? "page" : undefined}
            /* The tab is rounded on its OUTER edge only and flush to the
               viewport edge — a cut tab is part of the page, not a floating
               pill beside it. `writing-mode` sets the label up the tab the way
               a spine does; `rotate-180` on the vertical text makes it read
               bottom-to-top, which is the direction a right-hand edge is read. */
            /* ⚠️ `min-h-[44px]` and a 44px-wide box: these are the smallest
               targets added in this round and WCAG 2.5.8's floor is 44x44. The
               label is vertical, so height comes from the text and only the
               WIDTH needed asserting — `pl-2.5 pr-2` plus the border lands it
               at 44 exactly. */
            className={`rj-deboss flex min-h-[44px] items-center rounded-l-md border border-r-0 border-line py-3 pl-2.5 pr-2 text-micro uppercase tracking-brand transition-colors ${
              active ? "text-ink" : "text-ink-faint hover:text-ink-muted"
            }`}
            style={{
              writingMode: "vertical-rl",
              rotate: "180deg",
              /* The stone tints the tab and draws a 3px bar on the viewport
                 edge (visually the right edge; after the 180° rotation that is
                 this box's left). Active tabs deepen the tint rather than
                 changing colour — same hue, more of it.
                 ⚠️ SEE-THROUGH (owner 2026-08-17): the mix is with TRANSPARENT
                 now, not with the canvas, and a light blur frosts whatever the
                 tab hangs over — hero photograph included — so the page reads
                 through the tab the way it does through the copy plates. */
              background: `color-mix(in srgb, ${stone} ${active ? 30 : 14}%, transparent)`,
              backdropFilter: "blur(8px)",
              boxShadow: `inset 3px 0 0 0 ${stone}`,
              borderColor: `color-mix(in srgb, ${stone} 40%, transparent)`,
            }}
          >
            {d}
          </Link>
        );
      })}
    </nav>
  );
}
