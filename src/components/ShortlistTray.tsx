"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { getServerShortlist, getShortlist, subscribeShortlist, toggleShortlist } from "@/lib/local-shortlist";

/**
 * The floating shortlist tray (do-all round #2) — a quiet chip bottom-LEFT
 * (Jamindar owns bottom-right) that appears once something is kept. Opens to
 * the saved list with links, removals, and a straight line into /compare
 * carrying the ids.
 *
 * ⚠️ Titles are fetched ON OPEN, once, id+title+slug only, through the same
 * anon client every public read uses — the tray must not tax every page for
 * a feature most visitors haven't touched. A fetch failure degrades to
 * showing the count and the compare link, never an error state.
 *
 * ⚠️ `bottom-24 lg:bottom-6`: on phones the property pages carry the
 * MobileDeskDock across the foot, and the tray must sit above it, not on it.
 */
type Row = { id: string; title: string; slug: string | null };

export function ShortlistTray() {
  const list = useSyncExternalStore(subscribeShortlist, getShortlist, getServerShortlist);
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<Row[] | null>(null);

  if (list.length === 0) return null;

  async function openTray() {
    setOpen((v) => !v);
    if (rows) return;
    const { data } = await supabase.from("properties").select("id,title,slug");
    if (data) setRows(data as Row[]);
  }

  const named = rows ? list.map((id) => rows.find((r) => r.id === id)).filter(Boolean) as Row[] : null;

  return (
    <div className="fixed bottom-24 left-4 z-40 lg:bottom-6 lg:left-6 print:hidden">
      {open && (
        /* ⚠️ `rj-glass rj-crystal` REPLACES `bg-canvas` (do-all round, menu
           item 10). This panel floats over whatever the reader was looking
           at, which is the one place the brief licenses glass. `rj-glass`
           carries the audited 0.9 ivory tint, so the ink inside it keeps a
           knowable backdrop however dark the page behind is; `rj-crystal`
           puts the light on the top edge. The `bg-` utility has to GO, not
           merely be overridden — leaving it would make the panel depend on
           which stylesheet happens to win. */
        <div className="rj-glass rj-crystal mb-2 w-72 max-w-[calc(100vw-2rem)] rounded-card border border-line p-3 shadow-raise">
          <p className="px-1 pb-1 text-micro font-semibold uppercase tracking-brand text-ink-faint">
            Your shortlist
          </p>
          {named ? (
            <ul className="max-h-64 overflow-y-auto">
              {named.map((r) => (
                <li key={r.id} className="flex items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-canvas-alt">
                  <Link
                    href={`/property/${r.slug ?? r.id}`}
                    className="min-w-0 flex-1 truncate text-base text-ink hover:text-jamin-red-deep"
                    onClick={() => setOpen(false)}
                  >
                    {r.title}
                  </Link>
                  <button
                    type="button"
                    aria-label={`Remove ${r.title} from your shortlist`}
                    onClick={() => toggleShortlist(r.id)}
                    className="shrink-0 text-tiny text-ink-faint hover:text-jamin-red-deep"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-1 py-1.5 text-tiny text-ink-muted">
              {list.length} saved development{list.length === 1 ? "" : "s"}
            </p>
          )}
          {list.length >= 2 && (
            <Link
              href={`/compare?ids=${list.slice(0, 3).join(",")}`}
              onClick={() => setOpen(false)}
              className="mt-2 flex justify-center rounded-full bg-jamin-red px-4 py-2 text-tiny font-semibold uppercase tracking-[0.12em] text-white hover:bg-jamin-red-deep"
            >
              Compare {Math.min(list.length, 3)}
            </Link>
          )}
        </div>
      )}
      <button
        type="button"
        aria-expanded={open}
        onClick={openTray}
        /* ⚠️ THE HEART IS VERMILION, THE WORD IS NOT. `text-jamin-red-deep`
           stays on the button because it carries the label "Shortlist" and
           vermilion fails AA as small text on this ground (3.64:1); the mark
           beside it takes the reader's colour explicitly. Same split as
           ShortlistHeart, for the same measured reason. */
        className="inline-flex items-center gap-2 rounded-full border border-jamin-red-deep/40 bg-canvas/95 px-4 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep shadow-lift backdrop-blur transition-all hover:-translate-y-0.5"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-vermilion" aria-hidden="true" fill="currentColor">
          <path d="M12 20.3 4.9 13a4.6 4.6 0 0 1 0-6.5 4.4 4.4 0 0 1 6.4 0l.7.8.7-.8a4.4 4.4 0 0 1 6.4 0 4.6 4.6 0 0 1 0 6.5Z" />
        </svg>
        Shortlist
        <span className="ledger rounded-full bg-jamin-red px-1.5 text-micro text-white">
          {list.length}
        </span>
      </button>
    </div>
  );
}
