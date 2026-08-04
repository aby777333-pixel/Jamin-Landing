"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/properties", label: "Properties" },
  { href: "/properties?type=residential_plot", label: "Residential Plots" },
  { href: "/projects/completed", label: "Completed" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

/**
 * Transparent over the hero, solid once scrolled — the standard luxury-site
 * move, but it must not cost a repaint on every scroll frame, so the scroll
 * listener is passive and only flips a boolean at one threshold.
 */
export function SiteHeader() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A menu that stays open while the page scrolls behind it feels broken.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-500 ${
        solid
          ? "border-b border-line bg-canvas/85 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      }`}
      style={{ transitionTimingFunction: "var(--ease-silk)" }}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 lg:px-10">
        <Link href="/" className="flex items-center" aria-label="Jamin Properties — home">
          <Image
            src="/logo.png"
            alt="Jamin Bazaar"
            width={200}
            height={73}
            priority
            className="h-9 w-auto lg:h-11"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              className="group relative text-tiny font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink"
            >
              {n.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-jamin-gold transition-all duration-500 group-hover:w-full" />
            </Link>
          ))}
          <Link
            href="/contact"
            className="rounded-full bg-jamin-red px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep hover:shadow-raise"
          >
            Book a Site Visit
          </Link>
        </nav>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          <span className="flex h-10 w-10 flex-col items-center justify-center gap-1.5">
            <span
              className={`h-px w-6 bg-ink transition-all duration-300 ${open ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span className={`h-px w-6 bg-ink transition-all duration-300 ${open ? "opacity-0" : ""}`} />
            <span
              className={`h-px w-6 bg-ink transition-all duration-300 ${open ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-line bg-canvas px-5 pb-8 pt-2 lg:hidden"
          aria-label="Primary mobile"
        >
          {NAV.map((n) => (
            <Link
              key={n.label}
              href={n.href}
              onClick={() => setOpen(false)}
              className="block border-b border-line py-4 text-lg text-ink-soft"
            >
              {n.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="mt-6 block rounded-full bg-jamin-red px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white"
          >
            Book a Site Visit
          </Link>
        </nav>
      )}
    </header>
  );
}
