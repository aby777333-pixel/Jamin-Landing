"use client";

import { useEffect, useState } from "react";
import { AccountShell } from "./AccountShell";
import { Badge, EmptyState, ButtonLink, Skeleton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { fetchLeads, isPartner, type Lead } from "@/lib/partner";

const TONE: Record<string, "gold" | "canopy" | "red" | "neutral"> = {
  new: "gold",
  contacted: "neutral",
  qualified: "canopy",
  converted: "canopy",
  lost: "red",
};

/**
 * Leads assigned to this partner. RLS does the scoping — there is no promoter
 * id in the query, so there is nothing to tamper with in the request.
 *
 * Read-only: working a lead (calling, noting, changing status) happens in the
 * app, which is also where the contact-privacy rules live.
 */
export function PartnerLeads() {
  const { profile } = useAuth();
  const [rows, setRows] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("");

  const partner = isPartner(profile);

  useEffect(() => {
    if (!partner) return;
    let alive = true;
    fetchLeads()
      .then((r) => alive && setRows(r))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [partner]);

  if (!partner) {
    return (
      <AccountShell title="Leads">
        <EmptyState
          title="Partners only"
          body="Leads are assigned to Jamin partners."
          action={<ButtonLink href="/account/partner" variant="secondary">Back to partner</ButtonLink>}
        />
      </AccountShell>
    );
  }

  const statuses = [...new Set((rows ?? []).map((r) => r.status))];
  const shown = filter ? (rows ?? []).filter((r) => r.status === filter) : rows ?? [];

  return (
    <AccountShell title="Leads">
      {error && (
        <p role="alert" className="mb-phi3 rounded-card border border-jamin-red bg-jamin-red-soft p-phi2 text-base text-jamin-red-deep">
          {error}
        </p>
      )}

      {rows === null ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No leads yet"
          body="Every enquiry from a page opened through your link or your card lands here. Sharing a project is the fastest way to get the first one."
          action={<ButtonLink href="/account/partner/card">Get your share links</ButtonLink>}
        />
      ) : (
        <>
          {statuses.length > 1 && (
            <div className="mb-phi3 flex flex-wrap gap-2">
              <button
                onClick={() => setFilter("")}
                aria-pressed={filter === ""}
                className={`rounded-full border px-4 py-2 text-tiny font-medium ${filter === "" ? "border-ink bg-ink text-canvas" : "border-line bg-canvas text-ink-soft"}`}
              >
                All {rows.length}
              </button>
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  aria-pressed={filter === s}
                  className={`rounded-full border px-4 py-2 text-tiny font-medium capitalize ${filter === s ? "border-ink bg-ink text-canvas" : "border-line bg-canvas text-ink-soft"}`}
                >
                  {s} {rows.filter((r) => r.status === s).length}
                </button>
              ))}
            </div>
          )}

          <ul className="divide-y divide-line border-y border-line">
            {shown.map((l) => (
              <li key={l.id} className="flex flex-wrap items-start justify-between gap-3 py-phi3">
                <div className="min-w-0">
                  <div className="text-lg text-ink">
                    {l.property?.title ?? (l.source === "vcard" ? "V-Card enquiry" : "Enquiry")}
                  </div>
                  {l.notes && (
                    <p className="mt-1 max-w-xl text-base leading-relaxed text-ink-muted">{l.notes}</p>
                  )}
                  <div className="mt-1 text-tiny text-ink-faint">
                    {new Date(l.created_at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {l.source ? ` · ${l.source}` : ""}
                  </div>
                </div>
                <Badge tone={TONE[l.status] ?? "neutral"}>{l.status}</Badge>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="mt-phi4 text-tiny leading-relaxed text-ink-muted">
        Call, note and update a lead in the Jamin Bazaar app — that is where the contact-privacy
        rules are enforced, so it stays the one place a lead is worked.
      </p>
    </AccountShell>
  );
}
