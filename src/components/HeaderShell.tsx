"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavFacets } from "@/lib/site";

/**
 * Transparent over the hero, solid once scrolled — but the listener is passive
 * and only flips one boolean at a single threshold, so it costs nothing per
 * frame.
 *
 * The two mega panels (§57) open on hover for a mouse and on click/Enter for a
 * keyboard, close on Escape and on a click outside, and are plain links
 * underneath — so the menu still works with JavaScript disabled and a crawler
 * still sees every destination.
 */
export function HeaderShell({ facets }: { facets: NavFacets }) {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<null | "projects" | "locations">(null);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A menu that survives navigation feels broken. Adjusting during render on a
  // changed value is React's own answer here — an effect would run a render
  // later, so the old menu would be visible on the new page for a frame.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setPanel(null);
  }

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!panel) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPanel(null);
    };
    // ⚠️ Must test the whole HEADER, not the nav bar. When this checked the
    // inner bar, a mousedown on a link inside the mega panel counted as
    // "outside", the panel unmounted before mouseup, and the click never
    // landed — the dropdown links were unclickable.
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setPanel(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [panel]);

  const hasProjects = facets.phases.length > 0;
  const hasLocations = facets.districts.length > 0;

  const trigger =
    "group relative inline-flex items-center gap-1.5 text-tiny font-medium uppercase tracking-[0.14em] text-ink-soft transition-colors hover:text-ink";
  const underline =
    "absolute -bottom-1.5 left-0 h-px w-0 bg-jamin-gold transition-all duration-500 group-hover:w-full";

  return (
    /* ⚠️ The mouse-leave lives on the HEADER, not on the nav bar inside it.
       It used to sit on the inner bar while the mega panel rendered outside
       that element — so the moment the cursor moved down from a trigger
       towards the panel it left the hover region, the panel closed, and the
       dropdown was effectively unusable with a mouse. Both the triggers and
       the panel now share one hover region, which is the whole header. */
    <header
      ref={headerRef}
      onMouseLeave={() => setPanel(null)}
      /* Flat on the page at rest, frosted the moment it starts overlapping
         content. The header sits in normal flow, so at scroll 0 it is over the
         page's own canvas and needs no treatment at all — the glass (and its
         shadow) would just be decoration. Once scrolled it is genuinely over
         the content, including the dark cinematic heroes, and then it earns
         the frost. */
      className={`sticky top-0 z-40 transition-all duration-500 ${
        solid || panel
          ? "glass border-b border-line/70"
          : "border-b border-transparent bg-transparent"
      }`}
      style={{ transitionTimingFunction: "var(--ease-silk)" }}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 lg:px-10">
        <Link href="/" className="flex items-center" aria-label="Jamin Bazaar — home">
          {/* The full lockup — mark, wordmark and the "signature for Fortune"
              rule. logo.png is the square app mark on its own and belongs on an
              icon, not in a header, where it reads as a favicon that wandered
              onto the page. */}
          <Image
            src="/logo-full.png"
            alt="Jamin Bazaar"
            width={793}
            height={312}
            priority
            /* Without `sizes` Next falls back to 1x/2x density candidates off
               the `width` prop and fetched a 1920px rendition for a 122px box. */
            sizes="(max-width: 1024px) 108px, 130px"
            className="h-10 w-auto lg:h-12"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          <Link href="/properties" className={trigger}>
            Properties
            <span className={underline} />
          </Link>

          {hasProjects && (
            <div onMouseEnter={() => setPanel("projects")} className="relative">
              <button
                type="button"
                className={trigger}
                aria-expanded={panel === "projects"}
                aria-controls={`${panelId}-projects`}
                onClick={() => setPanel(panel === "projects" ? null : "projects")}
              >
                Projects
                <Chevron open={panel === "projects"} />
                <span className={underline} />
              </button>
            </div>
          )}

          {hasLocations && (
            <div onMouseEnter={() => setPanel("locations")} className="relative">
              <button
                type="button"
                className={trigger}
                aria-expanded={panel === "locations"}
                aria-controls={`${panelId}-locations`}
                onClick={() => setPanel(panel === "locations" ? null : "locations")}
              >
                Locations
                <Chevron open={panel === "locations"} />
                <span className={underline} />
              </button>
            </div>
          )}

          {facets.hasJournal && (
            <Link href="/journal" className={trigger} onMouseEnter={() => setPanel(null)}>
              Journal
              <span className={underline} />
            </Link>
          )}

          <Link href="/about" className={trigger} onMouseEnter={() => setPanel(null)}>
            About
            <span className={underline} />
          </Link>

          {/* A plain link, not a session-aware control: the header renders on
              every statically prerendered page, and giving it auth state would
              pull a client session into the whole public tree. */}
          <Link href="/account" className={trigger} onMouseEnter={() => setPanel(null)}>
            Account
            <span className={underline} />
          </Link>

          <Link
            href="/contact"
            className="rounded-full bg-jamin-red px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep hover:shadow-raise"
            onMouseEnter={() => setPanel(null)}
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

      {/* ---- mega panels (desktop) ---- */}
      {panel === "projects" && (
        <MegaPanel id={`${panelId}-projects`}>
          <PanelIntro
            title="By stage"
            body="Every Jamin development, grouped by where it is in its life — from land secured to keys handed over."
            href="/projects"
            cta="All projects"
          />
          <ul className="grid flex-1 gap-2 sm:grid-cols-2">
            {facets.phases.map((f) => (
              <li key={f.key}>
                <Link href={f.href} className="group block rounded-xl px-4 py-3 transition-all duration-300 hover:bg-canvas-alt hover:translate-x-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-base font-medium text-ink group-hover:text-jamin-red-deep">
                      {f.label}
                    </span>
                    <span className="text-tiny text-ink-muted">{f.count}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </MegaPanel>
      )}

      {panel === "locations" && (
        <MegaPanel id={`${panelId}-locations`}>
          <PanelIntro
            title="Where we build"
            body="Jamin develops across Tamil Nadu. These are the districts with land on the books today."
            href="/properties"
            cta="All properties"
          />
          <ul className="grid flex-1 gap-2 sm:grid-cols-2">
            {facets.districts.map((f) => (
              <li key={f.key}>
                <Link href={f.href} className="group block rounded-xl px-4 py-3 transition-all duration-300 hover:bg-canvas-alt hover:translate-x-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="text-base font-medium text-ink group-hover:text-jamin-red-deep">
                      {f.label}
                    </span>
                    <span className="text-tiny text-ink-muted">{f.count}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </MegaPanel>
      )}

      {/* ---- mobile ---- */}
      {open && (
        <nav
          className="max-h-[calc(100dvh-72px)] overflow-y-auto border-t border-line bg-canvas px-5 pb-8 pt-2 lg:hidden"
          aria-label="Primary mobile"
        >
          <MobileLink href="/properties">Properties</MobileLink>
          <MobileLink href="/projects">Projects</MobileLink>
          {facets.phases.map((f) => (
            <MobileLink key={f.key} href={f.href} sub>
              {f.label} <span className="text-ink-faint">({f.count})</span>
            </MobileLink>
          ))}
          {facets.districts.length > 0 && (
            <>
              <div className="pt-phi3 text-micro font-semibold uppercase tracking-brand text-jamin-gold-ink">
                Locations
              </div>
              {facets.districts.map((f) => (
                <MobileLink key={f.key} href={f.href} sub>
                  {f.label} <span className="text-ink-faint">({f.count})</span>
                </MobileLink>
              ))}
            </>
          )}
          {facets.hasJournal && <MobileLink href="/journal">Jamin Journal</MobileLink>}
          <MobileLink href="/about">About</MobileLink>
          <MobileLink href="/account">Account</MobileLink>
          <Link
            href="/contact"
            className="mt-6 block rounded-full bg-jamin-red px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white"
          >
            Book a Site Visit
          </Link>
        </nav>
      )}
    </header>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      className={`h-2.5 w-2.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      aria-hidden="true"
    >
      <path d="M2 4.5 6 8.5 10 4.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function MegaPanel({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    /* No onMouseLeave here: the header owns the hover region now, so leaving
       the panel downward closes it and moving between trigger and panel does
       not. Keeping a second handler here would reintroduce the flicker. */
    <div id={id} className="hidden border-t border-line/70 glass lg:block">
      <div className="mx-auto flex max-w-[1280px] gap-phi5 px-10 py-phi5">{children}</div>
    </div>
  );
}

function PanelIntro({
  title,
  body,
  href,
  cta,
}: {
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <div className="w-72 shrink-0 border-r border-line pr-phi4">
      <h3 className="text-xl text-ink">{title}</h3>
      <p className="mt-phi2 text-base leading-relaxed text-ink-muted">{body}</p>
      <Link
        href={href}
        className="mt-phi3 inline-flex items-center gap-2 text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep"
      >
        {cta}
        <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}

function MobileLink({
  href,
  children,
  sub,
}: {
  href: string;
  children: React.ReactNode;
  sub?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        sub
          ? "block border-b border-line py-3 pl-4 text-base text-ink-muted"
          : "block border-b border-line py-4 text-lg text-ink-soft"
      }
    >
      {children}
    </Link>
  );
}
