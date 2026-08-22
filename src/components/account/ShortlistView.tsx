"use client";

import { useEffect, useState } from "react";
import { AccountShell } from "./AccountShell";
import { PropertyCard } from "@/components/PropertyCard";
import { EmptyState, ButtonLink, CardSkeletonGrid } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { fetchShortlistIds, removeFromShortlist } from "@/lib/shortlist";
import type { Property } from "@/lib/properties";

export function ShortlistView({ all }: { all: Property[] }) {
  const { session } = useAuth();
  const uid = session?.user?.id;
  const [ids, setIds] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    fetchShortlistIds(uid)
      .then((r) => alive && setIds(r))
      .catch((e) => alive && setError(e.message));
    return () => {
      alive = false;
    };
  }, [uid]);

  async function remove(id: string) {
    if (!uid) return;
    const before = ids ?? [];
    setIds(before.filter((x) => x !== id)); // optimistic
    try {
      await removeFromShortlist(uid, id);
    } catch (e) {
      setIds(before); // put it back rather than pretend
      setError(e instanceof Error ? e.message : "Could not remove that.");
    }
  }

  const saved = ids ? all.filter((p) => ids.includes(p.id)) : [];
  // A property can be saved and then archived by an admin; say so rather than
  // silently dropping it from the count.
  const missing = ids ? ids.length - saved.length : 0;

  return (
    <AccountShell title="Shortlist">
      {error && (
        <p role="alert" className="mb-phi3 rounded-card border border-jamin-red bg-jamin-red-soft p-phi2 text-base text-jamin-red-deep">
          {error}
        </p>
      )}

      {ids === null ? (
        <CardSkeletonGrid count={2} />
      ) : saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          body="Open any development and press Save. Your shortlist is shared with the Jamin Bazaar app, so it travels with you."
          action={<ButtonLink href="/properties">Browse properties</ButtonLink>}
        />
      ) : (
        <>
          <p className="mb-phi3 text-base text-ink-muted">
            {saved.length} saved
            {missing > 0 ? ` · ${missing} no longer listed` : ""}
          </p>
          <div className="grid gap-phi3">
            {saved.map((p) => (
              <div key={p.id} className="relative">
                <PropertyCard p={p} wide />
                <button
                  onClick={() => remove(p.id)}
                  className="absolute right-3 top-3 z-10 rounded-full border border-canvas/60 bg-canvas/90 px-3 py-1.5 text-tiny font-medium text-ink-soft backdrop-blur transition-colors hover:border-jamin-red hover:text-jamin-red-deep"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </AccountShell>
  );
}
