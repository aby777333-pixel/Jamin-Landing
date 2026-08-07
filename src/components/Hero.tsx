"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/**
 * The homepage hero.
 *
 * Same split construction as PageHero — words on the canvas, render bleeding
 * off the right — but it rotates through the brand artwork and carries the
 * live project strip beneath it.
 *
 * The rotation is art only. The headline does not change with it, because a
 * headline that swaps under a reader mid-sentence is a gimmick, and because
 * these renders are conceptual: pairing a project name with one would imply the
 * picture shows that project, which it does not.
 */
export type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  blurb: string | null;
  href: string;
};

const ART = [
  { id: "05", w: 1823 },
  { id: "09", w: 1672 },
  { id: "10", w: 1672 },
  { id: "07", w: 1672 },
] as const;

export function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((n: number) => setI(((n % ART.length) + ART.length) % ART.length), []);

  useEffect(() => {
    if (paused) return;
    // Honour the OS setting rather than overriding it (§87).
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % ART.length), 6500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden border-b border-line bg-canvas"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />

      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[60%] lg:block" aria-hidden="true">
        {ART.map((a, n) => (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            key={a.id}
            src={`/hero/hero-${a.id}-${a.w}.webp`}
            srcSet={`/hero/hero-${a.id}-768.webp 768w, /hero/hero-${a.id}-1280.webp 1280w, /hero/hero-${a.id}-${a.w}.webp ${a.w}w`}
            sizes="60vw"
            alt=""
            fetchPriority={n === 0 ? "high" : "auto"}
            loading={n === 0 ? "eager" : "lazy"}
            decoding="async"
            className="hero-fade absolute inset-0 h-full w-full object-cover object-left transition-opacity duration-[1400ms]"
            style={{ opacity: i === n ? 1 : 0, transitionTimingFunction: "var(--ease-silk)" }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-[1280px] px-5 py-phi6 lg:px-10 lg:py-phi7">
        <div className="max-w-[36rem] lg:max-w-[40rem]">
          <div className="flex items-center gap-3">
            <span className="h-px w-12 rule-red" />
            <span className="text-micro font-semibold uppercase tracking-brand text-jamin-red">
              DTCP-approved plots · Tamil Nadu
            </span>
          </div>

          <h1 className="mt-phi3 text-5xl text-ink">
            Buy land you can
            <br />
            build on.
          </h1>

          <p className="mt-phi3 max-w-xl text-lg leading-relaxed text-ink-muted">
            Jamin Properties develops DTCP-approved residential plots across Erode, Salem, Tiruppur
            and Coimbatore — sanctioned layouts, clear and marketable title, formed roads and water
            to every plot. See the approved plan and the plot you are buying before you decide.
          </p>

          <div className="mt-phi4 flex flex-wrap gap-3">
            <Link
              href="/properties"
              className="rounded-full bg-jamin-red px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
            >
              See available plots
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-ink/15 px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink/45"
            >
              Book a site visit
            </Link>
          </div>

          {/* dots — art only, so they are decorative controls, labelled anyway */}
          <div className="mt-phi5 hidden items-center gap-2 lg:flex">
            {ART.map((a, n) => (
              <button
                key={a.id}
                onClick={() => go(n)}
                aria-label={`Show brand image ${n + 1} of ${ART.length}`}
                aria-pressed={i === n}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === n ? "w-8 bg-jamin-red" : "w-3 bg-ink/20 hover:bg-ink/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative h-52 w-full sm:h-64 lg:hidden">
        <Image
          src={`/hero/hero-${ART[i].id}-1280.webp`}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority
          className="object-cover object-right"
        />
      </div>

      {/* live inventory strip — real projects, directly under the promise */}
      {slides.length > 0 && (
        <div className="relative border-t border-line bg-canvas-alt/70 backdrop-blur">
          <div className="mx-auto flex max-w-[1280px] gap-phi3 overflow-x-auto px-5 py-phi3 lg:px-10">
            {slides.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className="group flex min-w-[15rem] shrink-0 items-center gap-3"
              >
                <span className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-canvas-sunken">
                  <Image src={s.image} alt="" fill sizes="64px" className="object-cover" />
                </span>
                <span className="min-w-0">
                  <span className="block text-micro uppercase tracking-[0.14em] text-jamin-red">
                    {s.eyebrow}
                  </span>
                  <span className="block truncate text-base text-ink transition-colors group-hover:text-jamin-red">
                    {s.title}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
