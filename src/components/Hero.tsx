import Image from "next/image";
import Link from "next/link";
import { HeroConsole } from "./HeroConsole";
import { LivingHeroArt } from "./LivingHeroArt";
import { Docket } from "@/components/ui/Docket";
import { GoldDust } from "@/components/GoldDust";
import { STAGE_STONE } from "@/lib/stones";

/** The stage word as it arrives in a slide's eyebrow ("Ongoing · Salem"),
 *  mapped back to its stone so the rail's badges speak the same colour key
 *  as the cards and the filter pills. Label-keyed because `Slide` is a
 *  one-line contract that deliberately does not carry the phase slug. */
const STAGE_BY_LABEL: Record<string, { stone: string; ink: string }> = Object.fromEntries(
  Object.values(STAGE_STONE).map((s) => [s.label, { stone: s.stone, ink: s.ink }]),
);

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
/* ⚠️ CARTOUCHE 2026-08-17: hero-46 — JAMIN TRIDENT from the owner's JAMIN
   CITY set — replaces hero-20. It is 2:1, not 3.3:1, and it is a lit dusk
   frame rather than a light banner, which moves two numbers with it (the pair
   rule): the copy plate's sheer alpha rises 0.24 → 0.85 (ink type cannot sit
   on a quarter-strength plate over a dark red roofline), and the crop steers
   centre rather than 35% (the trident and its name are the centre of the
   frame). The hero-20 notes below are kept for the day the banner returns. */
/* hero-61 (2026-08-17 late): the richer Trident dusk frame — the JAMIN
   TRIDENT letters and fountain centre-frame, the lockup wall right —
   replacing hero-46 the same day. 1581x995 (1.59:1), noticeably TALLER than
   46's 2:1, so the banner crop spends less height. */
