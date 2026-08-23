"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";
import { CAREER_ROLES } from "./career-roles";
import { CareerApplyForm } from "./CareerApplyForm";

/**
 * THE ELEVEN ROLE FAMILIES, AS GLASSY COLOURED TABS (owner 2026-08-23: "make
 * it glassy tabs, colorize…superb").
 *
 * ── WHAT "GLASSY" MEANS HERE, AND WHERE IT STOPS ───────────────────────────
 * /security's chips are opaque: a flat outline when resting, a solid stone fill
 * when selected. These are frosted — every chip carries a low-alpha wash of its
 * own stone over a `backdrop-blur`, so the blueprint grid behind the strip
 * reads faintly through all eleven and the row looks like eleven pieces of
 * tinted glass rather than eleven buttons.
 *
 * 🚨 THE SELECTED CHIP IS NOT GLASS, AND THAT IS NOT AN INCONSISTENCY. Its
 * label is white, and white on a 14%-alpha wash over sand is unreadable at any
 * blur. So the selected state closes to the solid stone — measured against
 * white in `career-roles.ts`, vermilion the floor at 4.64:1 — and keeps the
 * frosted family look through a specular sheen instead. Glass is the resting
 * state; legibility wins the selected one.
 *
 * ⚠️ NEVER HAND-WRITE `-webkit-backdrop-filter` TO GO WITH `backdrop-blur`.
 * Tailwind 4 compiles the standard property and Lightning CSS drops a
 * hand-written prefix pair on the floor — royal.css records both `gilt` plates
 * shipping with a dead blur that way. The utility alone is correct.
 *
 * ── EVERYTHING ELSE IS SecurityTabs' ARGUMENT, VERBATIM ────────────────────
 * The strip WRAPS rather than scrolls (a sideways-scrolling strip is
 * indistinguishable from the horizontal overflow that is this site's standing
 * diagnosis of a broken phone). All eleven panels are in the DOM with `hidden`
 * on the inactive ten, so a crawler reads every role rather than one. Roving
 * tabindex, arrows in all four directions because the strip wraps, Home/End,
 * automatic activation.
 *
 * ⚠️ A READER WITH NO JAVASCRIPT SEES PANEL ONE AND CANNOT SWITCH — the same
 * knowing trade. Every word is in the document either way; only the navigation
 * needs JS.
 */
