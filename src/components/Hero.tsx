import Image from "next/image";
import Link from "next/link";

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
 * hero-16 — the branded gateway banner supplied 2026-08-09. A temple-form arch
 * over a formed road lined with palms, on a warm near-white ground that sweeps
 * into the brand red at the right.
 *
 * ⚠️ This frame changed the hero's TREATMENT, not just its pixels, and the two
 * cannot be separated. Everything before it was photographic and dark enough to
 * carry white type across a full bleed (`veil`). This one is near-white down
 * the whole left third — the exact band the copy occupies — so white type had
 * nothing to sit on. The words are therefore ink on the artwork's own paper,
 * which is the composition the artwork was drawn for: it is a banner with an
 * empty left panel, and that panel is where the headline goes.
 *
 * ⚠️ The renditions are TRIMMED from the supplied file, not merely resized. The
 * original is 1983x793 and bakes in a white strip reading "DTCP Approved ·
 * Prime Locations · Best Value · Safe & Secure" plus a column of categories
 * ("Villa Plots", "Farm Lands"). Those are pixels: not selectable, not
 * translated, invisible to a screen reader, and they do not reflow — and two of
 * the categories are not sold here while "Best Value" is a claim this site makes
 * nowhere else. The asset is cut at y=600, above both, which also frees the
 * bottom of the frame for the inventory rail — the one thing in this hero that
 * is true, current and clickable.
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
const ART = { id: "16", w: 1983 };

export function Hero({ slides }: { slides: Slide[] }) {
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
          <div className="absolute inset-0 bg-gradient-to-r from-canvas from-28% via-canvas/88 via-44% to-transparent to-62%" />
        </div>

        {/* 54vh, not 100. A hero that fills the viewport hides the fact that
            there is a site under it. Capped at 30rem, which on this frame is a
            second constraint as well as a taste one: every extra pixel of height
            is taken off the sides of the banner. */}
        <div className="relative mx-auto flex max-w-[1280px] flex-col justify-end px-5 pb-phi4 pt-phi5 lg:px-10 min-[1400px]:min-h-[clamp(22rem,54vh,30rem)]">
          <div className="max-w-xl reveal">
            <div className="flex items-center gap-3">
              <span className="h-px w-12 rule-red" />
              <span className="text-micro font-semibold uppercase tracking-brand text-jamin-red-deep">
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
            <h1 className="mt-phi3 text-balance text-4xl text-ink">
              Land you can build on, with nothing left to check.
            </h1>

            <p className="mt-phi3 text-pretty text-lg leading-relaxed text-ink-muted">
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

      {/* Live inventory as a glass rail straddling the foot of the banner. It
          sits OUTSIDE the banner block on purpose: inside it, its height would
          be taken off the sides of a 3.3:1 frame. The small negative margin
          keeps it reading as part of the hero rather than as the next section. */}
      {slides.length > 0 && (
        <div className="relative mx-auto max-w-[1280px] px-5 pb-phi5 lg:px-10">
          <div className="glass mt-phi3 rounded-xl p-1.5 min-[1400px]:-mt-phi3">
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
