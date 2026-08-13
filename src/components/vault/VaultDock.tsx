"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * §18 — "SPEAK TO THE VAULT", on every Vault page.
 *
 * ⚠️ BOTTOM-LEFT, NOT BOTTOM-RIGHT, and that is a collision fix rather than a
 * taste one. `JamindarDock` is already `fixed bottom-5 right-5 z-40` on every
 * page of this site, and its panel unfurls to `bottom-24 right-5` on desktop.
 * A second medallion in that corner would sit under the assistant's panel and
 * on top of its button. The two corners also read correctly: the assistant
 * answers questions about the marketplace, this one reaches a person.
 *
 * §18 is explicit about what it must NOT be: no aggressive sales popup. So it
 * never auto-opens, never pulses, never intercepts scroll, and closes on Escape
 * and on an outside click like any other menu.
 *
 * ⚠️ THE OUTSIDE-CLICK HANDLER TESTS BOTH ELEMENTS. The panel is a sibling of
 * the button, not a child, so a handler that only checks the panel unmounts it
 * on mousedown and the button's own click never fires — the exact bug recorded
 * against the header and the plot sheet.
 */
export function VaultDock({
  tel,
  wa,
  email,
}: {
  tel: string | null;
  wa: string | null;
  email: string | null;
}) {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (panel.current?.contains(t) || button.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const item =
    "flex items-center justify-between gap-4 rounded-card px-phi3 py-2.5 text-base text-ink transition-colors hover:bg-canvas-sunken";
  const meta = "text-tiny uppercase tracking-[0.12em] text-ink-faint";

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Speak to The Vault"
        /* `rj-pulsar` puts two slow red rings around it — see "THE MEDALLION'S
           PULSAR" in royal.css. It is on THIS dock only; the assistant's
           medallion on every other page keeps still. */
        className="rj-medallion rj-pulsar fixed bottom-5 left-5 z-40 inline-flex items-center justify-center print:hidden"
      >
        {/* A keyhole, drawn rather than fetched — one control should not cost a
            request. It is the only literal "vault" symbol on the page, which is
            what keeps it from reading as a theme. */}
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
          <circle cx="10" cy="8" r="3.4" style={{ fill: "none", stroke: "var(--color-champagne-300)", strokeWidth: 1.4 }} />
          <path d="M8.4 11 L7.4 16 h5.2 l-1 -5" style={{ fill: "none", stroke: "var(--color-champagne-300)", strokeWidth: 1.4, strokeLinejoin: "round" }} />
        </svg>
      </button>

      {open ? (
        <div
          ref={panel}
          role="dialog"
          aria-label="Speak to The Vault"
          className="fixed bottom-24 left-5 right-5 z-40 rounded-xl border border-champagne-500/40 bg-canvas p-phi3 shadow-raise print:hidden sm:right-auto sm:w-[21rem]"
        >
          <p className="rj-eyebrow text-jamin-gold-ink">Speak to The Vault</p>
          {/* ⚠️ "An executive", not "a relationship manager" — owner's wording,
              2026-08-13. It is also the more honest of the two: a relationship
              manager is a titled role this business does not staff, and naming
              a role nobody holds is the kind of small claim the rest of this
              site refuses to make. */}
          <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
            An executive, not a call centre. Private enquiries, personal attention.
          </p>

          <div className="mt-phi3 space-y-1">
            {tel ? (
              <a href={tel} className={item}>
                <span>Call</span>
                <span className={meta}>Direct</span>
              </a>
            ) : null}
            {wa ? (
              <a href={wa} target="_blank" rel="noopener noreferrer" className={item}>
                <span>WhatsApp</span>
                <span className={meta}>Message</span>
              </a>
            ) : null}
            {email ? (
              <a href={email} className={item}>
                <span>Email</span>
                <span className={meta}>Write</span>
              </a>
            ) : null}
            <Link href="/vault/request" onClick={() => setOpen(false)} className={item}>
              <span>Request a callback</span>
              <span className={meta}>Private</span>
            </Link>
          </div>
        </div>
      ) : null}
    </>
  );
}
