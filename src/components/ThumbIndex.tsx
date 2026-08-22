"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { districtSlug } from "@/lib/site";
import { DISTRICT_STONE, STONE_FALLBACK } from "@/lib/stones";

/**
 * The district rail: a shortcut to the other districts, pinned to the right
 * margin, so a reader can go straight to one without going back through a menu.
 *
 * It is the one navigation object that suits this site's shape exactly — four
 * districts, a fixed set that does not grow with the catalogue.
 *
 * 🚨 IT WAS A FORE-EDGE THUMB INDEX AND IT IS A PANEL NOW (report 12,
 * 2026-08-21: "the right-side district sidebar is being clipped. All district
 * options are not fully visible, and the sidebar is squeezed into a very narrow
 * vertical area. The district names are also displayed vertically, making the
 * filter difficult to read and use. Expected: the complete district filter
 * should be clearly visible as a proper right-side sticky panel").
 *
 * The ledger-tab metaphor was the problem, not its implementation. Cut tabs are
 * 56px wide with the label set on its side, so "Tiruchirappalli" ran 130px of
 * vertical type up a tab flush to the window edge — and at a shorter viewport
 * the four tabs, centred as a group, ran past the top and bottom of the screen
 * with no way to reach them. Every failure the report lists follows from
 * turning the words on their side.
 *
 * So the names read horizontally in a real panel: a bordered card on the right
 * margin with a heading, one row per district, the district's stone as a dot
 * and the active row filled. `max-h` + `overflow-y-auto` means a fifth and
 * sixth district scroll INSIDE the panel instead of off the screen — the
 * clipping the report describes cannot come back by adding data.
 *
 * ⚠️ `xl` AND UP ONLY, unchanged and for the unchanged reason: below that there
 * is no margin outside the measure to put it in. The districts are in the
 * header's Locations panel and in the footer at every width, so nothing is
 * lost — this is a shortcut, never the only path.
 *
 * ⚠️ `aria-hidden` is WRONG here. These are real navigation links to real
 * pages; hiding them would take four routes away from a keyboard or
 * screen-reader user to save them a duplicate. It is a labelled `<nav>` with
 * `aria-current` on the active row instead.
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
  /**
   * 🚨 IT STAYS OFF THE HERO (report 12, 2026-08-21, filed against the Salem
   * page as "the Jamin Bazaar branding/signage in the hero image is partially
   * covered by the hero content/overlay… the logo and JAMIN BAZAAR text on the
   * right side are not clearly visible").
   *
   * ⚠️ THE OVERLAY WAS THIS COMPONENT, NOT THE HERO'S OWN COPY PLATE. Measured
   * on the built page at 1440x900: hero-58's wall lockup lands at screen
   * 1109–1391 and the plate ends at 723, so the plate never touches it — but
   * the district rail is pinned to the right margin at the viewport's vertical
   * centre, which on a `tall` hero is inside the hero. It was sitting directly
   * on the lockup. Re-cropping the frame would have "fixed" a symptom whose
   * cause is a different element entirely.
   *
   * So the rail waits: nothing is drawn until the reader has scrolled a
   * viewport-ish distance, by which point the hero is behind them and the rail
   * is over the listing it belongs to. That also answers the shortcut's own
   * logic — it is for jumping between districts once you are reading one, and
   * before the first scroll there is nothing to jump from.
   *
   * ⚠️ A passive scroll listener, the pattern HeaderShell already uses, and
   * `useState` initialised FALSE so the server render and the first client
   * render agree. It re-reads on mount, so a reader who lands deep-linked
   * mid-page (or restores a scroll position) gets the rail immediately.
   */
  const [past, setPast] = useState(false);

  useEffect(() => {
    const onScroll = () => setPast(window.scrollY > window.innerHeight * 0.75);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /**
   * 🚨 IT NO LONGER SITS ON TOP OF THE PAGE (report 17: "The Districts popup is
   * overlapping important content on the right side of the page… must not cover
   * or interfere with any content").
   *
   * The rail is `fixed right-4`, so it is pinned to the VIEWPORT while the page
   * content is a `max-w-[1280px]` column centred in it. The gutter beside that
   * column is `(innerWidth - 1280) / 2`; the rail needs its own width plus its
   * margins to live there. At 1440 the gutter is 80px and the rail is 192px, so
   * 112px of it lay across the cards — which is exactly what the report shows.
   *
   * `roomy` is that arithmetic. When the gutter cannot hold the rail it starts
   * COLLAPSED to a tab, which is the report's first ask ("automatically close");
   * the toggle below is its second ("provide a clear open/close arrow toggle"),
   * and it is always available so a reader on a narrow screen can still open the
   * rail deliberately and close it again.
   *
   * ⚠️ `userOpen` OVERRIDES, IT DOES NOT INITIALISE. Deriving one from the
   * other in an effect would fight the reader: every resize would slam the rail
   * back to whatever the measurement said and discard their choice. `null` means
   * "nobody has decided", so the measurement governs until they touch it.
   *
   * ⚠️ Starts `false` and is measured on mount for the same reason `past` does:
   * the server render and the first client render have to agree.
   */
  const RAIL_W = 192; /* w-48 */
  const RAIL_GAP = 24; /* right-4 plus a little air */
  const CONTENT_MAX = 1280; /* the Container's max width */
  const [roomy, setRoomy] = useState(false);
  const [userOpen, setUserOpen] = useState<boolean | null>(null);

  useEffect(() => {
    const measure = () => {
      const gutter = (window.innerWidth - Math.min(CONTENT_MAX, window.innerWidth)) / 2;
      setRoomy(gutter >= RAIL_W + RAIL_GAP);
    };
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  const open = userOpen ?? roomy;

  if (districts.length < 2) return null;

  return (
    <nav
      aria-label="Districts"
      /* ⚠️ `print:hidden` — a fixed panel would stamp itself over the sheet. */
      className={`fixed right-4 top-1/2 z-20 hidden -translate-y-1/2 overflow-hidden rounded-card border border-line bg-canvas/95 shadow-lift backdrop-blur transition-opacity duration-500 print:hidden xl:block ${
        open ? "w-48" : "w-auto"
      } ${past ? "opacity-100" : "pointer-events-none opacity-0"}`}
      /* The panel can never be taller than the space between the header and
         the foot of the window; past that it scrolls itself. */
      style={{ maxHeight: "calc(100vh - var(--header-h) - 4rem)" }}
    >
      {/* ⚠️ THE TOGGLE IS A REAL BUTTON WITH A REAL NAME, not a bare chevron.
          `aria-expanded` states which way it will go and the label says what it
          controls, so a screen-reader user gets the same affordance the arrow
          gives a sighted one. Collapsed, this button IS the whole rail — which
          is why it keeps the 44px touch floor the rows below use. */}
      <button
        type="button"
        onClick={() => setUserOpen(!open)}
        aria-expanded={open}
        aria-label={open ? "Collapse the districts shortcut" : "Open the districts shortcut"}
        className={`flex min-h-[44px] w-full items-center gap-2 px-phi2 py-2 text-micro font-semibold uppercase tracking-brand text-jamin-gold-ink transition-colors hover:text-ink ${
          open ? "justify-between border-b border-line" : "justify-center"
        }`}
      >
        {open && <span>Districts</span>}
        <svg
          viewBox="0 0 12 12"
          className="h-3 w-3 shrink-0"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Points RIGHT to close (push the rail off to the margin) and LEFT
              to open (pull it back onto the page) — the direction the panel
              will actually travel, not an abstract up/down. */}
          <path d={open ? "M4.5 2.5 8 6l-3.5 3.5" : "M7.5 2.5 4 6l3.5 3.5"} />
        </svg>
        {!open && <span className="sr-only">Districts</span>}
      </button>
      {/* Collapsed, the rail is just its tab — the rows are removed from the
          tree rather than hidden, so nothing inside them is focusable behind a
          closed panel. */}
      {open && (
      <ul className="max-h-[inherit] overflow-y-auto p-1.5">
        {districts.map((d) => {
          const active = current?.toLowerCase() === d.toLowerCase();
          /* CARTOUCHE round 2026-08-17 — "color code all the tabs". Each row
             carries its DISTRICT STONE, the same colour its filter pill and its
             card jewellery already wear, so the rail reads as a colour-coded
             register. The stone is the DOT and the wash, never the word — the
             stones are illegible as 10px labels (see lib/stones.ts); the label
             stays ink. */
          const stone = DISTRICT_STONE[d] ?? STONE_FALLBACK;
          return (
            <li key={d}>
              <Link
                href={`/locations/${districtSlug(d)}`}
                aria-current={active ? "page" : undefined}
                /* `min-h-[44px]` — WCAG 2.5.8's floor, which the old vertical
                   tab met by accident of its text length and this meets by
                   construction. */
                className={`flex min-h-[44px] items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-tiny font-semibold transition-colors ${
                  active ? "text-ink" : "text-ink-soft hover:text-ink"
                }`}
                style={{
                  background: active
                    ? `color-mix(in srgb, ${stone} 18%, transparent)`
                    : undefined,
                  boxShadow: active ? `inset 3px 0 0 0 ${stone}` : undefined,
                }}
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: stone, opacity: active ? 1 : 0.55 }}
                />
                {/* The name reads across, which is the whole fix. `truncate`
                    is the backstop for a district longer than any in the
                    catalogue; at 12rem of row "Tiruchirappalli" fits. */}
                <span className="truncate">{d}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      )}
    </nav>
  );
}
