"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Container, SectionLabel, Skeleton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { isPartner } from "@/lib/partner";

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
   * 🚨 EVERY ACCOUNT SECTION OPENS AT ITS OWN TOP, AND THIS REVERSES AN EARLIER
   * DECISION RATHER THAN ADDING TO IT.
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
   * ⚠️ Keyed on `pathname`, so it fires on a section change and not on a
   * re-render — a state update inside a section must never throw the reader
   * back to the top of it.
   *
   * ⚠️ `behavior: "auto"`. A smooth 500px glide on every menu pick reads as the
   * page being slow, and `prefers-reduced-motion` would have to be honoured
   * anyway; an instant jump is what a new page is expected to do.
   */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
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

          ⚠️ ITS OWN RATIO ON A PHONE, A BAND FROM `lg`. 16/9 is the frame's
          native ratio, so nothing is cropped at 375; from `lg` it becomes 2.4:1,
          which is `object-cover` cropping the HEIGHT. `object-bottom` decides
          which part survives, and it is not a taste call — the artwork bakes its
          own caption into the lower-left, so a centre crop slices the type in
          half. Anchoring the bottom keeps the caption whole and spends the sky
          instead. Any replacement frame with type at the top needs this flipped.

          ⚠️ Brand imagery under the standing rule: `alt=""`, `aria-hidden`, and
          never a caption of ours — the picture already carries its own. It is a
          render of nowhere, not a Jamin site. */}
      <div className="relative mb-phi4 aspect-[16/9] w-full overflow-hidden rounded-card border border-line bg-canvas-sunken lg:aspect-[2.4/1]">
        <Image
          src="/section/account-1672.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="(max-width: 1280px) 100vw, 1200px"
          className="object-cover object-bottom"
        />
      </div>

      {/* ⚠️ SIGN OUT IS NO LONGER HERE. It used to sit at the top right of this
          header, which is in the content column and scrolls — so the moment a
          reader moved down the page, the way out went with it. It now lives at
          the foot of the sidebar, which stays put. */}
      <header className="flex flex-wrap items-end justify-between gap-phi3">
        <div>
          <SectionLabel>Your account</SectionLabel>
          <h1 className="mt-phi2 text-3xl text-ink">{title}</h1>
          <p className="mt-phi2 text-base text-ink-muted">
            Signed in as {name}
            {profile?.member_code ? ` · ${profile.member_code}` : ""}
          </p>
        </div>
      </header>

      <div className="mt-phi4 grid gap-phi4 lg:grid-cols-[13rem_1fr]">
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
        {/* `overscroll-contain` on the mobile scroller stops a horizontal flick
            from turning into a page scroll. */}
        <nav
          aria-label="Account"
          className="cd-noscroll flex gap-2 overflow-x-auto overscroll-x-contain lg:flex-col lg:overflow-visible"
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
                /* ⚠️ Next scrolls the focused element into view on navigation,
                   which yanked this horizontal strip back to the start every
                   time a tab was chosen. The strip keeps its own position and
                   the page still lands at the top, which is what `scroll` on the
                   Link governs — not this. */
                onClick={(e) => {
                  const strip = e.currentTarget.parentElement;
                  if (!strip) return;
                  const left = strip.scrollLeft;
                  requestAnimationFrame(() => {
                    strip.scrollLeft = left;
                  });
                }}
                className={`shrink-0 rounded-card px-phi3 py-2.5 text-base transition-colors ${
                  on ? "bg-ink text-canvas" : "text-ink-soft hover:bg-canvas-alt hover:text-ink"
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