export function CareerTabs() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (i: number) => {
    const next = (i + CAREER_ROLES.length) % CAREER_ROLES.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
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
        select(CAREER_ROLES.length - 1);
        break;
    }
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Open opportunities"
        aria-orientation="horizontal"
        onKeyDown={onKeyDown}
        className="flex flex-wrap gap-2 sm:gap-2.5"
      >
        {CAREER_ROLES.map((r, i) => {
          const on = i === active;
          return (
            <button
              key={r.key}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`career-tab-${r.key}`}
              aria-selected={on}
              aria-controls={`career-panel-${r.key}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setActive(i)}
              /* ⚠️ `backgroundColor` LONG-HAND, and `backgroundImage` set
                 separately beside it. The `background` shorthand would reset
                 whichever of the two is written second to `none` — the trap
                 that once turned every section numeral on this site into a
                 solid rectangle.

                 The resting tint is `color-mix` rather than a second token per
                 role: eleven more hexes to keep in step with the eleven stones
                 is eleven more chances for a colour to drift.

                 🚨 EVERY PAINT HERE READS `r.fill`, NOT `r.stone` — see the
                 note on `fill` in career-roles.ts. Four of the eleven stones
                 are re-pointed to pale pastels under `[data-mode="dark"]` so
                 they hold up as INK, and using one as a GROUND under white put
                 the label at 1.93:1 in carbon. `stone` survives on this page
                 only as the field the data file documents; nothing paints with
                 it. */
              style={
                {
                  "--stone": r.fill,
                  backgroundColor: on
                    ? r.fill
                    : `color-mix(in srgb, ${r.fill} 13%, transparent)`,
                  borderColor: on
                    ? `color-mix(in srgb, ${r.fill} 100%, transparent)`
                    : `color-mix(in srgb, ${r.fill} 38%, transparent)`,
                  color: on ? "#ffffff" : undefined,
                  backgroundImage: on
                    ? "linear-gradient(135deg, rgba(255,255,255,0.26) 0%, rgba(255,255,255,0.06) 42%, rgba(255,255,255,0) 72%)"
                    : "linear-gradient(135deg, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.10) 46%, rgba(255,255,255,0) 78%)",
                } as CSSProperties
              }
              className={`group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-tiny font-semibold uppercase tracking-[0.08em] backdrop-blur-md transition-all duration-300 [transition-timing-function:var(--ease-silk)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--stone)] sm:px-3.5 sm:py-2 ${
                on ? "shadow-lift" : "text-ink-soft hover:-translate-y-0.5 hover:shadow-lift"
              }`}
            >
              {/* ⚠️ HIDDEN BELOW `sm`, AND IT IS A MEASUREMENT NOT A TASTE
                  CALL. The emoji is what makes the strip read as eleven
                  distinct things rather than eleven pills, so it earns its
                  place from `sm` up where the strip is two or three rows. At
                  375px it adds ~24px to every chip and pushed the strip to
                  SEVEN rows — most of a phone screen of navigation before the
                  reader reaches a single role. The colour still tells them
                  apart there; the picture is what gives way. */}
              <span aria-hidden="true" className="hidden text-[0.95em] leading-none sm:inline">
                {r.icon}
              </span>
              {r.tab}
            </button>
          );
        })}
      </div>

      {CAREER_ROLES.map((r, i) => {
        const on = i === active;
        return (
          <div
            key={r.key}
            role="tabpanel"
            id={`career-panel-${r.key}`}
            aria-labelledby={`career-tab-${r.key}`}
            hidden={!on}
            tabIndex={0}
            /* `--rj-sec-ink` / `--rj-sec-ink-dark` drive `.rj-sec-title` and
               `.rj-sec-rule` in royal.css, which is where the light/dark ink
               swap lives. Shared with /security deliberately — one rule, two
               pages, so the two cannot drift into different answers to the same
               contrast problem. */
            style={
              {
                "--stone": r.fill,
                "--rj-sec-ink": r.ink,
                "--rj-sec-ink-dark": r.inkDark,
              } as CSSProperties
            }
            className="mt-phi4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[color:var(--stone)]"
          >
            <article className="overflow-hidden rounded-xl border border-line bg-canvas shadow-lift">
              <div
                className="h-1.5 w-full"
                style={{ backgroundColor: r.fill }}
                aria-hidden="true"
              />
              <div className="grid gap-phi4 p-phi3 sm:p-phi5 lg:grid-cols-[1.15fr_1fr] lg:items-start">
                <div>
                  <p className="ledger-label">
                    {String(i + 1).padStart(2, "0")} of{" "}
                    {String(CAREER_ROLES.length).padStart(2, "0")} · {r.label}
                  </p>
                  {/* h3: the section's h2 is "Open opportunities" and skipping a
                      level breaks the outline a screen-reader user navigates
                      by. ⚠️ NO text colour class here — `.rj-sec-title` owns the
                      ink in both modes, and because royal.css is unlayered a
                      `text-*` utility would lose silently while looking like it
                      had won. */}
                  <h3 className="rj-sec-title mt-phi2 text-2xl">{r.tagline}</h3>

                  {r.blurb.map((b) => (
                    <p key={b} className="mt-phi3 text-lg leading-relaxed text-ink-soft">
                      {b}
                    </p>
                  ))}

                  <p className="mt-phi4 text-tiny font-semibold uppercase tracking-brand text-jamin-gold-ink">
                    {r.pointsLabel}
                  </p>
                  <ul className="mt-phi2 grid gap-x-phi3 gap-y-2 sm:grid-cols-2">
                    {r.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5">
                        <span
                          aria-hidden="true"
                          className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px]"
                          style={{ backgroundColor: r.fill }}
                        />
                        <span className="text-base leading-relaxed text-ink-soft">{pt}</span>
                      </li>
                    ))}
                  </ul>

                  {r.looking ? (
                    <p className="rj-sec-rule mt-phi4 border-l-2 pl-phi3 text-base leading-relaxed text-ink-muted">
                      {r.looking}
                    </p>
                  ) : null}

                  {/* The one cross-link on the page, and it is not decoration:
                      Security is the only role family that already has a whole
                      page describing the work. */}
                  {r.key === "security" ? (
                    <p className="mt-phi3 text-base leading-relaxed text-ink-muted">
                      What the job protects is described in full on{" "}
                      <Link href="/security" className="underline decoration-jamin-gold/60 underline-offset-4 hover:text-ink">
                        Jamin Bazaar Security
                      </Link>
                      .
                    </p>
                  ) : null}
                </div>

                {/* THE APPLICATION, IN THE PANEL. Not a link to a form further
                    down: the reader has just decided this is the job, and the
                    site's own rule is that a control appears where the decision
                    is made. Each panel gets its own instance, keyed and
                    id-prefixed — see the note on `idPrefix`. */}
                <div className="rounded-xl border border-line bg-canvas-alt p-phi3">
                  <p className="text-tiny font-semibold uppercase tracking-brand text-jamin-gold-ink">
                    Apply — {r.label}
                  </p>
                  <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
                    Name and mobile is all we need to start. Everything else helps.
                  </p>
                  <div className="mt-phi3">
                    <CareerApplyForm
                      roleKey={r.key}
                      roleLabel={r.label}
                      stone={r.fill}
                      cta={r.cta}
                      idPrefix={`ca-${r.key}`}
                    />
                  </div>
                </div>
              </div>
            </article>
          </div>
        );
      })}
    </div>
  );
}
