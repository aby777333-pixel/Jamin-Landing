"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { SECURITY_FEATURES } from "./security-features";

/**
 * THE ELEVEN LAYERS, AS COLOURED TABS (owner 2026-08-23: "give tabs colours…
 * make the page interesting").
 *
 * ── WHY THE STRIP WRAPS RATHER THAN SCROLLS ────────────────────────────────
 * Eleven tabs do not fit on one line at any width this site supports, and the
 * two usual answers are both wrong here. A horizontally scrolling strip is the
 * failure mode the mobile rule exists to prevent — the site's standing
 * diagnosis of a broken phone layout is horizontal overflow, and a strip that
 * scrolls sideways is indistinguishable from a page that does. A `lg:` tab rail
 * plus a `<lg` accordion is two markup trees for one set of words, which means
 * every panel ships twice and a crawler reads the copy twice.
 *
 * So: one tree, `flex-wrap`. Measured in a 375-to-1440 sweep it is TWO rows
 * from `lg` (82px), three at 768 and five at 375 (193px); the document's
 * horizontal overflow is zero at every one of those widths and the strip never
 * scrolls inside itself. Eleven stones then read as a mosaic rather than as a
 * queue.
 *
 * ── WHY EVERY PANEL IS IN THE DOM ──────────────────────────────────────────
 * Only one panel is visible, but all eleven are rendered and the inactive ones
 * carry the `hidden` attribute. Rendering just the active panel would put ten
 * of the eleven security layers — most of the page's actual substance — behind
 * a click, where a crawler that does not run the click never sees them. The
 * cost is eleven short paragraphs of markup, which is nothing.
 *
 * ⚠️ IT FOLLOWS THAT A READER WITH NO JAVASCRIPT SEES PANEL ONE AND CANNOT
 * SWITCH. That is a knowing trade and it is the right way round: the words are
 * all in the document either way, so nothing is LOST without JS — only the
 * navigation is. The reverse build (hide with JS after paint, the trick
 * `Reveal` uses) would flash all eleven panels open on first paint for every
 * visitor, which is worse for everyone to fix a case that reads fine already.
 *
 * ── ACTIVATION IS AUTOMATIC ────────────────────────────────────────────────
 * Arrow keys move selection with focus (WAI-ARIA's automatic activation), which
 * is the correct pattern when panels are cheap and already in the DOM — there
 * is nothing to load, so making the reader press Enter as well is friction with
 * no payoff.
 */
