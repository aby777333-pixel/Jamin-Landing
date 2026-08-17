"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { Container, SectionLabel, Skeleton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { isPartner } from "@/lib/partner";

/**
 * 🚨 DELIBERATELY OUTSIDE THE COMPONENT — see the long note on the effect that
 * reads it. The shell is remounted by every account navigation, so a `useRef`
 * cannot carry anything across one. This can, and it still resets on a real
 * page load, which is the line we actually want drawn.
 *
 *   navigated  false until the first shell has mounted. Distinguishes "arrived
 *              here" from "picked a menu item", so a fresh load still opens on
 *              the picture the account was designed to open on.
 *   scrollY    where the reader was when they CLICKED, captured before the old
 *              page is torn down and the browser clamps the scroll.
 *   stripLeft  the horizontal menu's scroll position, restored into the new
 *              <nav> element on mount.
 */
const navState = { navigated: false, scrollY: 0, stripLeft: 0 };

/** `useLayoutEffect` warns when React renders this on the server, and the
 *  scroll must be set before paint or the jump is visible. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const BUYER_NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/shortlist", label: "Shortlist" },
  { href: "/account/visits", label: "Site visits" },
  { href: "/account/assistant", label: "Ask Jamindar" },
];

/** Offered only to partners — a menu entry that leads to "partners only" is
 *  the dead control the owner's standing rule forbids. */
const PARTNER_NAV = [
  { href: "/account/partner", label: "Partner desk" },
  { href: "/account/partner/leads", label: "Leads" },
  { href: "/account/partner/network", label: "Network" },
  { href: "/account/partner/card", label: "Digital card" },
];

/**
 * The frame every account page sits in: it owns the "still restoring the
 * session" state, the redirect for a signed-out visitor, and the sidebar.
 *
 * ⚠️ It renders a skeleton while `loading` is true rather than the signed-out
 * view. Showing "please sign in" during restoration is how a returning visitor
 * with a perfectly good session gets bounced to a login screen.
 */
