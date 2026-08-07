import Image from "next/image";
import Link from "next/link";

/**
 * The homepage hero — one cinematic frame, no carousel.
 *
 * The rotation is gone deliberately. A hero that swaps under a reader is a
 * gimmick: it costs four large downloads, it moves while somebody is reading,
 * and it forces every headline to be generic enough to sit over any of the
 * four. One decisive image, chosen because it shows what Jamin actually sells —
 * plotted land, formed roads, houses going up on it — carries far more than
 * four that show nothing in particular.
 *
 * That also makes this a SERVER component again. There is no state left, so
 * the whole hero ships as HTML with no JavaScript behind it, which is where the
 * LCP win comes from on a page that is meant to feel instant.
 *
 * Type sits on a measured gradient rather than the raw photograph, so white
 * copy holds AA at any crop.
 */
export type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  blurb: string | null;
  href: string;
};

/** hero-03 — plotted layout at golden hour: the road, the plot boundaries and
 *  the first houses. The one frame in the set that is literally the product. */
const ART = { id: "03", w: 1720 };

export function Hero({ slides }: { slides: Slide[] }) {
  return (
    <section className="relative isolate overflow-hidden bg-charcoal">
      <div className="absolute inset-0">
        <Image
          src={`/hero/hero-${ART.id}-${ART.w}.webp`}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="veil absolute inset-0" />
      </div>

      {/* 62vh, not 78. A hero that fills the whole viewport hides the fact that
          there is a site under it — the reader has to scroll before anything
          proves the page continues. Capped at 34rem so it stays a band on a
          large monitor rather than growing with the screen. */}
      <div className="relative mx-auto flex min-h-[clamp(23rem,58vh,32rem)] max-w-[1280px] flex-col justify-end px-5 pb-phi4 pt-phi5 lg:px-10">
        <div className="max-w-3xl reveal">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-white/50" />
            <span className="text-micro font-medium uppercase tracking-brand text-white/85">
              DTCP-approved plots · Tamil Nadu
            </span>
          </div>

          {/* 4xl, not 5xl. The 5xl step tops out at 6.854rem, which on a laptop
              put the headline at 110px and left room for nothing else on the
              first screen. */}
          <h1 className="mt-phi3 text-4xl text-white">
            Land you can build on,
            <br className="hidden sm:block" /> with nothing left to check.
          </h1>

          <p className="mt-phi3 max-w-2xl text-lg leading-relaxed text-white/85">
            Residential plots in sanctioned layouts across Erode, Salem, Tiruppur and Coimbatore —
            clear and marketable title, roads and water formed to the approved plan, and the plot
            schedule published before you visit.
          </p>

          <div className="mt-phi4 flex flex-wrap gap-3">
            <Link
              href="/properties"
              className="rounded-full bg-white px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition-all duration-500 hover:-translate-y-0.5 hover:bg-canvas"
              style={{ transitionTimingFunction: "var(--ease-silk)" }}
            >
              See available plots
            </Link>
            <Link
              href="/contact"
              className="glass-dark rounded-full px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-500 hover:-translate-y-0.5"
              style={{ transitionTimingFunction: "var(--ease-silk)" }}
            >
              Book a site visit
            </Link>
          </div>
        </div>

        {/* Live inventory as a floating glass rail — the one place glass earns
            its keep here, because it has to sit over a photograph. */}
        {slides.length > 0 && (
          <div className="glass mt-phi4 rounded-xl p-1.5">
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
        )}
      </div>
    </section>
  );
}