export function SecurityTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number) => {
    const next = (i + SECURITY_FEATURES.length) % SECURITY_FEATURES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    /* ⚠️ Up/Down are bound as well as Left/Right, because the strip WRAPS.
       On a phone it is five stacked rows, so "the next tab" is visually below
       the current one as often as it is beside it, and binding only the
       horizontal pair would leave the vertical arrows doing nothing on the
       layout where they read as the obvious key. */
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        select(active + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        select(active - 1);
        break;
      case "Home":
        e.preventDefault();
        select(0);
        break;
      case "End":
        e.preventDefault();
        select(SECURITY_FEATURES.length - 1);
        break;
    }
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Security layers"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-2 sm:gap-2.5"
      >
        {SECURITY_FEATURES.map((f, i) => {
          const on = i === active;
          return (
            <button
              key={f.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`sec-tab-${f.key}`}
              aria-selected={on}
              aria-controls={`sec-panel-${f.key}`}
              /* Only the selected tab is in the tab order — the arrow keys are
                 how you reach the other ten, which is the whole point of the
                 roving tabindex. */
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              /* ⚠️ `backgroundColor`, never the `background` shorthand. The
                 shorthand resets `background-image`, and this button carries
                 one in its focus and hover states. It is the same trap that
                 turned every section numeral on this site into a solid
                 rectangle once. */
              style={
                {
                  "--stone": f.stone,
                  backgroundColor: on ? f.stone : undefined,
                } as CSSProperties
              }
              /* ⚠️ THE PHONE PADDING IS SMALLER AND IT IS BUYING ROWS. Eleven
                 chips at the desktop `px-3.5 py-2` wrap to five rows at 375px
                 where `px-3 py-1.5` wraps to four — and the strip sits between
                 the section heading and the first word of content, so every
                 row it sheds is a row of navigation the reader does not have
                 to scroll past. The tap target stays over 40px tall with the
                 uppercase line box, so nothing is lost to the thumb. */
              className={`group inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-tiny font-semibold uppercase tracking-[0.08em] transition-all duration-300 [transition-timing-function:var(--ease-silk)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--stone)] sm:px-3.5 sm:py-2 ${
                on
                  ? "text-white shadow-lift"
                  : "border border-ink/12 bg-canvas/70 text-ink-soft backdrop-blur-sm hover:-translate-y-0.5 hover:border-ink/30 hover:bg-canvas"
              }`}
            >
              {/* The stone, as a drop of colour beside the word rather than as
                  the word — see the header's own jewellery. On the selected
                  chip the ground has already taken the colour, so the dot goes
                  white or it disappears into it. */}
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] transition-colors duration-300"
                style={{ backgroundColor: on ? "rgba(255,255,255,0.9)" : f.stone }}
              />
              {f.tab}
            </button>
          );
        })}
      </div>

      {SECURITY_FEATURES.map((f, i) => {
        const on = i === active;
        return (
          <div
            key={f.key}
            role="tabpanel"
            id={`sec-panel-${f.key}`}
            aria-labelledby={`sec-tab-${f.key}`}
            hidden={!on}
            tabIndex={0}
            /* Both inks are published HERE, on the wrapper, so the heading
               and the note's rule inherit them and neither has to be told the
               feature it belongs to. `.rj-sec-title` / `.rj-sec-rule` in
               royal.css read them and swap to the dark value under
               `[data-mode="dark"]`.

               ⚠️ `f.ink`, NOT `f.stone` — see the note on the type. `--stone`
               below stays the FILL and is what the chip and the band take;
               these two are the WORD, and for gilt, jade and vermilion they
               are deliberately not the same colour. */
            style={
              {
                "--stone": f.stone,
                "--rj-sec-ink": f.ink,
                "--rj-sec-ink-dark": f.inkDark,
              } as CSSProperties
            }
            /* `mt-phi4` on the wrapper rather than on the inner card, so the
               hidden panels contribute no margin — a hidden element with a
               margin still collapses against its neighbour in some layout
               modes, and eleven of them would stack. */
            className="mt-phi4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--stone)]"
          >
            <article className="overflow-hidden rounded-xl border border-line bg-canvas shadow-lift">
              {/* The stone as a band across the head of the card: the colour
                  the reader just pressed, restated at the top of what it
                  opened, so the chip and the panel are visibly one object. */}
              <div className="h-1.5 w-full" style={{ backgroundColor: f.stone }} aria-hidden="true" />
              <div className="grid gap-phi4 p-phi3 sm:p-phi5 lg:grid-cols-[1.4fr_1fr] lg:items-start">
                <div>
                  <p className="ledger-label">
                    Layer {String(i + 1).padStart(2, "0")} of{" "}
                    {String(SECURITY_FEATURES.length).padStart(2, "0")}
                  </p>
                  {/* h3: the section's own h2 is "Protected. Day and night."
                      and skipping a level here would break the outline a
                      screen-reader user navigates by.

                      ⚠️ NO COLOUR HERE, INLINE OR OTHERWISE. This used to be
                      `style={{ color: f.stone }}`, which is right on sand and
                      measured 1.93:1 on carbon. `.rj-sec-title` owns the ink
                      in both modes now — and because royal.css is unlayered,
                      a `text-*` utility added back here would lose silently
                      while looking like it had won. */}
                  <h3 className="rj-sec-title mt-phi2 text-2xl">{f.title}</h3>
                  <p className="mt-phi3 text-lg leading-relaxed text-ink-soft">{f.body}</p>
                  {f.note ? (
                    /* The second paragraph is always a LIMIT — what the system
                       will not do — so it is set apart as a rule-led aside
                       rather than run on as a third sentence of the promise. */
                    <p className="rj-sec-rule mt-phi3 border-l-2 pl-phi3 text-base leading-relaxed text-ink-muted">
                      {f.note}
                    </p>
                  ) : null}
                </div>

                {/* 🚨 THE NOTE BELOW IS A SIBLING OF THE TERNARY, NOT ITS
                    FIRST CHILD. Written inside the `(` it made the consequent
                    two nodes where JSX allows one, and the parser reported it
                    twenty lines later as "Expected '</'" on the <figure> tag —
                    the same trap `EmptyState` in ui.tsx already records.

                    ⚠️ `lg:max-w-[390px]` RATHER THAN `lg:max-w-none`, AND THE
                    NUMBER HAS TO MATCH `sizes`. Left uncapped the figure filled
                    the grid's `1fr`, which measures 388px at 1440, while
                    `sizes` still promised 320px — so the browser picked a 320w
                    rendition for a 388px box and every tab image shipped
                    slightly soft on a retina screen. Capping the box at a width
                    `sizes` can state honestly fixes it at both ends: change one
                    and change the other. */}
                {f.image ? (
                  <figure className="mx-auto w-full max-w-[320px] lg:mx-0 lg:max-w-[390px]">
                    <div className="overflow-hidden rounded-card border border-line bg-canvas-sunken">
                      <Image
                        src={f.image.src}
                        alt={f.image.alt}
                        width={f.image.width}
                        height={f.image.height}
                        /* ⚠️ `sentry-626` IS 626px WIDE AND HAS NO LARGER CUT —
                           see public/security-art/README.md. Against the 390px
                           cap above it still has 1.6x in hand for a retina
                           screen; a wider box would upscale it. */
                        sizes="(min-width: 1024px) 390px, 320px"
                        className="h-auto w-full object-cover"
                      />
                    </div>
                    {f.image.caption ? (
                      <figcaption className="mt-phi2 text-tiny leading-relaxed text-ink-faint">
                        {f.image.caption}
                      </figcaption>
                    ) : null}
                  </figure>
                ) : null}
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}
