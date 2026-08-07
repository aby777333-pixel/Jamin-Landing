import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "./ui";

/**
 * The hero every page opens with.
 *
 * Built as a SPLIT rather than text-over-image, and that is a deliberate
 * accessibility decision as much as an aesthetic one: the words sit on the
 * page's own canvas, so their contrast is fixed and knowable, while the render
 * bleeds off the right edge. No scrim, no guessing what a photograph does to
 * legibility, and nothing to re-check every time the artwork changes.
 *
 * It works because of the artwork itself — the supplied renders sit on a
 * near-white ground with red architectural line-work, so `hero-fade` dissolves
 * their left edge into the canvas instead of ending in a hard rectangle.
 *
 * ⚠️ These images are conceptual renders, NOT photographs of Jamin projects.
 * They may carry a page as brand imagery and must never be captioned as a
 * development or placed on a property card. See public/hero/README.md.
 */
export type HeroArt = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

/** The widest rendition that exists for each source image. */
const TOP_WIDTH: Record<HeroArt, number> = {
  1: 1850, 2: 1920, 3: 1720, 4: 1717, 5: 1823,
  6: 1672, 7: 1672, 8: 1672, 9: 1672, 10: 1672,
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
  actions,
  meta,
  priority = true,
  size = "standard",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  art: HeroArt;
  actions?: ReactNode;
  /** Small factual line under the copy — counts, never claims. */
  meta?: ReactNode;
  priority?: boolean;
  size?: "standard" | "tall";
}) {
  const { src, srcSet } = artSrc(art);

  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas">
      {/* setting-out grid, the faint texture a layout plan is drawn on */}
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* the render, bleeding off the right edge and dissolving into the page */}
      <div
        className={`pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] lg:block ${
          size === "tall" ? "" : ""
        }`}
        aria-hidden="true"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          srcSet={srcSet}
          sizes="58vw"
          alt=""
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="hero-fade h-full w-full object-cover object-left"
        />
      </div>

      <Container
        className={`relative ${size === "tall" ? "py-phi6 lg:py-phi7" : "py-phi5 lg:py-phi6"}`}
      >
        <div className="max-w-[34rem] lg:max-w-[38rem]">
          {eyebrow && (
            <div className="flex items-center gap-3">
              <span className="h-px w-12 rule-red" />
              <span className="text-micro font-semibold uppercase tracking-brand text-jamin-red">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="mt-phi3 text-4xl text-ink">{title}</h1>
          {lead && (
            <div className="mt-phi3 text-lg leading-relaxed text-ink-muted">{lead}</div>
          )}
          {meta && <div className="mt-phi3 text-tiny text-ink-faint">{meta}</div>}
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
