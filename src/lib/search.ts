import { approvalBadges, locationLine, phaseLabel, typeLabel, type Property } from "./properties";

/**
 * Search over the real catalogue (§11, §12).
 *
 * Everything Jamin sells today is a DTCP-approved residential plot in Tamil
 * Nadu, so the useful axes are place, stage and approval — not the twenty
 * facets a national portal offers. §11 is explicit that a filter the dataset
 * cannot support must not appear, and the same restraint applies here: this
 * matches what the rows actually contain rather than pretending to understand
 * a sentence.
 *
 * It runs on the client over a list the page has already rendered, which for a
 * catalogue this size is instant and, more importantly, keeps the listing page
 * statically prerendered.
 */

export type Suggestion = { label: string; kind: string; count: number };

const norm = (s: unknown) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/** Everything about one property that a person might reasonably type. */
export function haystack(p: Property): string {
  const parts: unknown[] = [
    p.title,
    p.project_name,
    p.city,
    p.district,
    p.state,
    p.locality,
    p.location_text,
    typeLabel(p),
    phaseLabel(p),
    p.status === "sold" ? "sold out" : p.status,
    p.rera_number,
    ...(p.amenities ?? []),
    ...approvalBadges(p),
  ];
  return norm(parts.filter(Boolean).join(" "));
}

/**
 * All terms must appear somewhere — typing "erode plots" should narrow, not
 * widen. Numbers are matched as substrings so "2000" finds a 2,000 sq ft plot
 * without the comma getting in the way.
 */
export function matches(p: Property, query: string): boolean {
  const q = norm(query);
  if (!q) return true;
  const hay = haystack(p);
  return q.split(" ").every((term) => hay.includes(term));
}

/** Why a row matched, so a result never looks arbitrary. */
export function matchReason(p: Property, query: string): string | null {
  const q = norm(query);
  if (!q) return null;
  const fields: [string, unknown][] = [
    ["District", p.district],
    ["City", p.city],
    ["Locality", p.locality],
    ["Stage", phaseLabel(p)],
    ["Approval", approvalBadges(p).join(" ")],
    ["Amenity", (p.amenities ?? []).join(" ")],
  ];
  for (const [label, value] of fields) {
    const v = norm(value);
    if (v && q.split(" ").some((t) => v.includes(t))) return label;
  }
  return null;
}

/**
 * Suggestions built from the catalogue itself, so every one of them leads
 * somewhere real. A suggestion that returns nothing is worse than no
 * suggestion at all.
 */
export function suggestions(all: Property[], query: string, limit = 6): Suggestion[] {
  const q = norm(query);
  const buckets: { kind: string; values: (p: Property) => string[] }[] = [
    { kind: "District", values: (p) => [p.district ?? ""] },
    { kind: "Town", values: (p) => [p.city ?? "", p.locality ?? ""] },
    { kind: "Project", values: (p) => [p.project_name ?? p.title] },
    { kind: "Stage", values: (p) => [phaseLabel(p) ?? ""] },
    { kind: "Approval", values: (p) => approvalBadges(p) },
  ];

  const seen = new Map<string, Suggestion>();
  for (const b of buckets) {
    for (const p of all) {
      for (const raw of b.values(p)) {
        const label = String(raw ?? "").trim();
        if (!label) continue;
        if (q && !norm(label).includes(q)) continue;
        const key = `${b.kind}:${label.toLowerCase()}`;
        const hit = seen.get(key);
        if (hit) hit.count += 1;
        else seen.set(key, { label, kind: b.kind, count: 1 });
      }
    }
  }

  return [...seen.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, limit);
}

/** Compact one-line summary used by the list view and the compare table. */
export function summaryLine(p: Property): string {
  return [
    typeLabel(p),
    locationLine(p),
    p.plots_available ? `${p.plots_available} plots available` : null,
  ]
    .filter(Boolean)
    .join(" · ");
}
