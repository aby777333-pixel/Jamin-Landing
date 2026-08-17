import type { PropertyDetail } from "@/lib/properties";

/**
 * Everything a buyer can take away, with nobody's name on it.
 *
 * ⚠️ These are DIRECT links to the stored files, deliberately. The app's
 * `brochure` edge function personalises a brochure by appending a contact page
 * for whoever shared it — which is right inside the app, where a promoter is
 * sharing their own link, and wrong here. A visitor reading the public website
 * has not been introduced to anybody, so attaching a V-Card would put a
 * stranger's face and phone number on a document they never asked for.
 *
 * (The same function already returns the untouched original when no `ref` is
 * given, so the two behaviours agree; going straight to the file just avoids a
 * redirect and a PDF regeneration for a document that is not being branded.)
 */
export type DownloadItem = { label: string; note?: string; url: string; kind: Kind };
type Kind = "brochure" | "plan" | "doc";

/* ⚠️ COLORIZED ROWS (owner 2026-08-17 night: "colorize the tabs, do it
   everywhere") — the whole row wears its kind's stone now, not just the icon
   chip. `stone` is mixed with TRANSPARENT for the row's wash and border, so
   the same values read on the light /downloads page AND inside the property
   page's dark vault band — the ground shows through, which is what lets one
   treatment serve both. Text stays on theme tokens and flips with the scope. */
const KIND: Record<Kind, { tint: string; icon: string; stone: string }> = {
  brochure: { tint: "bg-jamin-red-soft text-jamin-red-deep", icon: "▤", stone: "var(--color-cta)" },
  plan: { tint: "bg-canopy-soft text-canopy", icon: "▦", stone: "var(--color-emerald)" },
  doc: { tint: "bg-jamin-gold-soft text-jamin-gold-ink", icon: "▥", stone: "var(--color-jamin-gold)" },
};

/**
 * What a single development offers, in the order a buyer wants it.
 *
 * ⚠️ Keyed by URL, because the same file is usually recorded twice: once as
 * `brochure_url` / `master_plan_url` and again as a row in `documents` with a
 * fuller label and a file size. Listing both showed every brochure twice.
 * The dedicated column decides what KIND it is (so the brochure keeps its own
 * colour) and the document row contributes the better label and the size.
 */
export function downloadsFor(
  p: PropertyDetail | (Partial<PropertyDetail> & { title: string }),
): DownloadItem[] {
  const byUrl = new Map<string, DownloadItem>();
  const add = (item: DownloadItem) => {
    const existing = byUrl.get(item.url);
    if (!existing) {
      byUrl.set(item.url, item);
      return;
    }
    byUrl.set(item.url, {
      ...existing,
      label: item.label !== "Document" ? item.label : existing.label,
      note: item.note ?? existing.note,
    });
  };

  if (p.brochure_url)
    add({ label: "Project brochure", note: "PDF", url: p.brochure_url, kind: "brochure" });
  if (p.master_plan_url)
    add({ label: "Sanctioned layout plan", note: "The DTCP drawing", url: p.master_plan_url, kind: "plan" });
  for (const d of p.documents ?? []) {
    if (d?.url) add({ label: d.label ?? "Document", note: d.size ?? undefined, url: d.url, kind: "doc" });
  }
  return [...byUrl.values()];
}

export function DownloadList({ items }: { items: DownloadItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((d) => {
        const k = KIND[d.kind];
        return (
          <li key={d.url} className="min-w-0">
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-card border px-phi2 py-2.5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lift"
              style={{
                transitionTimingFunction: "var(--ease-silk)",
                borderColor: `color-mix(in srgb, ${k.stone} 38%, transparent)`,
                background: `color-mix(in srgb, ${k.stone} 9%, transparent)`,
              }}
            >
              <span
                aria-hidden="true"
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-base ${k.tint}`}
              >
                {k.icon}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-base text-ink">{d.label}</span>
                {d.note && <span className="block truncate text-tiny text-ink-faint">{d.note}</span>}
              </span>
              <span
                aria-hidden="true"
                className="text-tiny text-jamin-red-deep transition-transform duration-500 group-hover:translate-y-0.5"
              >
                ↓
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
