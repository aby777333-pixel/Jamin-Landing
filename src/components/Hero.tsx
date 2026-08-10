import Image from "next/image";
import Link from "next/link";
import { HeroConsole } from "./HeroConsole";

/**
 * The homepage hero — one frame, no carousel.
 *
 * The rotation is gone deliberately. A hero that swaps under a reader is a
 * gimmick: it costs four large downloads, it moves while somebody is reading,
 * and it forces every headline to be generic enough to sit over any of the
 * four. One decisive image carries far more than four that show nothing in
 * particular.
 *
 * That also makes this a SERVER component. There is no state, so the whole hero
 * ships as HTML with no JavaScript behind it, which is where the LCP win comes
 * from on a page that is meant to feel instant.
 */
export type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  blurb: string | null;
  href: string;
};

/**
 * hero-20 — the branded gateway banner supplied 2026-08-09, replacing hero-16
 * the same day. The same composition drawn wider and calmer: the arch now
 * carries JAMIN BAZAAR, the sun has dropped behind the hills, and the left
 * third is open paddy under haze instead of near-white paper.
 *
 * ⚠️ The words are INK on the artwork, not white over a scrim, and that is a
 * property of this family of frames rather than a style choice. They are light
 * down the whole left third — the exact band the copy occupies — so white type
 * has nothing to sit on. What guarantees the copy now is the `gilt-light`
 * plate it sits in; there is no canvas wash on this hero any more.
 *
 * ⚠️ The renditions are TRIMMED from the supplied file, not merely resized. The
 * original is 1983x793 and bakes in a white strip reading "DTCP Approved ·
 * Prime Locations · Best Value · Safe & Secure" plus a column of categories
 * ("Villa Plots", "Farm Lands"). Those are pixels: not selectable, not
 * translated, invisible to a screen reader, and they do not reflow — and two of
 * the categories are not sold here while "Best Value" is a claim this site makes
 * nowhere else. The asset is cut at y=600, above both — the strip starts at 608
 * and the category icons at 618, so the same line that served hero-16 serves
 * this one. It also frees the bottom of the frame for the inventory rail, the
 * one thing in this hero that is true, current and clickable.
 *
 * ⚠️ The trimmed frame is 3.3:1, so how much of it survives is decided by how
 * TALL this section is, not by any crop setting: `object-cover` scales to the
 * height and takes the difference off the sides. At 1440 a 600px band keeps 72%
 * of the width — the whole arch and the red sweep. Let the section grow past
 * that and the sweep is the first thing to go. That is why the inventory rail
 * sits BELOW the banner rather than inside it: it is 107px of height, and those
 * 107px cost roughly a tenth of the picture.
 *
 * Brand imagery, not a photograph of a Jamin project — it carries no caption and
 * must never be given one. See public/hero/README.md.
 */
const ART = { id: "20", w: 1983 };

