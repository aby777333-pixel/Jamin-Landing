"use client";

import { useEffect, useState } from "react";
import { AccountShell } from "./AccountShell";
import { Badge, EmptyState, ButtonLink, Skeleton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { browserClient } from "@/lib/supabase-browser";

type Visit = {
  id: string;
  status: string;
  visit_date: string | null;
  slot: string | null;
  cancel_reason: string | null;
  created_at: string;
  property: { title: string | null } | null;
};

/**
 * Read-only, deliberately. Booking and cancelling live in the app, where the
 * whole flow — including the promoter routing a visit gets assigned through —
 * already exists and is tested. Duplicating the write path here would create a
 * second way to change a booking, and two ways to change one record is how they
 * end up disagreeing.
 */
const TONE: Record<string, "gold" | "canopy" | "red" | "neutral"> = {
  requested: "gold",
  confirmed: "canopy",
  completed: "canopy",
  cancelled: "red",
};

export function VisitsView() {
  const { session } = useAuth();
  const uid = session?.user?.id;
  const [rows, setRows] = useState<Visit[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    browserClient()
      .from("site_visits")
      .select("id, status, visit_date, slot, cancel_reason, created_at, property:properties(title)")
      .eq("buyer_id", uid)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(error.message);
        else setRows((data ?? []) as unknown as Visit[]);
      });
    return () => {
      alive = false;
    };
  }, [uid]);

  const when = (v: Visit) =>
    v.visit_date
      ? new Date(v.visit_date).toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "Date to be confirmed";

  return (
    <AccountShell title="Site visits">
      {error && (
        <p role="alert" className="mb-phi3 rounded-card border border-jamin-red bg-jamin-red-soft p-phi2 text-base text-jamin-red-deep">
          {error}
        </p>
      )}

      {rows === null ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No visits booked"
          body="Walking a plot is the part that decides it. Open a development and ask for a visit — our desk confirms the date with you."
          action={<ButtonLink href="/properties">Find a development</ButtonLink>}
        />
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {rows.map((v) => (
            <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-phi3">
              <div className="min-w-0">
                <div className="text-lg text-ink">{v.property?.title ?? "Jamin development"}</div>
                <div className="mt-1 text-base text-ink-muted">
                  {when(v)}
                  {v.slot ? ` · ${v.slot}` : ""}
                </div>
                {v.status === "cancelled" && v.cancel_reason && (
                  <div className="mt-1 text-tiny text-ink-faint">{v.cancel_reason}</div>
                )}
              </div>
              <Badge tone={TONE[v.status] ?? "neutral"}>{v.status}</Badge>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-phi4 text-tiny leading-relaxed text-ink-muted">
        A requested visit is not yet a confirmed appointment — our desk calls to agree the time.
        Book, reschedule or cancel in the{" "}
        <a
          href="https://merry-begonia-4c3cd1.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Jamin Bazaar app
        </a>
        .
      </p>
    </AccountShell>
  );
}
