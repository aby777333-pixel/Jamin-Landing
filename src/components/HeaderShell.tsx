"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQueryString } from "@/lib/url-state";
import { useEffect, useId, useRef, useState } from "react";
import type { NavFacets } from "@/lib/site";
import { navStone } from "@/lib/stones";

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
  /** §6.1's second threshold: the champagne hairline thickens once the reader
   *  is properly into the page. Same passive listener, one more boolean. */
  const [deep, setDeep] = useState(false);
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<null | "projects" | "locations">(null);
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const panelId = useId();

  useEffect(() => {
    const onScroll = () => {
      setSolid(window.scrollY > 24);
      setDeep(window.scrollY > 80);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A menu that survives navigation feels broken. Adjusting during render on a
  // changed value is React's own answer here — an effect would run a render
  // later, so the old menu would be visible on the new page for a frame.
  /**
   * ⚠️ Keyed on pathname AND query, not pathname alone.
   *
   * Every Locations entry points at `/properties?district=…`, so picking a
   * second district from an already-filtered page changes only the query — the
   * pathname is identical, this comparison never fired, and the menu stayed
   * open over the page it had just navigated. The first pick appeared to work
   * only because it arrived from a different route.
   *
   * `useQueryString` rather than `useSearchParams` for the reason recorded in
   * lib/url-state: reading search params here would push the header out of the
   * static prerender and hand a crawler a Suspense fallback instead of the nav.
   */
  /** Which top-level section the reader is in. Prefix-matched, so
   *  /property/x lights PROPERTIES and /journal/y lights JOURNAL — the article
   *  is still the Journal, and an active state that vanishes one level down is
   *  worse than none. */
  const section = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  const onProperties = section("/properties") || pathname.startsWith("/property");

  const search = useQueryString();
  const location = pathname + search;
  const [lastLocation, setLastLocation] = useState(location);
  if (location !== lastLocation) {
    setLastLocation(location);
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

  /* §6.1: 0.11em rather than the 0.14em this carried before — the gem dot now
     opens each tab, and the wider tracking pushed the label far enough from its
     own dot that the two stopped reading as one object. */
  const trigger =
    "group relative inline-flex items-center gap-2 text-tiny font-medium uppercase tracking-[0.11em] text-ink-soft transition-colors hover:text-ink";

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
      /* The border is gone in favour of `.rj-hairline`, a champagne ::after
         that thickens past 80px. Drawn rather than bordered because a
         border-width change would shift the document half a pixel on every
         crossing of the threshold. */
      className={`sticky top-0 z-40 transition-all duration-500 ${
        solid || panel ? `glass rj-hairline ${deep ? "is-deep" : ""}` : "bg-transparent"
      }`}
      style={{ transitionTimingFunction: "var(--ease-silk)" }}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 lg:px-10">
        <Link href="/" className="rj-lockup flex items-center" aria-label="Jamin Bazaar — home">
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
          {/* The wordmark has always linked home and carries an aria-label
              saying so, but a tester on the sign-in page could not find a way
              back — a convention only helps the people who already know it. */}
          <Link
            href="/"
            className={trigger}
            style={stoneVar("/")}
            aria-current={section("/") ? "page" : undefined}
          >
            <Jewels href="/" label="Home" active={section("/")} />
          </Link>

          <Link
            href="/properties"
            className={trigger}
            style={stoneVar("/properties")}
            aria-current={onProperties ? "page" : undefined}
          >
            <Jewels href="/properties" label="Properties" active={onProperties} />
          </Link>

          {hasProjects && (
            <div onMouseEnter={() => setPanel("projects")} className="relative">
              <button
                type="button"
                className={trigger}
                style={stoneVar("/projects")}
                aria-expanded={panel === "projects"}
                aria-controls={`${panelId}-projects`}
                onClick={() => setPanel(panel === "projects" ? null : "projects")}
              >
                <Jewels
                  href="/projects"
                  label="Projects"
                  active={section("/projects")}
                >
                  <Chevron open={panel === "projects"} />
                </Jewels>
              </button>
            </div>
          )}

          {hasLocations && (
            <div onMouseEnter={() => setPanel("locations")} className="relative">
              <button
                type="button"
                className={trigger}
                style={stoneVar("/locations")}
                aria-expanded={panel === "locations"}
                aria-controls={`${panelId}-locations`}
                onClick={() => setPanel(panel === "locations" ? null : "locations")}
              >
                {/* ⚠️ Locations lights on `?district=`, not on a pathname. Every
                    entry points at /properties with a query, so this tab was
                    previously wired to `/projects` — which lit the wrong tab
                    whenever a reader opened a project stage. */}
                <Jewels
                  href="/locations"
                  label="Locations"
                  active={onProperties && search.includes("district=")}
                >
                  <Chevron open={panel === "locations"} />
                </Jewels>
              </button>
            </div>
          )}

          {facets.hasJournal && (
            <Link
              href="/journal"
              className={trigger}
              style={stoneVar("/journal")}
              onMouseEnter={() => setPanel(null)}
              aria-current={section("/journal") ? "page" : undefined}
            >
              <Jewels href="/journal" label="Journal" active={section("/journal")} />
            </Link>
          )}

          {/* §6.6. ⚠️ Onyx is its stone rather than a gemstone — the Vault IS
              the dark surface, and giving it a colour would have put it in the
              same register as the district tabs it deliberately sits apart
              from. `ink` is used for the word, as everywhere. */}
          <Link
            href="/vault"
            className={trigger}
            style={stoneVar("/vault")}
            onMouseEnter={() => setPanel(null)}
            aria-current={section("/vault") ? "page" : undefined}
          >
            <Jewels href="/vault" label="Vault" active={section("/vault")} />
          </Link>

          <Link
            href="/about"
            className={trigger}
            style={stoneVar("/about")}
            onMouseEnter={() => setPanel(null)}
            aria-current={section("/about") ? "page" : undefined}
          >
            <Jewels href="/about" label="About" active={section("/about")} />
          </Link>

          {/* A plain link, not a session-aware control: the header renders on
              every statically prerendered page, and giving it auth state would
              pull a client session into the whole public tree. */}
          <Link
            href="/account"
            className={trigger}
            style={stoneVar("/account")}
            onMouseEnter={() => setPanel(null)}
            aria-current={section("/account") ? "page" : undefined}
          >
            <Jewels href="/account" label="Account" active={section("/account")} />
          </Link>

          {/* ⚠️ THE ONE FILLED CONTROL IN THE VIEW (§8). It resolves through
              --color-cta rather than naming a red, so the palette switch reaches
              it without this file knowing which red is active. */}
          <Link
            href="/contact"
            className="rounded-full bg-cta px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-cta-deep hover:shadow-raise"
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

      {/* ---- mobile ----
           §6.1's full-height onyx drawer.
           ⚠️ Flipping the ground inverts every colour inside it, and none of
           them can be left alone: `border-line` (#e7e0d4) is invisible on
           onyx, `text-ink-faint` measures 1.6:1 on it, and the section label's
           gold-ink is a dark gold on a dark ground. The replacements are
           bone / plat-500 / champagne-300, all measured on onyx-900. */}
      {open && (
        <nav
          className="min-h-[calc(100dvh-72px)] overflow-y-auto bg-onyx-900 px-5 pb-8 pt-2 lg:hidden"
          style={{ borderTop: "1px solid var(--line-onyx)" }}
          aria-label="Primary mobile"
        >
          <MobileLink href="/">Home</MobileLink>
          <MobileLink href="/properties">Properties</MobileLink>
          <MobileLink href="/projects">Projects</MobileLink>
          {facets.phases.map((f) => (
            <MobileLink key={f.key} href={f.href} sub>
              {f.label} <span className="text-plat-500">({f.count})</span>
            </MobileLink>
          ))}
          {facets.districts.length > 0 && (
            <>
              <div className="pt-phi3 text-micro font-semibold uppercase tracking-brand text-champagne-300">
                Locations
              </div>
              {facets.districts.map((f) => (
                <MobileLink key={f.key} href={f.href} sub>
                  {f.label} <span className="text-plat-500">({f.count})</span>
                </MobileLink>
              ))}
            </>
          )}
          {facets.hasJournal && <MobileLink href="/journal">Jamin Journal</MobileLink>}
          <MobileLink href="/vault">The Royal Vault</MobileLink>
          <MobileLink href="/about">About</MobileLink>
          <MobileLink href="/account">Account</MobileLink>
          <Link
            href="/contact"
            className="mt-6 block rounded-full bg-cta px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white"
          >
            Book a Site Visit
          </Link>
        </nav>
      )}
    </header>
  );
}

/** Hands the tab's stone down to `.rj-dot` and `.rj-inlay`, which both read
 *  `--rj-stone`. Set on the tab itself so one declaration serves both. */
function stoneVar(href: string): React.CSSProperties {
  return { "--rj-stone": navStone(href).stone } as React.CSSProperties;
}

/**
 * The jewellery on a tab (§6.1): the gem before the label, and the inlay under
 * it. The active tab's inlay also carries the slow metallic sweep.
 *
 * ⚠️ The label is coloured with `ink`, never with `stone`. At 12.58px three of
 * the nav stones fail AA outright — see NAV_STONE. The bright value paints the
 * dot and the inlay, neither of which is text.
 */
function Jewels({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children?: React.ReactNode;
}) {
  const { ink } = navStone(href);
  return (
    <>
      <span className={`rj-dot ${active ? "is-on" : ""}`} aria-hidden="true" />
      <span style={active ? { color: ink } : undefined}>{label}</span>
      {children}
      <span className={`rj-inlay ${active ? "is-on rj-sweep" : ""}`} aria-hidden="true" />
    </>
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
    <div id={id} className="rj-panel-in hidden border-t border-line/70 glass lg:block">
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
  /* Top-level links are gold foil, sub-links are bone — §6.1 asks for foil, and
     applying it to all forty rows would flatten the hierarchy the drawer needs.
     `.rj-foil-text` uses the seal ramp, whose darkest stop measures 12.4:1 on
     onyx; the full foil would put part of every glyph at 3.11:1. It works here
     only because the ground is dark — see the warning on the class. */
  return (
    <Link
      href={href}
      className={
        sub
          ? "flex items-center gap-2.5 py-3 pl-4 text-base text-bone-soft"
          : "flex items-center gap-2.5 py-4 text-lg"
      }
      style={{ borderBottom: "1px solid var(--line-onyx)" }}
    >
      {/* The gem dots are retained on mobile, per §6.1. */}
      <span
        className="rj-dot is-on"
        style={{ "--rj-stone": navStone(href).stone } as React.CSSProperties}
        aria-hidden="true"
      />
      <span className={sub ? undefined : "rj-foil-text"}>{children}</span>
    </Link>
  );
}
