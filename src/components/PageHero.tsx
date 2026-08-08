import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "./ui";

/**
 * The hero every page opens with.
 *
 * There are two tones, and which one a page uses is decided by the ARTWORK, not
 * by taste. The supplied set splits cleanly in two:
 *
 *  • 1, 2, 3 are photographic — deep skies, golden hour, real tonal range. They
 *    can carry white type across the full bleed, so they get `cinematic`.
 *  • 4–10 are graphic renders on a near-white ground with red architectural
 *    line-work. Laid full-bleed they would need a heavy scrim, which destroys
 *    the very thing that makes them good. They get `paper`: the words sit on
 *    the page's own ivory, the render bleeds off the right edge and `hero-fade`
 *    dissolves its left edge into the canvas.
 *
 * The accessibility consequence matters as much as the aesthetic one. In
 * `paper` the text contrast is fixed and knowable because nothing sits behind
 * it. In `cinematic` white type never touches the raw photograph — `veil` is a
 * measured gradient, dark enough at the copy end that white clears AA whatever
 * the image does underneath.
 *
 * ⚠️ These images are conceptual renders, NOT photographs of Jamin projects.
 * They may carry a page as brand imagery and must never be captioned as a
 * development or placed on a property card. See public/hero/README.md.
 */
export type HeroArt = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/** The widest rendition that exists for each source image. */
const TOP_WIDTH: Record<HeroArt, number> = {
  1: 1850, 2: 1920, 3: 1720, 4: 1717, 5: 1823,
  6: 1672, 7: 1672, 8: 1672, 9: 1672, 10: 1672,
  // Supplied 2026-08-08. 11 ends the shortfall recorded in hero/README.md —
  // there were eleven hero surfaces and ten renders.
  11: 1720, 12: 1672, 13: 1672,
};

function artSrc(n: HeroArt) {
  const id = String(n).padStart(2, "0");
  return {
    src: `/hero/hero-${id}-${TOP_WIDTH[n]}.webp`,
    srcSet: `/hero/hero-${id}-768.webp 768w, /hero/hero-${id}-1280.webp 1280w, /hero/hero-${id}-${TOP_WIDTH[n]}.webp ${TOP_WIDTH[n]}w`,
  };
}

export function PageHero({
  eyebrow,
  title,
  lead,
  art,
  photo,
  actions,
  meta,
  priority = true,
  size = "standard",
  tone = "paper",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  art: HeroArt;
  /**
   * A real photograph, used instead of the brand render.
   *
   * Only ten renders were supplied and there are eleven pages that open with a
   * hero, so one page had to give. `/projects/completed` is the right one to
   * take a photograph: it is the only page whose subject genuinely IS a
   * delivered Jamin project, so per public/hero/README.md real photography is
   * what belongs there anyway — the renders are brand imagery and must never be
   * presented as a project. Passing a photo also releases hero-10 back to
   * /contact, which is how every remaining page ends up with its own image.
   */
  photo?: { src: string; alt: string };
  actions?: ReactNode;
  /** Small factual line under the copy — counts, never claims. */
  meta?: ReactNode;
  priority?: boolean;
  size?: "standard" | "tall";
  tone?: "paper" | "cinematic";
}) {
  const artwork = artSrc(art);
  const src = photo?.src ?? artwork.src;
  const srcSet = photo ? undefined : artwork.srcSet;

  if (tone === "cinematic") {
    return (
      <section className="relative isolate overflow-hidden bg-charcoal">
        <div className="absolute inset-0">
          {/* A render is decoration and stays out of the accessibility tree; a
              photograph of a real project is content and gets a real alt. */}
          <Image
            src={src}
            alt={photo?.alt ?? ""}
            aria-hidden={photo ? undefined : "true"}
            fill
            priority={priority}
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="veil absolute inset-0" />
        </div>

        <Container
          className={`relative flex flex-col justify-end ${
            size === "tall"
              ? "min-h-[clamp(26rem,64vh,38rem)] pb-phi6 pt-phi7"
              : "min-h-[clamp(20rem,48vh,30rem)] pb-phi5 pt-phi6"
          }`}
        >
          {/* The measure opens up on a wide screen. At 42rem a headline like
              "Plots in approved layouts across Tamil Nadu" broke to three lines
              and left "Nadu" alone on the last one, with 880px of empty hero
              beside it. */}
          <div className="max-w-[42rem] rise xl:max-w-[46rem]">
            {eyebrow && (
              <div className="flex items-center gap-3">
                <span className="h-px w-12 bg-white/50" />
                <span className="text-micro font-medium uppercase tracking-brand text-white/85">
                  {eyebrow}
                </span>
              </div>
            )}
            {/* `text-balance` evens the line lengths instead of filling each one
                to the measure and orphaning whatever is left over. */}
            <h1 className="mt-phi3 text-balance text-4xl text-white">{title}</h1>
            {lead && (
              <div className="mt-phi3 max-w-xl text-pretty text-lg leading-relaxed text-white/80">
                {lead}
              </div>
            )}
            {meta && (
              <div className="glass-dark mt-phi3 inline-flex rounded-full px-4 py-1.5 text-tiny text-white/85">
                {meta}
              </div>
            )}
            {actions && <div className="mt-phi4 flex flex-wrap gap-3">{actions}</div>}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas-alt">
      {/* setting-out grid, the faint texture a layout plan is drawn on */}
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* the render, bleeding off the right edge and dissolving into the page */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block"
        aria-hidden={photo ? undefined : "true"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          srcSet={srcSet}
          sizes="58vw"
          /* A render is decoration; a photograph of a real project is content. */
          alt={photo?.alt ?? ""}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="hero-fade h-full w-full object-cover object-left"
        />
      </div>

      <Container
        className={`relative ${size === "tall" ? "py-phi6 lg:py-phi7" : "py-phi5 lg:py-phi6"}`}
      >
        <div className="max-w-[34rem] rise lg:max-w-[38rem]">
          {eyebrow && (
            <div className="flex items-center gap-3">
              <span className="h-px w-12 rule-red" />
              <span className="text-micro font-semibold uppercase tracking-brand text-jamin-red-deep">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="mt-phi3 text-balance text-4xl text-ink">{title}</h1>
          {lead && (
            <div className="mt-phi3 text-pretty text-lg leading-relaxed text-ink-muted">{lead}</div>
          )}
          {meta && (
            <div className="glass mt-phi3 inline-flex rounded-full px-4 py-1.5 text-tiny text-ink-soft">
              {meta}
            </div>
          )}
          {actions && <div className="mt-phi4 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </Container>

      {/* On a phone the render becomes a band beneath the words rather than
          disappearing — the artwork is half the message. */}
      <div className="relative -mt-phi2 h-44 w-full sm:h-56 lg:hidden">
        <Image
          src={src}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority={priority}
          className="object-cover object-right"
        />
      </div>
    </section>
  );
}