export function Hero({
  slides,
  districts = [],
}: {
  slides: Slide[];
  districts?: { label: string; count: number }[];
}) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-canvas">
      {/* The setting-out grid shows only where the artwork has dissolved away,
          so the empty left panel reads as drawing paper rather than as a gap. */}
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Below 1400px the artwork LEADS as a band instead of sitting behind the
          words.

          ⚠️ 1400, not `lg`. The overlay composition is not a matter of taste at
          the narrow end, it fails an audit: the paper panel is a fixed FRACTION
          of the artwork, so as the viewport narrows the 36rem copy column keeps
          its pixels while the panel loses them, and the last lines end up on the
          gatepost and the road. Composited through the wash, the lead measured
          5.54:1 at 1440, 3.46:1 at 1280 and 1.62:1 at 1024. Only the first of
          those clears AA, which is what sets the breakpoint.

          The band comes FIRST so a phone still opens on the picture; put it
          after the copy and the whole first screen is type on ivory. Cropped to
          the arch and the road — centring it would show the empty paper panel
          and lose the only thing in the frame worth seeing at this size. */}
      <div className="relative h-44 w-full sm:h-56 min-[1400px]:hidden">
        <Image
          src={`/hero/hero-${ART.id}-${ART.w}.webp`}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority
          className="object-cover object-[62%_38%]"
        />
      </div>

      {/* The banner and the words it was drawn around. The rail is deliberately
          NOT in here — see the note on ART above. */}
      <div className="relative">
        {/* From 1400px up the banner is full-bleed behind the copy. */}
        <div
          className="pointer-events-none absolute inset-0 hidden min-[1400px]:block"
          aria-hidden="true"
        >
          <Image
            src={`/hero/hero-${ART.id}-${ART.w}.webp`}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-top"
          />
          {/* The mirror of `hero-fade`: instead of a dark scrim the page
              dissolves the image into its own canvas from the left. Over the
              artwork's own white panel this is very nearly invisible — it only
              does work further right, where the last lines of copy reach the
              gatepost. That is what makes ink type safe at every width without
              darkening a frame whose whole character is light. */}
          {/* ⚠️ The canvas wash that used to live here is GONE, not reduced.
              It existed for one reason — to guarantee a backdrop under ink type
              that was lying directly on the artwork — and the `gilt-light`
              plate now does that job locally and unconditionally. Keeping both
              was actively worse than either: stacked, they bleached the left
              gatepost to a pale smear, because the plate's 0.72 was landing on
              an area the wash had already lifted to near-white.

              With it gone the frame runs edge to edge as drawn, and the only
              thing standing between the reader and the picture is the plate the
              words actually sit on. If copy is ever placed outside that plate,
              the wash has to come back with it. */}
        </div>

        {/* 54vh, not 100. A hero that fills the viewport hides the fact that
            there is a site under it. Capped at 30rem, which on this frame is a
            second constraint as well as a taste one: every extra pixel of height
            is taken off the sides of the banner. */}
        {/* ⚠️ Raised 2026-08-09 on request, from clamp(22rem,54vh,30rem). It is
            a real trade, not a free one: this banner is 3.3:1 and `object-cover`
            sizes it to the box HEIGHT, so a taller hero shows LESS of the
            picture's width — 66% before, 59% now. What it buys is a bigger arch
            and more room around the plate. If the red sweep ever has to come
            back into frame, this number is the first thing to lower. */}
        {/* `justify-center`, where this was `justify-end`. The plate was
            bottom-anchored back when the copy was bare type over a photograph
            and sinking it into the darkest corner was what made it readable.
            The plate carries its own backdrop now, so that constraint is gone
            and the card sits on the frame's vertical centre instead. */}
        {/* ⚠️ The padding is inverted from what it was — `pt-phi4 pb-phi5`,
            where it used to be `pt-phi5 pb-phi4`. Centring alone did not centre
            it: with `justify-center` the free space splits evenly and then the
            padding is added on top, so the larger top padding left the card
            49px low (109 above, 60 below). Reversing it puts the extra room
            BELOW, which lands the card a touch above the geometric centre —
            where the optical centre of a block of type actually is. */}
        {/* ⚠️ The `min-[1400px]` bottom padding is the console's landing room,
            not a spacing preference — see "THE CONSOLE'S STRADDLE" in
            royal.css. Below that width the console does not overlap, so the
            padding stays at phi5. */}
        <div className="relative mx-auto flex max-w-[1280px] flex-col justify-center px-5 pb-phi5 pt-phi4 lg:px-10 min-[1400px]:min-h-[clamp(30rem,82vh,46rem)] min-[1400px]:pb-[var(--rj-console-clear)]">
          {/* ⚠️ `max-w-2xl`, WIDER than the 36rem this carried before the plate,
              and that is not a taste change — it is the height budget.

              A narrow measure makes tall copy, the section is content-sized, and
              on a 3.3:1 banner every pixel of height is taken off the SIDES. At
              `lg` the plate's own padding pushed the block to 675px tall and the
              banner to 764, which cropped it to 56% of its width and took the
              red sweep with it. At 42rem the headline is two lines again, the
              banner is back to ~71%, and the sweep survives.

              What makes the wider measure safe is the plate itself: the copy no
              longer depends on the wash reaching it, so it is free to run past
              where the wash gives out. */}
          <div
            className="gilt-light rj-gilt-light-sheer rj-sheer-copy-ink reveal max-w-2xl rounded-2xl p-phi3 sm:p-phi4"
            /* The banner is light everywhere the copy sits, so the plate can go
               a long way down before the ink is in trouble — and the white halo
               is what carries it the rest of the way. */
            style={{ "--rj-sheer-alpha": 0.24 } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <span className="h-px w-12 rule-gold" />
              {/* `gold-deep`, not `gold-ink`. This one line was what pinned the
                  plate's opacity — see the sweep in `gilt-light`. */}
              <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-deep">
                DTCP-approved plots · Tamil Nadu
              </span>
            </div>

            {/* 4xl, not 5xl. The 5xl step tops out at 6.854rem, which on a
                laptop put the headline at 110px and left room for nothing else
                on the first screen. The measure is narrower than it was, too:
                the copy now shares the frame with the arch instead of lying
                across it, so it has to stop before it reaches the gatepost —
                and the hard break this line used to carry went with it, because
                at 36rem "with nothing left to check." no longer fits on one line
                and forcing the break there left "check." alone on a third. */}
            {/* ⚠️ Chosen by the owner 2026-08-10 from three drafts, replacing
                "Land you can build on, with nothing left to check."

                Two things moved with it and are worth knowing before anyone
                edits it back or sideways:

                1. The h1 no longer names what is sold. The eyebrow directly
                   above it ("DTCP-approved plots · Tamil Nadu"), the <title>
                   and the lead below all still carry it, so the page is not
                   silent on the subject — but this heading is now atmosphere
                   rather than argument, which is a change of job.
                2. It shares a register, and two words, with "Somewhere your
                   children will say they are from" further down the page —
                   whose lead runs "an address the whole family knew by heart".
                   That section is the page's designated warm passage. Having
                   two is not fatal, but if one of them is ever rewritten they
                   should be pulled apart rather than closer. */}
            <h1 className="mt-phi3 text-balance text-4xl text-ink">
              The address your family keeps.
            </h1>

            <p className="mt-phi3 text-pretty text-lg leading-relaxed text-ink-soft">
              Residential plots in sanctioned layouts across Erode, Salem, Tiruppur and Coimbatore —
              clear and marketable title, roads and water formed to the approved plan, and the plot
              schedule published before you visit.
            </p>

            <div className="mt-phi4 flex flex-wrap gap-3">
              {/* Ink, not red. The header already carries the one filled red
                  control this view is allowed; a second would spend the accent. */}
              <Link
                href="/properties"
                className="rounded-full bg-ink px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-500 hover:-translate-y-0.5 hover:bg-charcoal hover:shadow-raise"
                style={{ transitionTimingFunction: "var(--ease-silk)" }}
              >
                See available plots
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-ink/20 bg-canvas/70 px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition-all duration-500 hover:-translate-y-0.5 hover:border-ink/35 hover:bg-canvas"
                style={{ transitionTimingFunction: "var(--ease-silk)" }}
              >
                Book a site visit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* The console takes the straddling position the rail used to hold — it
          overlaps the banner's foot, which is what makes glass legitimate here
          under the rule in cadastral.css (glass only over imagery, never on the
          page's own canvas). Like the rail it sits OUTSIDE the banner block, so
          its height is not taken off the sides of a 3.3:1 frame. */}
      <div className="relative mx-auto max-w-[1280px] px-5 lg:px-10">
        {/* Exactly half over the banner above 1400px — the lift is half the
            console's own height, and the banner's bottom padding is derived
            from the same number so the copy plate is never covered. Both live
            in royal.css under "THE CONSOLE'S STRADDLE"; changing one here
            without the other is the bug that block exists to prevent. */}
        <div className="mt-phi3 min-[1400px]:mt-[var(--rj-console-lift)]">
          <HeroConsole districts={districts} />
        </div>
      </div>

      {/* Live inventory as a glass rail below the console. It sits OUTSIDE the
          banner block on purpose: inside it, its height would be taken off the
          sides of a 3.3:1 frame. */}
      {slides.length > 0 && (
        <div className="relative mx-auto max-w-[1280px] px-5 pb-phi5 lg:px-10">
          {/* ⚠️ The `lg:-mx-[13px]` bleed this carried is GONE, and its removal
              is the alignment fix, not a revert.

              The bleed was right when the copy lay bare on the artwork: the
              headline started at the container edge, and pulling the rail out by
              its own chrome (1px border + 6px card + 6px item) put the first
              thumbnail on that same column. Then the `gilt-light` plate arrived
              and moved the headline 35px inside its own padding, which left the
              hero with THREE left edges — rail card 99, plate and header logo
              112, headline 147.

              One column wins and it is the container's: every card edge in this
              hero now starts where the logo above it and the body copy below it
              start. Contents are then inset by each card's own padding, 6px for
              a rail and 35px for a plate, which is what padding is. Aligning the
              CONTENTS instead would require those two paddings to be equal —
              a chunky rail or a cramped plate. */}
          <div className="glass mt-phi3 rounded-xl p-1.5">
            {/* The items SHARE the rail rather than queueing at its left edge:
                `flex-1` from `sm` up divides the full width between however
                many developments are selling, so three of them read as three
                equal choices instead of a short row with dead space beside it.
                Below `sm` they keep their minimum width and the rail scrolls,
                because squeezing three cards into 375px reads as nothing. */}
            <div className="flex gap-1 overflow-x-auto sm:overflow-x-visible">
              {slides.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex min-w-[13rem] shrink-0 items-center gap-2.5 rounded-[16px] p-1.5 transition-colors duration-300 hover:bg-canvas/70 sm:min-w-0 sm:flex-1 sm:shrink"
                >
                  <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-[10px] bg-canvas-sunken">
                    <Image src={s.image} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-micro uppercase tracking-[0.14em] text-jamin-red-deep">
                      {s.eyebrow}
                    </span>
                    <span className="block truncate text-base text-ink transition-colors group-hover:text-jamin-red-deep">
                      {s.title}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
