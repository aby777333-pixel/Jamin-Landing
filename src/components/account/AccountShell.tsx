"use client";

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
      <header className="flex flex-wrap items-end justify-between gap-phi3">
        <div>
          <SectionLabel>Your account</SectionLabel>
          <h1 className="mt-phi2 text-3xl text-ink">{title}</h1>
          <p className="mt-phi2 text-base text-ink-muted">
            Signed in as {name}
            {profile?.member_code ? ` · ${profile.member_code}` : ""}
          </p>
        </div>
        <button
          onClick={async () => {
            await signOut();
            router.replace("/");
          }}
          className="rounded-full border border-line bg-canvas px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
        >
          Sign out
        </button>
      </header>

      <div className="mt-phi4 grid gap-phi4 lg:grid-cols-[13rem_1fr]">
        {/* ⚠️ `sticky` needs `self-start`. A grid item stretches to the row by
            default, so the nav was as tall as the article beside it and had no
            room left to stick within — it scrolled away and took the whole
            account menu with it.
            `overscroll-contain` on the mobile scroller stops a horizontal flick
            from turning into a page scroll. */}
        <nav
          aria-label="Account"
          className="cd-noscroll flex gap-2 overflow-x-auto overscroll-x-contain lg:sticky lg:top-24 lg:z-10 lg:flex-col lg:self-start lg:overflow-visible"
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
        <div className="min-w-0">{children}</div>
      </div>
    </Container>
  );
}