export function AccountShell({ title, children }: { title: string; children: ReactNode }) {
  const { loading, session, profile, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) router.replace("/account/sign-in");
  }, [loading, session, router]);

  /**
   * 🚨 EVERY ACCOUNT SECTION OPENS AT ITS OWN TOP — AT THE TOP OF THE SECTION,
   * NOT THE TOP OF THE PAGE. THE DIFFERENCE IS THE WHOLE POINT OF THIS EFFECT.
   *
   * The nav links carry `scroll={false}` (see the note on them below) because
   * Next's own scroll-to-top was yanking the horizontal tab strip back to its
   * start on a phone. That fixed the strip and left the DOCUMENT wherever it
   * was: open Leads from a scrolled Partner desk and Leads renders at the old
   * offset. Reported 2026-08-13 with a screenshot of `/account/partner/leads`
   * showing nothing but the Sign out button and the footer — the entire section
   * scrolled past before it was ever seen. Priority: high, and rightly.
   *
   * ⚠️ SO THE SCROLL IS OURS, NOT NEXT'S. Doing it here rather than by removing
   * `scroll={false}` keeps the two concerns separate: the link handler owns the
   * strip's horizontal position, this owns the document's vertical one, and
   * neither can undo the other because they move different axes. Handing it
   * back to Next would restore the strip bug that `scroll={false}` exists to
   * prevent.
   *
   * 🚨 IT WAS `scrollTo(0)` FOR ONE DAY AND THAT WAS TOO FAR (2026-08-14).
   * The next report said the opposite of the last one: "clicking any sidebar
   * option causes the page to jump back to the top", asking to land on the
   * section "without an unwanted jump to the page top". Both reports are right,
   * and they are not actually in conflict — the first was about landing BELOW
   * the section, the second about landing ABOVE it. Page top is not section
   * top: above the grid sit the picture band (2/1, so ~600px on a desktop) and
   * the account header, and `scrollTo(0)` put all of that back on screen every
   * time a menu item was picked, pushing the sidebar and the section the reader
   * had just asked for under the fold.
   *
   * So it scrolls to the top of the CONTENT GRID, offset by the sticky header.
   * That is the position where the section starts, the sidebar is pinned at its
   * sticky offset, and the whole menu including Sign out is on screen — which
   * is also the report's second clause, and it needs no change to the sidebar
   * itself. The sidebar always fitted; it just started below the fold.
   *
   * ⚠️ `Math.min` — IT ONLY EVER SCROLLS UP. Clamping is what lets one rule
   * serve both reports. A reader at the top looking at the picture clicks
   * Shortlist and does not move (min(0, top) is 0); a reader deep inside Leads
   * clicks Network and comes UP to the section start rather than being thrown
   * past it. An unclamped scroll would drag the first reader DOWNWARD off the
   * band the account deliberately opens on, which is a third bug and nobody has
   * reported it because it has never shipped.
   *
   * ⚠️ Skips the first run. On a fresh load — or a deep link straight to
   * /account/visits — the reader has not chosen anything yet, and the owner's
   * decision of 2026-08-13 is that the account OPENS ON THE PICTURE. This must
   * only answer a menu pick.
   *
   * ⚠️ `--header-h` read from the computed style, not hard-coded: it is 72px
   * and 80px at `lg`, the same token the sticky column offsets by. Reading it
   * keeps the two in step at both breakpoints.
   *
   * ⚠️ Keyed on `pathname`, so it fires on a section change and not on a
   * re-render — a state update inside a section must never throw the reader
   * back to the top of it.
   *
   * ⚠️ `behavior: "auto"`. A smooth 500px glide on every menu pick reads as the
   * page being slow, and `prefers-reduced-motion` would have to be honoured
   * anyway; an instant jump is what a new page is expected to do.
   */
  const gridRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLElement>(null);

  /**
   * 🚨 THIS RUNS ON MOUNT, NOT ON A PATHNAME CHANGE, AND THE STATE THAT DRIVES
   * IT LIVES OUTSIDE THE COMPONENT. Both follow from one fact that the previous
   * two attempts missed: **this shell remounts on every account navigation.**
   *
   * `AccountShell` is rendered by each page's view — `AccountOverview`,
   * `ShortlistView`, `PartnerLeads` and five others each open with it — and NOT
   * by `app/account/layout.tsx`, which only supplies `AuthProvider`. So going
   * from Overview to Shortlist unmounts one shell and mounts a different one.
   * Every `useRef` resets, every DOM node is new, and a `useEffect` keyed on
   * `pathname` fires as a MOUNT effect rather than as an update.
   *
   * That single fact explains both halves of the 2026-08-14 report:
   *
   *   "the horizontal navigation resets to the first position" — the <nav> is a
   *   brand new element, and a fresh scroller starts at scrollLeft 0. The
   *   onClick handler that used to restore it was writing to the element being
   *   unmounted.
   *
   *   "the page jumps back to the hero" — the outgoing page's height vanishes
   *   before the incoming one is laid out, so the browser CLAMPS scrollY to the
   *   new maximum. Nothing scrolled the page; the page got shorter underneath
   *   the reader.
   *
   * It also silently disabled the fix shipped that morning: its mount guard was
   * a `useRef(false)`, which a remount resets, so the guard returned early
   * every single time and the scroll never ran at all.
   *
   * ⚠️ MODULE SCOPE IS LOAD-BEARING. `navState` survives a remount because it
   * belongs to the module, and resets on a real page load because a new
   * document re-evaluates it. That is exactly the distinction wanted: a fresh
   * arrival at /account/visits should open on the picture, and a menu pick in
   * an already-open session should not.
   *
   * ⚠️ The scroll target is captured on CLICK, before the old page is torn
   * down. Reading `window.scrollY` after mounting would read the browser's
   * already-clamped value and the reader's real position would be gone.
   */
  useIsoLayoutEffect(() => {
    const strip = stripRef.current;
    if (strip) strip.scrollLeft = navState.stripLeft;

    if (!navState.navigated) {
      navState.navigated = true;
      return;
    }
    const grid = gridRef.current;
    if (!grid) return;
    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
      ) || 72;
    /* The gap the sticky column already leaves itself, so the section lands
       level with the menu beside it rather than a few pixels above it. */
    const sectionTop = window.scrollY + grid.getBoundingClientRect().top - headerH - 20;
    /* ⚠️ `Math.min` against the position captured at CLICK time, so this only
       ever scrolls UP. A reader at the picture does not move; a reader deep
       inside Leads comes up to where the section starts, with the whole menu on
       screen — which is the 2026-08-13 report and the 2026-08-14 one answered
       by the same line. */
    window.scrollTo({
      top: Math.max(0, Math.min(navState.scrollY, sectionTop)),
      behavior: "auto",
    });
  }, [pathname]);

  if (loading) {
    return (
      <Container className="py-phi5">
        <div className="max-w-md space-y-3">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-4 w-full" />
        </div>
      </Container>
    );
  }

  if (!session) return null; // the effect above is already redirecting

  const name = profile?.full_name?.trim() || "there";

  return (
    <Container className="py-phi5">
      {/* 🚨 THE ACCOUNT OPENS ON A PICTURE (owner, 2026-08-13). It is a band
          rather than a full-bleed hero because everything under it is a working
          surface — a shortlist, a visit list, a lead table — and a 78vh opener
          would put the reader's own data below the fold on every section.

          ⚠️ BOTH RATIOS TRACK THE ARTWORK, so a swapped frame needs both
          re-checked. 3/2 is this picture's native ratio, so nothing is cropped
          at 375. From `lg` it is 2/1, and that number is arithmetic rather than
          taste: `object-cover` against a 1.5 source shows 1.5/2.0 = exactly 75%
          of the height, the same share the owner asked for on the property
          headers. The frame this replaced was 1.777 and sat in a 2.4:1 band for
          the same 74%; carrying 2.4 over to a 3:2 picture would have shown 62%.

          ⚠️ `object-bottom` is not a taste call either — the artwork bakes its
          own caption into the lower right, so a centre crop slices the type in
          half. Anchoring the bottom keeps it whole and spends the sky instead.
          A frame with type at the TOP needs this flipped.

          ⚠️ A NEW FILENAME ON EVERY SWAP. `next/image` keys its optimised output
          by source path, so writing over the old file lets a warm build keep
          serving the old picture from a deploy that looks correct — the trap
          recorded against hero-27 and purpose-gate. The previous
          `account-*.webp` set stays in the folder, unused.

          ⚠️ Brand imagery under the standing rule: `alt=""`, `aria-hidden`, and
          never a caption of ours — the picture already carries its own. It is a
          render of nowhere, not a Jamin site. */}
      <div className="relative mb-phi4 aspect-[3/2] w-full overflow-hidden rounded-card border border-line bg-canvas-sunken lg:aspect-[2/1]">
        <Image
          src="/section/account-home-1536.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="object-cover object-bottom"
        />
      </div>

      {/* 🚨 THE ACCOUNT HEADER LIVES IN THE SIDEBAR NOW (2026-08-17 report).
          It used to sit here, between the picture and the grid — in the
          content column, so it SCROLLED, which is the report's exact words
          ("YOUR ACCOUNT, Overview … is scrolling, that should not scroll"),
          and it pushed the sidebar's start below the fold ("the left sidebar
          starts lower on the page"). It now renders inside the sticky column
          below, so the label, the section title and the signed-in identity
          stay pinned with the navigation and the whole panel reads as one
          account context. The h1 keeps its element — every account page still
          opens with a real heading — it just moved columns. */}

      {/* The ref is the scroll target for the effect above — the top of this
          grid is where a section begins, and it is deliberately BELOW the
          picture band rather than at the page top. */}
      <div ref={gridRef} className="mt-phi4 grid gap-phi4 lg:grid-cols-[15rem_1fr]">
        {/* ⚠️ THE STICKY LIVES ON THIS WRAPPER, NOT ON THE <nav>. The nav and
            the sign-out control have to travel together — pinning only the nav
            is what left the button behind in the first place.

            ⚠️ `self-start` is load-bearing. A grid item stretches to the row by
            default, so a sticky column would be exactly as tall as the article
            beside it and have no room left to stick within — it scrolls away
            and takes the whole menu with it. This is the second time that has
            been written down here; do not remove it.

            ⚠️ `max-h` + `overflow-y-auto` rather than a bare sticky, which is
            the report's last clause: with today's eight entries the column is
            far shorter than the viewport and nothing scrolls, but a ninth or a
            short laptop screen would otherwise push the sign-out control below
            the fold with no way to reach it. The height is the viewport less
            the header and the gap it is offset by.

            ⚠️ `top` is an inline style, not a `lg:top-24` guess. `--header-h`
            is 72px and becomes 80px at `lg`, so a hard-coded 6rem is wrong at
            one of the two — the same token every other sticky aside on this
            site offsets by. */}
        {/* 🚨 `min-w-0` IS THE FIX FOR THE WHOLE-PAGE HORIZONTAL SCROLL, and it
            has to be on THIS element — the grid ITEM — not on the nav inside it.

            A grid item's default `min-width: auto` is the min-content width of
            its contents, and a horizontal scroller contributes its full track
            rather than zero. So the nav never scrolled: the column simply grew
            to fit all eight tabs, measured **848px inside a 375px viewport**,
            and every card in the content column stretched to match. Reported
            2026-08-13 as "content extends beyond the right edge… the page
            requires horizontal scrolling", with the tab strip and the cards both
            hanging off the right — one cause, both symptoms.

            ⚠️ It is worst for a PARTNER, which is why it can be missed: a buyer
            sees four tabs, a partner sees eight. Test this signed in as a
            partner, not as a buyer.

            ⚠️ The content column at the foot of this grid already had `min-w-0`
            for exactly this reason. Two items, one rule — a grid is only as
            narrow as its widest un-pinned item. */}
        <div
          className="flex min-w-0 flex-col gap-phi3 lg:sticky lg:z-10 lg:max-h-[calc(100dvh-var(--header-h)-2.5rem)] lg:self-start lg:overflow-y-auto lg:overscroll-contain"
          style={{ top: "calc(var(--header-h) + 1.25rem)" }}
        >
        {/* The account context card — the report's "move YOUR ACCOUNT,
            Overview and the signed-in user information into the left-side
            account panel". Compact on purpose: the whole panel (context +
            nav + sign out) has to fit one desktop viewport, which the
            sticky wrapper's max-h already enforces with a scroll as the
            worst case rather than the design. */}
        <div className="rounded-card border border-line bg-canvas-alt p-phi3">
          <SectionLabel>Your account</SectionLabel>
          <h1 className="mt-phi2 text-xl text-ink">{title}</h1>
          <p className="mt-1.5 text-tiny leading-snug text-ink-muted">
            Signed in as {name}
            {profile?.member_code ? ` · ${profile.member_code}` : ""}
          </p>
        </div>
        {/* `overscroll-contain` on the mobile scroller stops a horizontal flick
            from turning into a page scroll.

            ⚠️ `onScroll` RECORDS THE POSITION CONTINUOUSLY rather than only on
            a click, because the reader can flick this strip and then pick a tab
            that was already in view — in which case the click handler never
            sees the scroll that mattered. Cheap: one number, no React state, so
            it cannot cause a render.

            ⚠️ THE CARD IS THE REPORT'S "dedicated filter card". It asked for
            the navigation to be recognisable as a navigation component instead
            of blending into the page, and on a phone this strip sat directly
            under the account header with nothing marking where one ended and
            the other began. A hairline and the alt canvas are enough to say
            it; a heavier treatment would compete with the content beside it. */}
        <nav
          ref={stripRef}
          onScroll={(e) => {
            navState.stripLeft = e.currentTarget.scrollLeft;
          }}
          aria-label="Account"
          className="cd-noscroll flex gap-2 overflow-x-auto overscroll-x-contain rounded-card border border-line bg-canvas-alt p-2 lg:flex-col lg:overflow-visible"
        >
          {[...BUYER_NAV, ...(isPartner(profile) ? PARTNER_NAV : [])].map((n) => {
            const on = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                /* ⚠️ `scroll={false}`. The handler below keeps the horizontal
                   strip in place, but Next still scrolled the DOCUMENT to the
                   top on every pick — so choosing a section from halfway down
                   the page threw the reader back to the header. The strip and
                   the page are two different scrollers and both had to be
                   pinned. */
                scroll={false}
                aria-current={on ? "page" : undefined}
                /* ⚠️ THIS CAPTURES, IT NO LONGER RESTORES. The previous handler
                   read the strip's `scrollLeft` and wrote it back a frame
                   later, on the element it had just read — which is the element
                   React is about to unmount. It could never have worked once
                   the shell started remounting; the strip that needs the value
                   does not exist yet. The mount effect puts it back instead.

                   The scroll position is captured HERE for the same reason:
                   after the swap the browser has already clamped it to the new
                   document height, and the reader's real position is gone. */
                onClick={(e) => {
                  navState.scrollY = window.scrollY;
                  const strip = e.currentTarget.parentElement;
                  if (strip) navState.stripLeft = strip.scrollLeft;
                }}
                /* See-through tabs (owner 2026-08-17): the active tab is ink
                   at 85% over a light blur rather than a solid block. */
                className={`shrink-0 rounded-card px-phi3 py-2.5 text-base transition-colors ${
                  on
                    ? "bg-ink/85 text-canvas backdrop-blur-sm"
                    : "text-ink-soft hover:bg-canvas-alt/60 hover:text-ink"
                }`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        {/* The foot of the sidebar. `lg:mt-auto` pushes it to the bottom of the
            column when the column is taller than its links; on a phone the
            sidebar is a horizontal strip and this simply follows it, kept to
            its own width by `self-start` so it does not read as a full-width
            primary action directly above the content. */}
        <button
          onClick={async () => {
            await signOut();
            router.replace("/");
          }}
          className="self-start rounded-full border border-line bg-canvas px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink lg:mt-auto lg:w-full lg:border-t lg:text-center"
        >
          Sign out
        </button>
        </div>

        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
