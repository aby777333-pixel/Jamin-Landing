"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = {
  image: string;
  eyebrow: string;
  title: string;
  blurb: string;
  href: string;
};

const INTERVAL = 6500;

/**
 * Full-bleed cinematic carousel.
 *
 * Slides are passed in from the server, sourced from real project photography
 * in Supabase — nothing here is hard-coded, so when the admin adds a project or
 * swaps a photo the hero follows without a code change. The structure already
 * accepts an unlimited number of slides, which is what the CMS-driven hero will
 * feed it later.
 */
export function Hero({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (n: number) => setI((prev) => (n + slides.length) % slides.length),
    [slides.length],
  );

  useEffect(() => {
    if (paused || slides.length < 2) return;
    // Autoplay is a convenience, never a trap: it pauses on hover/focus and is
    // disabled outright for visitors who asked for reduced motion.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => go(i + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [i, paused, go, slides.length]);

  if (slides.length === 0) return null;

  return (
    <section
      className="relative h-[86svh] min-h-[560px] w-full overflow-hidden bg-ink"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 48) go(i + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
      aria-roledescription="carousel"
      aria-label="Featured Jamin developments"
    >
      {slides.map((s, idx) => (
        <div
          key={s.image}
          className="absolute inset-0 transition-opacity duration-[1400ms]"
          style={{
            opacity: idx === i ? 1 : 0,
            transitionTimingFunction: "var(--ease-silk)",
          }}
          aria-hidden={idx !== i}
        >
          <Image
            src={s.image}
            alt=""
            fill
            priority={idx === 0}
            sizes="100vw"
            className={`object-cover ${idx === i ? "kenburns" : ""}`}
          />
          {/* Two-stop scrim: the headline must stay legible over any photo. */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-ink/25" />
        </div>
      ))}

      <div className="relative mx-auto flex h-full max-w-[1280px] flex-col justify-end px-5 pb-phi6 lg:px-10">
        <div key={i} className="max-w-3xl">
          <div className="rise rise-1 flex items-center gap-3">
            <span className="h-px w-10 bg-jamin-gold" />
            <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-light">
              {slides[i].eyebrow}
            </span>
          </div>

          <h1 className="rise rise-2 mt-phi3 text-3xl text-white lg:text-4xl">{slides[i].title}</h1>

          <p className="rise rise-3 mt-phi3 max-w-xl text-lg leading-relaxed text-white/80">
            {slides[i].blurb}
          </p>

          <div className="rise rise-4 mt-phi4 flex flex-wrap items-center gap-4">
            <Link
              href={slides[i].href}
              className="rounded-full bg-jamin-red px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-raise transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
            >
              Explore this project
            </Link>
            <Link
              href="/properties"
              className="rounded-full border border-white/35 px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm transition-all duration-300 hover:border-white hover:bg-white/10"
            >
              All properties
            </Link>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="mt-phi5 flex items-center gap-3">
            {slides.map((s, idx) => (
              <button
                key={s.image}
                onClick={() => go(idx)}
                aria-label={`Go to slide ${idx + 1}: ${s.title}`}
                aria-current={idx === i}
                className="group py-2"
              >
                <span
                  className={`block h-0.5 transition-all duration-700 ${
                    idx === i ? "w-14 bg-jamin-gold" : "w-7 bg-white/40 group-hover:bg-white/70"
                  }`}
                  style={{ transitionTimingFunction: "var(--ease-silk)" }}
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