/* ⚠️ Kept as the register's record of the DUSK identity frame even though the
   backdrop now cycles (LivingHeroArt) and the phone band carries hero-72 —
   the notes throughout this file cite it. eslint-disable, not deletion: the
   constant is this file's documentation anchor. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ART = { id: "61", w: 1581 };

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

      {/* Below `xl` (1280px) the artwork LEADS as a band instead of sitting
          behind the words.

          ⚠️ 1280, LOWERED FROM 1400 on 2026-08-11 — reported as "the hero
          layout is wrong at 100% zoom and correct at 90%", which is exactly
          what a 1400px breakpoint does to a 1280 or 1366 laptop: 1366 / 0.9 =
          1518 CSS px, so zooming OUT was the only way to reach the composition
          the page was designed in. Two of the commonest desktop widths there
          are were getting the phone treatment.

          The old note here said the overlay "fails an audit" below 1400, and
          the number it quoted (3.46:1 at 1280) was measured through the CANVAS
          WASH — which no longer exists. Re-measured against the `gilt-light`
          plate that replaced it, sampling the actual pixels of hero-20 under
          the plate's rect and compositing at its 0.24 alpha:

            width   dark px behind plate   h1 @ 5th pct   lead    eyebrow
            1440           14.4%              3.90         2.28     1.70   ← shipped
            1366           14.7%              3.84         2.25     1.67
            1280           14.8%              3.86         2.26     1.68
            1200           17.3%              3.58         2.09     1.56
            1100           20.9%              3.26         1.90     1.42
            1024           24.6%              2.94         1.72     1.28

          1366 and 1280 are within one percent of the composition that is
          already live at 1440; 1200 and below are not. That cliff is not a
          coincidence and it is what pins the breakpoint HERE rather than at
          some rounder number: the copy container is `max-w-[1280px]` and
          centred, and the banner is centred too, so above 1280 the plate and
          the crop slide inward together and the plate keeps landing on the same
          slice of artwork (source x 443 at 1440, 450 at 1280). At 1280 the
          container stops shrinking and the crop does not, so from there down
          the plate walks right — onto the gatepost and the arch, which is the
          failure the original note described. Source x reaches 486 at 1200 and
          549 at 1024.

          Move this breakpoint below `xl` and that walk is what you are buying.

          The band comes FIRST so a phone still opens on the picture; put it
          after the copy and the whole first screen is type on ivory. Cropped to
          the arch and the road — centring it would show the empty paper panel
          and lose the only thing in the frame worth seeing at this size. */}
      {/* ⚠️ THE PHONE BAND CARRIES A DIFFERENT FRAME NOW (owner report
          2026-08-18: the board on hero-61 sits RIGHT and "appears cramped
          and less visible" in the band's crop — "replace the previous hero
          image where the branding title is in the left side for the mobile
          view only"). hero-72 is the register's one left-lockup frame: the
          wall lockup at far LEFT with the family walking in, so `left
          center` puts the brand exactly where the report wants it. Desktop
          keeps hero-61 untouched. Cross-surface reuse (72 also carries
          /downloads) under the where-we-build/hero-39 precedent — a phone
          band and a desktop hero are never on screen together. */}
      {/* 🚨 `left 28%`, NOT `left center` (report 7, 2026-08-19: "the hero image
          is being cropped from the top on mobile, causing important parts of
          the property entrance and branding to be cut off", priority High).

          The horizontal half was always right — hero-72 is the register's one
          LEFT-lockup frame and `left` is what keeps the wall sign in view. The
          VERTICAL half was never checked, and it is what cut the arch.

          Measured. hero-72 is 1536×1024 (1.5:1). In the 375×176 band it scales
          to 375×250, so 74px of height is discarded; at `center` that is 37px
          off the top, and the arch lockup begins at 15% of the frame — i.e.
          exactly where the cut lands, which is why the top of "JAMIN BAZAAR"
          was shaved rather than the whole sign being missing. At `sm` it is far
          worse: 640×224 scales to 640×427, discards 203px, and `center` takes
          101px — 24% — off the top, well into the sign.

          The two things worth keeping are the arch lockup (15–29% of the
          frame's height) and the wall lockup with the family (51–65%). At 28%
          the visible window is 8–79% on a phone and 13–66% at `sm`, which holds
          both at both sizes. `top` would also save the arch and would throw the
          family away at `sm`.

          ⚠️ The band also grows `sm:h-56` → `sm:h-64`. At 224px the window is
          only 52.5% of the frame against the 50% those two elements span — a
          4px margin, which is not a margin. 256px opens it to 60%.

          ⚠️ If this frame is ever swapped, re-measure. This number is solved
          against hero-72's composition, not a house default. */}
      {/* 🚨 hero-83 REPLACES hero-72 ON THE PHONE BAND (report 13, 2026-08-21:
          "the hero image is cropped too aggressively… the JAMIN BAZAAR title
          appears twice — once in the header/top area and again inside the hero
          image… this duplication makes the top section feel repetitive and
          visually cluttered… target result: one clear Jamin Bazaar brand
          presence at the top + a fully visible gate image").

          ⚠️ THE DUPLICATION WAS DESIGNED IN, AND SO WAS THE TIGHT CROP — both
          follow from hero-72 carrying the wordmark TWICE, on the arch beam
          (15–29% of the frame) and on the wall (49–65%). The `left 28%` crop
          existed to hold BOTH, which is exactly the repetition now reported,
          and holding both is what forced a window of only 47% of the frame's
          height. There is no crop of that frame that shows one wordmark and a
          whole gate: at 375 the band is width-bound, so `objectPosition`'s X
          has no travel at all and the wall can only be removed by throwing
          away the bottom half of the picture with it.

          hero-83 answers both halves at once. Its sign reads JAMIN GEMSTONE —
          the community, not a second copy of the header's wordmark — so the
          brand appears once at the top of the screen, and at 1.777:1 against
          the band's 2.13:1 the frame is width-bound with only 35px of height
          to lose: 83% of the picture survives, which is what "a fully visible
          gate image" means here. Centre is the right anchor because the beam
          and the sign sit either side of the midline.

          ⚠️ Cross-surface reuse (it also carries /projects/ongoing) under the
          hero-39/72 precedent — a phone band and a desktop hero are never on
          screen together, and these are different routes. Standing rule at
          full strength: the frame names a community not in the catalogue, so
          alt="", aria-hidden, and never a caption. hero-72 stays on disk. */}
      <div className="relative h-48 w-full sm:h-64 xl:hidden">
        <Image
          src="/hero/hero-83-1672.webp"
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority
          className="object-cover"
          style={{ objectPosition: "50% 50%" }}
        />
      </div>

      {/* The banner and the words it was drawn around. The rail is deliberately
          NOT in here — see the note on ART above. */}
      <div className="relative">
        {/* Gilded Register §7: the Vault's drifting gold dust over the Trident
            dusk — the site's best light effect finally on its first screen. */}
        <GoldDust />
        {/* From `xl` (1280px) up the banner is full-bleed behind the copy. */}
        <div
          className="pointer-events-none absolute inset-0 hidden xl:block"
          aria-hidden="true"
        >
          {/* THE LIVING DAY (do-all #2): the backdrop follows IST — daylight
              gate by day, this trident at dusk, the night gate after dark.
              See LivingHeroArt for the frame register, the per-frame crops
              and why the 0.62 sand plate needs no re-sweep. The hero-61
              notes below still govern its own frame. */}
          {/* ⚠️ The hero-20/hero-61 crop sweeps that governed the single
              <Image> this replaced (35% for the 3.3:1 banner; 50% 0% for the
              trident's apex, owner report 2026-08-18) now live per-frame in
              LivingHeroArt's register — a hero and its crop are ONE change,
              so the crop travels with the frame. */}
          <LivingHeroArt />
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

        {/* ⚠️ LOWERED 2026-08-17, from clamp(30rem,82vh,46rem) — this is the
            "if the red sweep ever has to come back into frame, this number is
            the first thing to lower" note below being cashed in. The owner's
            report: the hero is too zoomed in and the RIGHT of the banner — the
            palms and the red sweep — is cropped off. The section is
            content-sized on a 3.3:1 frame, so the card was slimmed in the same
            change (padding, button spacing, top padding): height is the zoom
            control and the card is the height. ~59% of the banner's width
            before; ~72% after at 1440, which is the figure the note on ART
            gives for "the whole arch and the red sweep". */}
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
        {/* ⚠️ THE STRADDLE IS OFF (owner report 2026-08-18): "Where would you
            like to own?" was riding half-over the banner's foot and so sat
            inside the first screen. The console now sits wholly BELOW the
            100svh hero — off the first screen — and the banner's xl padding
            went symmetric (`xl:py-phi5`, replacing the console-clear bottom
            pad), which is also what actually centres the copy card: with
            `justify-center`, the old outsized bottom padding pushed the card
            high ("currently it is upside", same report). The straddle math
            stays in royal.css for the day it returns. */}
        {/* ⚠️ FULL VIEWPORT HEIGHT (owner 2026-08-17 night): the hero fills the
            first screen less the sticky header — `svh` so a phone's collapsing
            URL bar cannot make it overflow. The height-costs-width arithmetic
            that governed every previous value belonged to the 3.3:1 banner;
            hero-61 is 1.59:1, so a viewport box is WIDTH-bound on any desktop
            and the full frame width stays in shot regardless. The console
            still straddles the foot via the same pb var. */}
        <div className="relative mx-auto flex max-w-[1280px] flex-col justify-center px-5 pb-phi5 pt-phi3 lg:px-10 xl:min-h-[calc(100svh-var(--header-h))] xl:py-phi5">
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
          {/* ⚠️ `p-phi3` at every width now, not `sm:p-phi4` — half of the
              2026-08-17 zoom-out. The report also called the card "slightly
              oversized", and on this content-sized section every pixel the
              card gives up comes back as banner width. The 42rem measure is
              untouched for the reason recorded above: narrowing it makes the
              copy TALLER, which is the expensive direction. */}
          {/* ⚠️ 0.62 AT EVERY WIDTH, AND NO HALO — owner 2026-08-17 late:
              "increase the background of the caption tab, and remove the text
              shadow", reversing the same morning's max-sheer + halo request.
              The plate carries the ink again (rj-sheer-copy-ink is OFF this
              plate — that class is exactly the four-layer shadow that was
              asked off), so its alpha is back to a working value: 0.62 sits
              between the sheer 0.12 and the audited-opaque 0.74, visibly a
              tab, still letting the Trident dusk through. Both vars, as
              before, so it does not snap opaque below 1440. */}
          {/* ⚠️ max-w-xl AND the type a step down (owner 2026-08-17 night:
              "the home hero captions and the tab is a little oversized"). The
              old 42rem-is-not-a-lever note assumed the 4xl headline; at 3xl
              the copy is shorter at 36rem than the old block was at 42, so
              the content-sized banner GAINS width from this change rather
              than losing it. */}
          {/* 🚨 0.88, UP FROM 0.62 (report 12, 2026-08-21: "the hero section
              has an overlap between the main heading text and the JAMIN
              SOULFUL signage in the background image. The background branding
              appears behind the heading, reducing visual clarity… ensure the
              signage does not appear directly behind or through the
              heading").

              The crop took the signage as far right as the geometry allows
              (LivingHeroArt's register works the arithmetic), and it is still
              96px short of clearing this plate's right edge — the plate is
              576px of a 1430px box and the lockup starts at 36% of the frame,
              so no object-position can separate them. What CAN separate them
              is the plate itself: at 0.62 the beam's lettering reads through
              the card and lands across the headline, at 0.88 it does not.

              ⚠️ This continues the owner's own 2026-08-17 direction ("increase
              the background of the caption tab"), which is what moved it to
              0.62 in the first place — not a reversal of the max-sheer round.
              Both vars again, or the narrow branch snaps opaque below 1440.
              The frame still reads: 0.88 sand over a lit gate is a card on a
              picture, not a panel. */}
          <div
            className="gilt-light rj-gilt-light-sheer reveal max-w-xl rounded-2xl p-phi3 text-center sm:text-left"
            style={
              {
                "--rj-sheer-alpha": 0.88,
                "--rj-sheer-alpha-narrow": 0.88,
              } as React.CSSProperties
            }
          >
            {/* ⚠️ CENTRED ON A PHONE ONLY — `sm:` puts everything back. The
                report (2026-08-14) is a screenshot of a 285px card, and at that
                width a left rag with a full-width button under it does read as
                unbalanced. From `sm` up this plate is an editorial block set
                against a 3.3:1 banner whose composition the notes above tune
                line by line; centring it there would undo that for a complaint
                nobody made about it. Say the word if it should carry up. */}
            {/* `sm:justify-end` (owner 2026-08-17): captions sit right. Phones
                keep the centred treatment the 285px-card report asked for. */}
            <div className="flex items-center justify-center gap-3 sm:justify-end">
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
            {/* CARTOUCHE §3.2 — the two-colour headline rule, applied here and
                on at most two other headings site-wide. The sentence splits at
                its semantic hinge and ends on the fact, in teal: ink → bronze
                → teal, exactly as the reference creative colours KNOW THE
                PROCESS. All three inks are AAA/AA on the plate (bronze-700
                5.6:1, teal-700 7.8:1 on sand). */}
            {/* Aesthetics item 22: ink-settle — this H1 only, by rule. */}
            <h1 className="rj-ink-settle mt-phi3 text-balance text-3xl uppercase text-ink">
              The address <span className="text-jamin-gold-ink">your family</span>{" "}
              <span className="text-canopy">keeps.</span>
            </h1>

            <p className="mt-phi2 text-pretty text-base leading-relaxed text-ink-soft">
              Residential plots in sanctioned layouts across Erode, Salem, Tiruppur and Coimbatore —
              clear and marketable title, roads and water formed to the approved plan, and the plot
              schedule published before you visit.
            </p>

            {/* ⚠️ `flex-col` UNTIL `sm`, WHICH IS WHAT MAKES THEM FULL WIDTH —
                not a `w-full` on each control. A flex column stretches its
                items across the cross axis by default, so the buttons fill the
                card on a phone and go back to being sized by their labels the
                moment the row returns. Reported 2026-08-14 as the CTAs being
                "too narrow compared to the available card width", and at 285px
                they were: "Book a site visit" is 17 characters and took barely
                half the card.

                ⚠️ `text-center` on each, because these are `<Link>`s and an
                anchor is inline — stretching the BOX does not centre the label
                inside it, and a full-width button with its text against the
                left edge is worse than the narrow pill was. */}
            <div className="mt-phi3 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* Ink, not red. The header already carries the one filled red
                  control this view is allowed; a second would spend the accent. */}
              <Link
                href="/properties"
                className="rounded-full bg-ink px-7 py-3 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-500 hover:-translate-y-0.5 hover:bg-charcoal hover:shadow-raise"
                style={{ transitionTimingFunction: "var(--ease-silk)" }}
              >
                See available plots
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-jamin-gold bg-canvas/70 px-7 py-3 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition-all duration-500 hover:-translate-y-0.5 hover:border-jamin-gold-ink hover:bg-canvas"
                style={{ transitionTimingFunction: "var(--ease-silk)" }}
              >
                Book a site visit
              </Link>
            </div>

            {/* CARTOUCHE §4.3 — the index sheet's own docket. Site-wide facts
                only: this hero fronts the whole register, so it carries the
                index serial rather than any one project's. */}
            <div className="mt-phi3 hidden sm:block">
              <Docket
                lines={[
                  "Jamin Properties",
                  "Tamil Nadu · DTCP-approved layouts",
                  "SHEET JG-TN-000 · INDEX",
                ]}
              />
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
        {/* ⚠️ NO LIFT — the straddle came off 2026-08-18 (owner report: this
            section must not appear inside the first screen). The console sits
            in flow below the 100svh banner now; if the straddle ever returns,
            `xl:mt-[var(--rj-console-lift)]` here and the banner's
            `xl:pb-[var(--rj-console-clear)]` must come back TOGETHER — see
            "THE CONSOLE'S STRADDLE" in royal.css. */}
        <div className="mt-phi3">
          <HeroConsole districts={districts} />
        </div>
      </div>

      {/* Live inventory below the console. It sits OUTSIDE the banner block on
          purpose: inside it, its height would be taken off the sides of a
          3.3:1 frame.

          🚨 THE GLASS RAIL BECAME A LABELLED CARD ROW (report 10, 2026-08-21:
          "Improve the project cards below with larger images, clearer status
          badges and readable project names. Maintain consistent card width,
          spacing and alignment" — and the mockup names the row: QUICK ACCESS
          TO OUR LAYOUTS, with VIEW ALL PROPERTIES → on the right). The shared
          glass tray is gone; each development is its own bordered card on the
          page's own ground, the thumb grew 48x72 → 64x96, and the stage badge
          wears its stage's stone instead of one red pill for every stage. */}
      {slides.length > 0 && (
        <div className="relative mx-auto max-w-[1280px] px-5 pb-phi5 lg:px-10">
          <div className="mt-phi4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-ink">
              Quick access to our layouts
            </span>
            <Link
              href="/properties"
              className="text-tiny font-semibold uppercase tracking-[0.14em] text-jamin-red-deep transition-opacity hover:opacity-70"
            >
              View all properties →
            </Link>
          </div>
          {/* The items SHARE the row rather than queueing at its left edge:
              `flex-1` from `sm` up divides the full width between however
              many developments are selling, so three of them read as three
              equal choices instead of a short row with dead space beside it.
              Below `sm` they keep their minimum width and the row scrolls,
              because squeezing four cards into 375px reads as nothing. */}
          <div className="mt-phi2 flex gap-3 overflow-x-auto sm:overflow-x-visible">
            {slides.map((s) => {
              /* ⚠️ SPLIT, NOT A NEW FIELD. `eyebrow` arrives already joined
                 as "Ongoing · Salem" (see the homepage's `slides`), and the
                 report asks for the STAGE to be told apart from the place.
                 Splitting here keeps `Slide` the one-line contract it is and
                 degrades safely: an eyebrow with no separator becomes the
                 stage and no place, which is what a project with no district
                 should show anyway. */
              const [stage, ...place] = s.eyebrow.split(" · ");
              /* The stage's own stone — the same key the cards and the filter
                 pills speak. An unknown label falls back to the signal red. */
              const stone = STAGE_BY_LABEL[stage] ?? {
                stone: "var(--color-jamin-red)",
                ink: "var(--color-jamin-red-deep)",
              };
              return (
                <Link
                  key={s.href}
                  href={s.href}
                  /* 🚨 A BORDER AND A CHEVRON, BECAUSE THE WHOLE CARD WAS
                     ALREADY CLICKABLE AND DID NOT LOOK IT — reported
                     2026-08-14 as "just looking project name". The hit area
                     never changed; what was missing was any mark saying so. */
                  /* 🚨 `glass rj-crystal`, NOT `bg-canvas` (owner 2026-08-21:
                     "the frosty glass stuff is gone. bring them back"). The
                     report-13 rebuild turned the shared glass tray into
                     individual cards — which was the ask — but painted them on
                     flat canvas, so the hero lost the one frosted surface it
                     had. The card SHAPE report 13 asked for is untouched; only
                     the fill returns to the audited glass (0.90 ivory tint +
                     blur + saturation) with `rj-crystal`'s lit top edge. */
                  className="glass rj-crystal group flex min-w-[15rem] shrink-0 items-center gap-3 rounded-xl p-2 transition-all duration-300 hover:-translate-y-0.5 hover:border-jamin-gold hover:shadow-raise sm:min-w-0 sm:flex-1 sm:shrink"
                >
                  {/* 64x96, up from 48x72 — the report's "larger images".
                      `sizes` follows it or the browser keeps fetching the old
                      rendition. */}
                  <span className="rj-sheen relative h-16 w-24 shrink-0 overflow-hidden rounded-[10px] bg-canvas-sunken">
                    <Image src={s.image} alt="" fill sizes="96px" className="object-cover" />
                  </span>
                  {/* 🚨 THE NAME SETS ON TWO LINES (report 13, 2026-08-21:
                      "the current shortcut cards are too short, causing
                      project names and locations to be truncated and making
                      the area name difficult to read… slightly increase the
                      height of each shortcut card so the information is
                      displayed on two lines: Line 1: Jamin Garden, Line 2:
                      Varapatty").

                      Every development is named "Jamin Garden — <place>", so
                      one truncated line was spending its whole width on the
                      half that is the same on every card and clipping the half
                      that identifies it. Split on the em dash: the family name
                      leads, the place sits under it in full. A title without
                      that dash (Trichy's Tulip) simply takes the first line and
                      the second never renders — no placeholder, no invented
                      locality. */}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5">
                      {/* The stage gets the pill in its own stone; the place
                          stays quiet beside it. */}
                      <span
                        className="rounded-full px-2 py-0.5 text-micro font-semibold uppercase tracking-[0.12em]"
                        style={{
                          color: stone.ink,
                          background: `color-mix(in srgb, ${stone.stone} 14%, transparent)`,
                        }}
                      >
                        {stage}
                      </span>
                      {place.length > 0 && (
                        <span className="truncate text-micro uppercase tracking-[0.14em] text-ink-faint">
                          {place.join(" · ")}
                        </span>
                      )}
                    </span>
                    {(() => {
                      const [family, ...rest] = s.title.split(/\s+—\s+/);
                      const locality = rest.join(" — ");
                      return (
                        <>
                          <span className="mt-1 block truncate text-base font-semibold leading-tight text-ink transition-colors group-hover:text-jamin-red-deep">
                            {family}
                          </span>
                          {locality && (
                            <span className="block truncate text-base leading-tight text-ink-muted transition-colors group-hover:text-jamin-red-deep">
                              {locality}
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 pr-1 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-jamin-red-deep"
                  >
                    &rsaquo;
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
