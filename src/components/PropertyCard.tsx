import Image from "next/image";
import Link from "next/link";
import { AvailabilityChip } from "@/components/cadastral/AvailabilityChip";
import { DimensionOverlay } from "@/components/cadastral/DimensionOverlay";
import { districtName, districtStone, stageStone } from "@/lib/stones";
import { getTier } from "@/lib/tiers";
import {
  approvalBadges,
  coverImage,
  formatArea,
  formatPrice,
  isSellable,
  locationLine,
  phaseLabel,
  propertyHref,
  type Property,
} from "@/lib/properties";

/**
 * THE ROYAL PROPERTY CARD (§6.3).
 *
 * Reads as one object: photograph, the district's stone, the record, the
 * facts. The Cadastral substrate shows through unchanged — `cd-card` still
 * hangs the dimension ticks, `cd-fold` is still the dog-ear from the logo, and
 * `cd-photo` is still the single house grade that makes phone snaps from four
 * different sources look like one commissioned shoot.
 *
 * ⚠️ THE SEAL IS THE DTCP CHIP, NOT A SECOND MARK. §6.3.2 asks for a gold-foil
 * "JAMIN VERIFIED" seal. It is not here, and that is deliberate: §5b reserves
 * gold foil for the DTCP-approved chip and calls it the only one in the system,
 * §8 allows one seal per view, and inventing a "Jamin verified" credential to
 * sit beside the real one — on land whose entire argument is that the paperwork
 * is checkable — is precisely what §8 means by gilding the evidence. So the
 * approval that a buyer can verify against the DTCP file is the thing that
 * gets the metal. One seal, and it is the true one.
 */
