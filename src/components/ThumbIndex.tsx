import Link from "next/link";
import { districtSlug } from "@/lib/site";

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
            className={`rj-deboss flex items-center rounded-l-md border border-r-0 border-line py-3 pl-1.5 pr-1 text-micro uppercase tracking-brand transition-colors ${
              active
                ? "bg-champagne-500/15 text-champagne-700"
                : "bg-canvas-alt text-ink-faint hover:text-ink-muted"
            }`}
            style={{ writingMode: "vertical-rl", rotate: "180deg" }}
          >
            {d}
          </Link>
        );
      })}
    </nav>
  );
}
