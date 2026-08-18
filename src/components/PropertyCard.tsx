import Image from "next/image";
import Link from "next/link";
import { ShortlistHeart } from "./ShortlistHeart";
import { AvailabilityChip } from "@/components/cadastral/AvailabilityChip";
import { DimensionOverlay } from "@/components/cadastral/DimensionOverlay";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";
import { Docket } from "@/components/ui/Docket";
import { districtName, districtStone, stageStone } from "@/lib/stones";
import { getTier } from "@/lib/tiers";
import { sheetNumber } from "@/lib/sheet-number";
import {
  approvalBadges,
  areaParts,
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

  /**
   * The facts strip, built before the markup so the grid can be told how many
   * columns it actually has.
   *
   * ⚠️ The UNIT is the label and the NUMBER is the figure — "4" over "ACRES",
   * not "4 acres" over "EXTENT". That is the reference design's arrangement and
   * it is also the honest one: every cell then reads as one measurement, and
   * the three cells are comparable down the column across a whole grid of
   * cards. `Extent` is only used as a fallback for a record whose `area_unit`
   * is null, which the table does allow.
   *
   * ⚠️ Availability is `2 / 27`, both numbers, never a bare remaining count. A
   * lone "2" is unreadable without the total and reads as scarcity; the pair is
   * a fact. It is also the only cell that can be absent on a card whose
   * neighbours have it — hence a computed column count rather than a fixed
   * three, so a two-fact card still fills its strip instead of ruling off an
   * empty third.
   */
  const areaP = areaParts(p);
  const facts: { label: string; value: string; verified?: boolean }[] = [];
  if (areaP) facts.push({ label: areaP.unit || "Extent", value: areaP.value });
  if (p.plots_total)
    facts.push({ label: p.plots_total === 1 ? "Plot" : "Plots", value: String(p.plots_total) });
  if (sellable && p.plots_total != null && p.plots_available != null)
    facts.push({
      label: "Available",
      value: `${p.plots_available} / ${p.plots_total}`,
      /* Anti-beige item 4: availability is the card's RESOLVED FACT and takes
         the teal — once per card, on the figure a buyer acts on. */
      verified: true,
    });

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
      className="cd-card cd-fold cd-photo rj-lift rj-lamplight group flex h-full w-full flex-col rounded-xl border border-line bg-canvas shadow-lift transition-colors duration-500"
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
      {/* 1.618:1 — which is also the ~62% of card height §6.3 asks for, and the
          same ratio the rest of the page is built on. `shrink-0` so the flex
          column cannot squash the ratio out of it. */}
      {/* ⚠️ The dimension ticks live INSIDE the picture, not over the card.
          Anchored to the card they ran its full height and the rotated "60
          plots" label sat across the title and the location line — the overlap
          that was reported. Sized by the image box, they annotate the only
          thing on a card that has an extent. */}
      {/* `rj-sheen` — light travels across the photograph once when the card is
          hovered or focused. It hangs on THIS box rather than the card root
          because `cd-fold` already owns both of the root's pseudo-elements (the
          dog-ear and its shadow), and because the sweep should be clipped to the
          picture: the box is already `relative overflow-hidden`, which is
          exactly what the class asks of its host. */}
      <div className="rj-sheen relative aspect-[1.618/1] shrink-0 overflow-hidden rounded-t-xl bg-canvas-sunken">
        {/* Certificate corners (Gilded Register §5): four gold brackets draw
            in when the card is touched. On the PICTURE box — the card root's
            pseudo-elements belong to cd-fold. */}
        <span className="rj-corners" aria-hidden="true" />
        <DimensionOverlay
          top={area}
          left={p.plots_total ? `${p.plots_total} plot${p.plots_total === 1 ? "" : "s"}` : null}
        />
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
          <div className="flex items-center gap-2">
            {!sellable && (
              <span className="rounded-full bg-ink/85 px-2.5 py-1 text-micro font-semibold uppercase tracking-[0.1em] text-white backdrop-blur">
                {p.status === "sold" ? "Sold Out" : p.status}
              </span>
            )}
            {/* The browser shortlist's heart (do-all #2) — a client island;
                it stops propagation so the card's own link never fires. */}
            <ShortlistHeart propertyId={p.id} title={p.title} />
          </div>
        </div>

        {/* CARTOUCHE §4.3 — the Docket, bottom-left of every card image, on a
            warm scrim. District, the real approval number when the record has
            one, and the deterministic sheet serial — the drawing-sheet
            metaphor made literal. The title itself stays in the card body
            below; repeating it here would say it twice three inches apart. */}
        <div
          className="absolute inset-x-0 bottom-0 p-4"
          style={{ background: "linear-gradient(to top, rgba(18, 14, 10, 0.66), transparent)" }}
        >
          {/* ⚠️ No DTCP number here — the card's `Property` shape deliberately
              does not carry `legal` (the allowlist in lib/properties), and the
              approval chip above already says what is verifiable. District and
              serial only. */}
          <Docket
            onDark
            rule="red"
            lines={[
              district ?? phaseLabel(p),
              `SHEET ${sheetNumber(district, p.slug ?? p.id, p.plots_total)}`,
            ]}
          />
        </div>
      </div>

      {/* The gem band. Names the district as material before the address names
          it in words — but never instead of the words: `district` is printed
          in the eyebrow directly below. See the warning in lib/stones.ts. */}
      <div className="rj-gem-band shrink-0" aria-hidden="true" />

      {/* ── THE RECORD ───────────────────────────────────────────────────────
          Rearranged 2026-08-12 from the UI report's reference design. The
          content is identical; what changed is that it now reads as four
          separated blocks — WHERE it is, WHAT it is called, WHAT IT MEASURES,
          and WHAT TO DO — instead of six things at six different rhythms. The
          report's words were "crowded in some areas and excessive unused space
          in others", and both halves of that had one cause: everything below
          the title was sized by its own content, so no two cards in a row
          agreed about where anything sat. */}
      <div className="flex flex-1 flex-col p-phi3">
        {/* ── 1. status · location, title, address ────────────────────────────
            `flex-1` absorbs the difference between a one-line and a two-line
            title so everything below lands at the same height across the row. */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-[0.16em]">
            {/* `ink`, not `stone` — the label is a word, and two of the stones
                are illegible as words. See STAGE_STONE. Routed through the card's
                `--rj-stage-ink` so an onyx Crown card can override it. */}
            {/* Anti-beige item 5: the stage word is a WASH PILL in its own
                stone now, so live inventory pops off the grid instead of
                whispering. The ink still routes through --rj-stage-ink so a
                Crown card's onyx override keeps working. */}
            {stage && (
              <span
                className="rounded-full px-2 py-0.5"
                style={{
                  color: "var(--rj-stage-ink, var(--rj-stone-ink))",
                  background: `color-mix(in srgb, ${stage.stone} 14%, transparent)`,
                }}
              >
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

          <h3 className="mt-phi2 text-xl text-ink transition-colors group-hover:text-cta-deep">
            {p.title}
          </h3>

          {/* ⚠️ `line-clamp-2`, not 1. At one line "KamanaickenPalayam,
              Varapatty, Coimbatore" truncated to "KamanaickenPalayam,
              Varapatty,…" — the district, which is the part a buyer is
              scanning for, was the part being cut. Two lines fit every address
              in the table today and the clamp still guarantees the block cannot
              grow without limit.
              `items-start` + `mt-[0.15em]` on the marker: it aligns to the
              first LINE of the address, not to the centre of a block that may
              be two lines tall. */}
          <p className="mt-phi2 flex items-start gap-1.5 text-base tracking-[0.05em] text-ink-muted">
            {/* ⚠️ `pin`, not `station` — owner's call 2026-08-14. The trig
                station is the better drawing and the worse sign: at 14px an
                outlined triangle with a dot in it is the warning glyph, and it
                sat in front of a postal address. See the note in SurveyIcon. */}
            <SurveyIcon
              name="pin"
              size="h-3.5 w-3.5"
              className="mt-[0.15em] shrink-0 text-ink-faint"
            />
            <span className="line-clamp-2">{locationLine(p)}</span>
          </p>
        </div>

        {/* ── 2. THE FACTS STRIP (§6.3.8) ──────────────────────────────────────
            Real plot fields only — extent, plots, availability. Never an
            invented "4 BHK · 2,850 sq ft": every one of these is a plotted
            development, and a configuration it does not have is the one thing a
            buyer would notice as false.

            ⚠️ A RULED GRID, NOT `flex-wrap`. This is the specific thing the
            report asked for and the specific thing that was wrong. Wrapping
            sized each figure by its own text, so "26,727 sqft" pushed
            AVAILABLE onto a second row on the Erode card while the Salem card
            beside it stayed on one — two cards, same three facts, different
            heights and different reading order. Equal columns cost nothing and
            cannot do that.

            ⚠️ `min-w-0` on every cell. A grid track's default `min-width` is
            its content's minimum, so one long figure widens the track rather
            than truncating inside it — the same lesson `PropertiesMap` and the
            homepage rail already paid for.

            ⚠️ The tier grades the card's FOOT rather than adding a fourth
            horizontal line to its head. §6.3 lists the ribbon third, above the
            gem band; stacked there it would have been rule + band + ribbon in
            12px of card. The rule that already divided the facts strip becomes
            the tier's own material instead — platinum for the lower two rungs,
            gold foil for the upper two — so the escalation costs no new
            furniture. */}
        <div className="mt-phi3">
          <div className="rj-tier-rule" aria-hidden="true" />
          <dl
            className="grid divide-x divide-line pt-phi2"
            style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))` }}
          >
            {facts.map((f, i) => (
              <div key={f.label} className={`min-w-0 ${i === 0 ? "pr-phi2" : "px-phi2"} last:pr-0`}>
                {/* ⚠️ §8: an availability count never turns gold. A number that
                    sells itself stops being a number. */}
                <dd className={`ledger truncate text-lg ${f.verified ? "text-canopy" : "text-ink"}`}>
                  {f.value}
                </dd>
                <dt className="ledger-label truncate">{f.label}</dt>
              </div>
            ))}
          </dl>
        </div>

        {/* ── 3. what is actually left ─────────────────────────────────────────
            ⚠️ DRAWN ONLY WHEN IT SAYS SOMETHING. The plot grid used to render
            on every sellable card, and because no plot in the database has ever
            had a status other than `available`, every one of them drew a block
            of empty outlines that told the reader nothing — while costing one
            row of height per twelve plots. That is why a 27-plot card, a
            16-plot card and a 1-plot card (which drew nothing at all, leaving
            the hole the report called "excessive unused space") were three
            different heights.

            Guarding on `available < total` keeps the component and its whole
            argument: the moment the owner marks a plot sold in the app's admin
            console, that card starts drawing its grid again — and by then it is
            carrying real information rather than decoration. */}
        {sellable && p.plots_total != null && p.plots_available != null && p.plots_available < p.plots_total && (
          <div className="mt-phi2">
            <AvailabilityChip total={p.plots_total} available={p.plots_available} />
          </div>
        )}

        {/* ── 4. the collection ───────────────────────────────────────────────
            Below the statistics on every card, which is what the report asked
            for — it used to share a line with the rate, so on a card whose rate
            string was long the ribbon shifted left and the column stopped
            existing. Crown is the only rung that gets foil TEXT, and only
            because its ground is onyx — the seal ramp measures 11.7:1 there and
            would measure 1.57:1 on ivory. */}
        <div className="mt-phi2">
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
        </div>

        {/* ── 5. the actions ──────────────────────────────────────────────────
            ⚠️ "View details" IS NO LONGER HOVER-ONLY. It was `opacity-0` until
            `group-hover`, which meant the card's primary affordance did not
            exist for anyone on a touch device — and the report's reference
            design shows it present on every card. The considered movement the
            old treatment was after is kept as a transform: the arrow slides,
            the label does not appear from nowhere.

            Its own rule above it, so the two actions read as the card's footer
            rather than as the last line of the ribbon block — and because
            everything above is now fixed-height per row, this line lands at the
            same y on every card in the row, which was the ask. */}
        <div className="mt-phi2 flex items-center justify-between gap-3 border-t border-line pt-phi2">
          <span className="inline-flex items-center gap-1.5 text-tiny font-medium text-cta-deep">
            View details
            <span
              aria-hidden="true"
              className="transition-transform duration-500 group-hover:translate-x-1"
              style={{ transitionTimingFunction: "var(--ease-silk)" }}
            >
              →
            </span>
          </span>
          <span className="shrink-0 text-tiny text-ink-faint">{formatPrice(p)}</span>
        </div>
      </div>
    </Link>
  );
}
