"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { addToShortlist, fetchShortlistIds, removeFromShortlist } from "@/lib/shortlist";

/**
 * Save-to-shortlist on a property page.
 *
 * ⚠️ It brings its own AuthProvider. The account area has one in its layout,
 * but this button lives on a public, statically prerendered page that must not
 * carry a session provider at the root — the whole public tree stays free of
 * client auth state, and only this small island opts in.
 *
 * A signed-out visitor is never shown a broken control: they get a plain link
 * to sign in, and nothing about the page depends on the session resolving.
 */
export function SaveProperty({ propertyId }: { propertyId: string }) {
  return (
    <AuthProvider>
      <SaveInner propertyId={propertyId} />
    </AuthProvider>
  );
}

function SaveInner({ propertyId }: { propertyId: string }) {
  const { loading, session } = useAuth();
  const uid = session?.user?.id;
  const [saved, setSaved] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // No synchronous reset when signed out: the render below already returns
    // the sign-in link in that case, so `saved` is never read, and clearing it
    // here would only be a cascading render the compiler rightly objects to.
    if (!uid) return;
    let alive = true;
    fetchShortlistIds(uid)
      .then((ids) => alive && setSaved(ids.includes(propertyId)))
      .catch(() => alive && setSaved(false));
    return () => {
      alive = false;
    };
  }, [uid, propertyId]);

  const base =
    "block w-full rounded-full border px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] transition-colors";

  if (loading) {
    return <div className={`${base} border-line text-ink-faint`}>Save</div>;
  }

  if (!session) {
    return (
      <Link href="/account/sign-in" className={`${base} border-ink/15 text-ink hover:border-ink/40`}>
        Sign in to save
      </Link>
    );
  }

  async function toggle() {
    if (!uid || busy) return;
    setBusy(true);
    setError(null);
    const next = !saved;
    setSaved(next); // optimistic
    try {
      if (next) await addToShortlist(uid, propertyId);
      else await removeFromShortlist(uid, propertyId);
    } catch (e) {
      setSaved(!next); // revert rather than lie about it
      setError(e instanceof Error ? e.message : "Could not update your shortlist.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={toggle}
        disabled={busy || saved === null}
        aria-pressed={!!saved}
        className={`${base} ${
          saved
            ? "border-jamin-red bg-jamin-red-soft text-jamin-red-deep"
            : "border-ink/15 text-ink hover:border-ink/40"
        } disabled:opacity-60`}
      >
        {saved === null ? "Save" : saved ? "Saved to shortlist" : "Save this development"}
      </button>
      {error && <p className="mt-2 text-tiny text-jamin-red-deep">{error}</p>}
    </>
  );
}
