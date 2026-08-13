import Image from "next/image";
import Link from "next/link";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";
import { SectionLabel } from "@/components/ui";
import { countPurposes } from "@/lib/purpose";
import type { Property } from "@/lib/properties";

/**
 * FEATURE 1 — EXPLORE BY PURPOSE, directly under the hero console.
 *
 * The console asks "where?"; this asks "what for?". They are the two questions
 * a visitor actually arrives with, and putting them together at the top means
 * nobody has to scroll a catalogue to find their own starting point.
 *
 * ⚠️ A PURPOSE WITH NO INVENTORY SAYS SO. Every property in the database today
 * is `residential_plot`, so Farm and Commercial match nothing — and a card that
 * silently filters to an empty page is the exact failure this site has already
 * designed around twice: `getNavFacets` drops a phase with nothing in it, and
 * the Vault's collections say "Not open" and route to the desk. So a purpose
 * with a count routes to `/properties?purpose=…`, and one without says it is
 * not open yet and routes to the desk instead. Both are real destinations.
 *
 * ⚠️ It is a SERVER component and the counts are computed from the same rows
 * the page already fetched — no second query, no client bundle, no hydration.
 * The interactivity the brief asks for is a link; it does not need JavaScript.
 */
export function PurposeExplorer({ all }: { all: Property[] }) {
  const purposes = countPurposes(all);
  const open = purposes.filter((p) => p.count > 0).length;

  return (
    <div>
      {/* ⚠️ THE RIGHT HALF WAS EMPTY. A 20rem heading and a two-line lead left
          roughly 55% of this row as blank ivory on a laptop, which reads as a
          section that has not finished loading rather than as space. It held a
          drawn plate for a few hours; the owner supplied the photograph on
          2026-08-11 and it took the plate's place.

          ⚠️ BRAND IMAGERY, AND THE RULE BITES HARDER HERE THAN ON A HERO. This
          is a render of a plotted layout — formed roads, kerbs, street lights,
          plots marked out — sitting directly above four cards that link to real
          Jamin developments. A reader could take it for one of them in a
          heartbeat. It is not: it is a render of nowhere. `alt=""`,
          `aria-hidden`, and it must NEVER be given a caption, a project name or
          a location. See public/section/README.md. */}
      <div className="grid items-center gap-phi4 lg:grid-cols-[1fr_0.9fr]">
        <div className="max-w-xl">
          <SectionLabel>Start here</SectionLabel>
          <h2 className="mt-phi3 text-3xl text-ink">Find the right plot for your purpose</h2>
          <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
            {open === purposes.length
              ? "Four ways in. Each one filters the list to what it actually holds."
              : "Four ways in. Where we are not selling for a purpose yet, it says so rather than showing you an empty page."}
          </p>
        </div>

        <div className="relative hidden aspect-[16/9] min-w-0 overflow-hidden rounded-xl border border-line lg:block">
          {/* Owner-supplied 2026-08-12, replacing purpose-1857.
              ⚠️ New FILENAME, not a new file at the old path. `next/image` keys
              its optimised output by source path, so overwriting
              purpose-1857.webp would have let a warm build keep serving the old
              picture from a correct-looking deploy. */}
          <Image
            src="/section/purpose-gate-1440.webp"
            alt=""
            aria-hidden="true"
            fill
            sizes="45vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      <ul className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-4">
        {purposes.map(({ purpose, count }) => {
          const live = count > 0;
          const href = live ? `/properties?purpose=${purpose.key}` : "/contact";
          return (
            <li key={purpose.key} className="flex">
              <Link
                href={href}
                className={`group flex w-full flex-col rounded-xl border border-line ${purpose.tint} p-phi3 transition-all duration-500 hover:-translate-y-1 hover:border-ink-faint hover:shadow-lift`}
                style={{ transitionTimingFunction: "var(--ease-silk)" }}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-11 w-11 items-center justify-center rounded-[12px] bg-canvas/70 ${purpose.chip.split(" ").slice(1).join(" ")}`}
                >
                  <SurveyIcon name={purpose.icon as never} className="h-[23px] w-[23px]" />
                </span>

                <span className="mt-phi3 block text-xl text-ink">{purpose.label}</span>
                <span className="mt-phi2 block flex-1 text-base leading-relaxed text-ink-muted">
                  {purpose.note}
                </span>

                {/* 🚨 EVERY CARD ENDS IN THE SAME ACTION ROW, RULED OFF.
                    Reported 2026-08-13 as "the CTA appears visually
                    misaligned… it should sit at the bottom-right… the
                    supporting text should remain above it without affecting the
                    CTA position", and the cause was that the two states were
                    different SHAPES: a live card ended in one line ("3
                    developments →") and a closed one in a two-line sentence
                    whose second line carried the call to action. The body above
                    is `flex-1`, so both blocks did start at the bottom — and the
                    action inside the taller block therefore sat a line lower
                    than the action beside it.

                    Now the qualifier is a line of body copy and the action is
                    its own ruled row, so the four rows align by construction
                    whatever the copy above them does. Right-aligned, per the
                    report. */}
                {!live && (
                  <span className="mt-phi2 block text-tiny text-ink-faint">
                    Not selling for this yet.
                  </span>
                )}
                {/* ⚠️ The number is the evidence, so it stays plain — §8's rule
                    about not putting gold on a figure that is selling by
                    itself. */}
                <span
                  className={`mt-phi3 flex items-center justify-end border-t border-line pt-phi2 text-tiny font-semibold uppercase tracking-[0.12em] transition-transform duration-500 group-hover:translate-x-1 ${
                    live ? "text-jamin-red-deep" : "text-ink-soft"
                  }`}
                >
                  {live ? (
                    <>
                      <span className="ledger">{count}</span>
                      &nbsp;development{count === 1 ? "" : "s"} →
                    </>
                  ) : (
                    <>register interest →</>
                  )}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
