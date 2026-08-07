"use client";

import { useEffect, useState } from "react";
import { AccountShell } from "./AccountShell";
import { EmptyState, ButtonLink, Skeleton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { fetchReferrals, fetchTree, isPartner, type ReferralRow, type TreeLevel } from "@/lib/partner";

/**
 * The downline, level by level, plus the people directly referred.
 *
 * ⚠️ No commission is inferred from a headcount. Levels are endless by design
 * and the engine decides what any of it is worth; showing a "projected
 * earnings" figure derived from member counts would be inventing money.
 */
export function PartnerNetwork() {
  const { profile } = useAuth();
  const [levels, setLevels] = useState<TreeLevel[] | null>(null);
  const [direct, setDirect] = useState<ReferralRow[] | null>(null);

  const partner = isPartner(profile);

  useEffect(() => {
    if (!partner) return;
    let alive = true;
    Promise.all([fetchTree(), fetchReferrals()]).then(([t, r]) => {
      if (!alive) return;
      setLevels(t);
      setDirect(r);
    });
    return () => {
      alive = false;
    };
  }, [partner]);

  if (!partner) {
    return (
      <AccountShell title="Network">
        <EmptyState
          title="Partners only"
          body="Your network appears once you have joined as a Jamin partner."
          action={<ButtonLink href="/account/partner" variant="secondary">Back to partner</ButtonLink>}
        />
      </AccountShell>
    );
  }

  const total = (levels ?? []).reduce((n, l) => n + l.users, 0);
  const max = Math.max(1, ...(levels ?? []).map((l) => l.users));

  return (
    <AccountShell title="Network">
      {levels === null ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : total === 0 ? (
        <EmptyState
          title="Your network is empty"
          body="Everyone who signs up through your invite link joins your first level, and everyone they bring joins the level below. Share your link to start it."
          action={<ButtonLink href="/account/partner/card">Get your invite link</ButtonLink>}
        />
      ) : (
        <>
          <p className="text-base text-ink-muted">
            {total} member{total === 1 ? "" : "s"} across {levels.length} level
            {levels.length === 1 ? "" : "s"}.
          </p>
          <ul className="mt-phi3 space-y-2">
            {levels.map((l) => (
              <li key={l.level} className="flex items-center gap-phi3">
                <span className="w-16 shrink-0 text-tiny uppercase tracking-[0.12em] text-ink-faint">
                  Level {l.level}
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-canvas-sunken">
                  <span
                    className="block h-2 rounded-full bg-jamin-gold"
                    style={{ width: `${Math.round((l.users / max) * 100)}%` }}
                  />
                </span>
                <span className="w-10 shrink-0 text-right text-base text-ink tabular-nums">
                  {l.users}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {direct && direct.length > 0 && (
        <section className="mt-phi5">
          <h2 className="text-xl text-ink">People you referred directly</h2>
          <ul className="mt-phi3 divide-y divide-line border-y border-line">
            {direct.map((r, i) => (
              <li key={i} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <div className="text-base text-ink">{r.referred_name || "Jamin member"}</div>
                  {r.referred_code && (
                    <div className="text-tiny text-ink-faint">{r.referred_code}</div>
                  )}
                </div>
                <div className="text-tiny text-ink-faint">
                  joined{" "}
                  {new Date(r.joined_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AccountShell>
  );
}