export function PropertyCard({ p, priority = false }: { p: Property; priority?: boolean }) {
  const cover = coverImage(p);
  const approvals = approvalBadges(p);
  const area = formatArea(p);
  const sellable = isSellable(p);
  const stone = districtStone(p);
  const district = districtName(p);
  const stage = stageStone(p);
  const tier = getTier(p);

  return (
    /* `h-full` + column flex is what keeps a row of cards level. A grid item
       stretches to the tallest in its row, but a `block` child does not follow
       it, so a two-line title used to leave one card's base floating above its
       neighbours'. */
    /* Not `overflow-hidden` — the left-hand dimension label sits just outside
       the edge, and clipping is what would hide it. */
    <Link
      href={propertyHref(p)}
      /* ⚠️ `data-tier` is not decoration — for Crown it re-scopes the card's
         colour tokens to onyx, and every child follows, including the two
         cadastral components this file does not own. See royal.css. */
      data-tier={tier.key}
      className="cd-card cd-fold cd-photo rj-lift group flex h-full w-full flex-col rounded-xl border border-line bg-canvas shadow-lift transition-colors duration-500 hover:shadow-raise"
      /* The lift is `.rj-lift` (transform only). The shadow tint is the card's
         own stone at very low alpha, so a row lifts in slightly different
         light — set here rather than in CSS because it is per-district data. */
      style={
        {
          "--rj-stone": stone,
          /* ⚠️ Named `--rj-stone-ink`, NOT `--rj-stage-ink`, and the difference
             is the whole mechanism. An inline style beats any selector, so
             setting the final variable here made `[data-tier="crown"]`
             unable to override it — the Crown card's stage word stayed emerald
             and measured 3.53:1 on onyx. This is the BASE; the crown rule sets
             `--rj-stage-ink`, and the label falls back to this when it is
             unset. */
          "--rj-stone-ink": stage?.ink,
          transitionTimingFunction: "var(--ease-silk)",
        } as React.CSSProperties
      }
    >
      <DimensionOverlay
        top={area}
        left={p.plots_total ? `${p.plots_total} plot${p.plots_total === 1 ? "" : "s"}` : null}
      />

      {/* 1.618:1 — which is also the ~62% of card height §6.3 asks for, and the
          same ratio the rest of the page is built on. `shrink-0` so the flex
          column cannot squash the ratio out of it. */}
      <div className="relative aspect-[1.618/1] shrink-0 overflow-hidden rounded-t-xl bg-canvas-sunken">
        {cover ? (
          <Image
            src={cover}
            alt={p.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-[1400ms] group-hover:scale-[1.025]"
            style={{ transitionTimingFunction: "var(--ease-silk)" }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-tiny uppercase tracking-brand text-ink-faint">
            Jamin
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          {/* The seal. Foil plus a one-shot glint on hover — a flat champagne
              rectangle reads as mustard; the travelling band is what the eye
              decodes as metal. Capped well under the 92px §6.3 allows. */}
          <div className="flex flex-wrap gap-2">
            {approvals.map((a) => (
              <span
                key={a}
                className="rj-foil-seal rj-glint inline-flex max-w-[92px] items-center rounded-full px-2.5 py-1 text-micro font-semibold uppercase tracking-[0.1em] text-champagne-900"
              >
                {a} Approved
              </span>
            ))}
          </div>
          {!sellable && (
            <span className="rounded-full bg-ink/85 px-2.5 py-1 text-micro font-semibold uppercase tracking-[0.1em] text-white backdrop-blur">
              {p.status === "sold" ? "Sold Out" : p.status}
            </span>
          )}
        </div>
      </div>

      {/* The gem band. Names the district as material before the address names
          it in words — but never instead of the words: `district` is printed
          in the eyebrow directly below. See the warning in lib/stones.ts. */}
      <div className="rj-gem-band shrink-0" aria-hidden="true" />

      <div className="flex flex-1 flex-col p-phi3">
        {/* The variable-length half. `flex-1` absorbs the difference between a
            one-line and a two-line title so the facts strip below always lands
            at the same height across the row. */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-[0.16em]">
            {/* `ink`, not `stone` — the label is a word, and two of the stones
                are illegible as words. See STAGE_STONE. Routed through the card's
                `--rj-stage-ink` so an onyx Crown card can override it. */}
            {stage && (
              <span style={{ color: "var(--rj-stage-ink, var(--rj-stone-ink))" }}>
                {stage.label}
              </span>
            )}
            {district && (
              <>
                <span className="text-ink-faint">·</span>
                <span className="text-ink-faint">{district}</span>
              </>
            )}
            {!stage && !district && <span className="text-jamin-gold-ink">{phaseLabel(p)}</span>}
          </div>

          <h3 className="mt-2 text-xl text-ink transition-colors group-hover:text-cta-deep">
            {p.title}
          </h3>

          <p className="mt-1.5 line-clamp-1 text-base tracking-[0.05em] text-ink-muted">
            {locationLine(p)}
          </p>

          {/* Only where the record carries both counts — see the component. */}
          {sellable && (
            <div className="mt-phi2">
              <AvailabilityChip total={p.plots_total} available={p.plots_available} />
            </div>
          )}
        </div>

        {/* THE FACTS STRIP (§6.3.8). Real plot fields only — extent, plots,
            availability. Never an invented "4 BHK · 2,850 sq ft": every one of
            these is a plotted development, and a configuration it does not have
            is the one thing a buyer would notice as false. */}
        {/* ⚠️ The tier grades the card's FOOT rather than adding a fourth
            horizontal line to its head. §6.3 lists the ribbon third, above the
            gem band; stacked there it would have been rule + band + ribbon in
            12px of card. The rule that already divided the facts strip becomes
            the tier's own material instead — platinum for the lower two rungs,
            gold foil for the upper two — so the escalation costs no new
            furniture. */}
        <div className="mt-phi3">
          <div className="rj-tier-rule" aria-hidden="true" />
          <div className="flex items-end justify-between gap-phi2 pt-phi2">
            <dl className="flex flex-wrap items-end gap-x-phi3 gap-y-1">
              {area && (
                <div>
                  <dt className="ledger-label">Extent</dt>
                  <dd className="ledger text-lg text-ink">{area}</dd>
                </div>
              )}
              {p.plots_total ? (
                <div>
                  <dt className="ledger-label">Plots</dt>
                  <dd className="ledger text-lg text-ink">{p.plots_total}</dd>
                </div>
              ) : null}
              {sellable && p.plots_available ? (
                <div>
                  <dt className="ledger-label">Available</dt>
                  {/* ⚠️ §8: an availability count never turns gold. A number
                      that sells itself stops being a number. */}
                  <dd className="ledger text-lg text-ink">{p.plots_available}</dd>
                </div>
              ) : null}
            </dl>

            {/* Slides in rather than blinking on — the movement is what reads as
                considered; opacity alone reads as a flicker. */}
            <span
              className="shrink-0 translate-x-1 text-tiny font-medium text-cta-deep opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
              style={{ transitionTimingFunction: "var(--ease-silk)" }}
            >
              View details →
            </span>
          </div>

          {/* The ribbon and the rate, on one line. Crown is the only rung that
              gets foil TEXT, and only because its ground is onyx — the seal
              ramp measures 11.7:1 there and would measure 1.57:1 on ivory. */}
          <div className="mt-phi2 flex items-center justify-between gap-3">
            <span
              className={`rj-ribbon ${
                tier.key === "crown"
                  ? "rj-foil-text"
                  : tier.key === "select"
                    ? "text-plat-800"
                    : "text-champagne-700"
              }`}
            >
              {tier.key === "crown" && (
                /* The crest, and the only image the card adds. Not `next/image`:
                   it is 18px of decoration on every card in a grid, and the
                   optimiser pipeline costs more than the file. */
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/logo-mark.png" alt="" aria-hidden="true" className="rj-crest" />
              )}
              {tier.label}
            </span>
            <span className="text-tiny text-ink-faint">{formatPrice(p)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
