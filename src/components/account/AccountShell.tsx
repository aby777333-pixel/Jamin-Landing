"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Container, SectionLabel, Skeleton } from "@/components/ui";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/account", label: "Overview" },
  { href: "/account/shortlist", label: "Shortlist" },
  { href: "/account/visits", label: "Site visits" },
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
        <nav aria-label="Account" className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {NAV.map((n) => {
            const on = pathname === n.href;
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={on ? "page" : undefined}
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
