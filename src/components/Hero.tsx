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

      <div className="relative mx-auto flex min-h-[clamp(30rem,78vh,44rem)] max-w-[1280px] flex-col justify-end px-5 pb-phi5 pt-phi7 lg:px-10 lg:pb-phi6">
        <div className="max-w-3xl reveal">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 bg-white/50" />
            <span className="text-micro font-medium uppercase tracking-brand text-white/85">
              DTCP-approved plots · Tamil Nadu
            </span>
          </div>

          <h1 className="mt-phi3 text-5xl text-white">
            Land you can build on,
            <br className="hidden sm:block" /> with nothing left to check.
          </h1>

          <p className="mt-phi3 max-w-xl text-lg leading-relaxed text-white/80">
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
          <div className="glass mt-phi5 rounded-xl p-2">
            <div className="flex gap-1 overflow-x-auto">
              {slides.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex min-w-[14rem] shrink-0 items-center gap-3 rounded-[18px] p-2 transition-colors duration-300 hover:bg-canvas/70"
                >
                  <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-canvas-sunken">
                    <Image src={s.image} alt="" fill sizes="64px" className="object-cover" />
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
