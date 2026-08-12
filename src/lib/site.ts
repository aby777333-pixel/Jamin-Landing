import { supabase } from "./supabase";
import { getProperties, isSellable, type Property } from "./properties";

/**
 * Site-wide data: the help desk and the navigation facets.
 *
 * Both are derived from live rows rather than written into the code, for two
 * reasons the brief is explicit about. §75: the website and the app must never
 * contradict each other on a phone number, so the desk is read from the very
 * record the admin console edits. §11: never show a filter the dataset does not
 * support — so the menu is built from the phases and districts that actually
 * have properties in them, and a phase with nothing in it simply does not
 * appear.
 */

export type DeskContact = {
  label: string | null;
  mobile: string | null;
  whatsapp: string | null;
  email: string | null;
};

const FALLBACK_EMAIL = "info@jaminproperties.com";

/** The help desk the app's Support screen also reads (`platform_contacts`). */
export async function getDeskContact(): Promise<DeskContact> {
  const { data } = await supabase
    .from("platform_contacts")
    .select("label, mobile, whatsapp, email")
    .eq("id", "jamin_desk")
    .maybeSingle();
  const d = (data ?? {}) as Partial<DeskContact>;
  return {
    label: d.label ?? "Jamin Properties Help Desk",
    mobile: d.mobile ?? null,
    whatsapp: d.whatsapp ?? d.mobile ?? null,
    email: d.email ?? FALLBACK_EMAIL,
  };
}

/** `tel:` / `wa.me` want digits only; the stored value carries a leading +. */
export function telHref(v: string | null | undefined) {
  const d = (v ?? "").replace(/[^\d]/g, "");
  return d ? `tel:+${d}` : null;
}
export function waHref(v: string | null | undefined, text?: string) {
  const d = (v ?? "").replace(/[^\d]/g, "");
  if (!d) return null;
  return `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/* ---------- navigation facets ---------- */

export const PHASE_ORDER = ["ongoing", "current", "future", "completed"] as const;
export type Phase = (typeof PHASE_ORDER)[number];

/** Buyer-facing wording. `current` reads as "Upcoming" in the app's own tiles;
 *  the website must say the same word or the two products disagree. */
export const PHASE_META: Record<Phase, { label: string; blurb: string }> = {
  ongoing: {
    label: "Ongoing",
    blurb: "Under development and selling now — plots are being handed over as work completes.",
  },
  current: {
    label: "Upcoming",
    blurb: "Approved and about to open. The earliest point at which a plot can be reserved.",
  },
  future: {
    label: "Future",
    blurb: "Land secured and planning under way. Registered interest is served first.",
  },
  completed: {
    label: "Completed",
    blurb: "Delivered and handed over. Listed as track record, not as inventory.",
  },
};

export type Facet = { key: string; label: string; count: number; href: string };
export type NavFacets = {
  phases: Facet[];
  districts: Facet[];
  totals: { developments: number; selling: number; plotsAvailable: number };
  /** Jamin Journal is offered only once something is published in it — an
   *  empty section in the menu is the dead end the owner's rule forbids. */
  hasJournal: boolean;
};

/** One query, reused by the header, the footer and the projects index. */
export async function getNavFacets(): Promise<NavFacets> {
  let all: Property[] = [];
  try {
    all = await getProperties();
  } catch {
    // The shell must still render if Supabase is unreachable — a menu that
    // throws would take the whole site down with it.
    return {
      phases: [],
      districts: [],
      totals: { developments: 0, selling: 0, plotsAvailable: 0 },
      hasJournal: false,
    };
  }

  // RLS already limits this to published articles, so a non-zero count means
  // there is genuinely something to read.
  let hasJournal = false;
  try {
    const { count } = await supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true });
    hasJournal = (count ?? 0) > 0;
  } catch {
    hasJournal = false;
  }

  const phases: Facet[] = PHASE_ORDER.map((k) => ({
    key: k,
    label: PHASE_META[k].label,
    count: all.filter((p) => p.project_phase === k).length,
    href: `/projects/${k}`,
  })).filter((f) => f.count > 0);

  const byDistrict = new Map<string, number>();
  for (const p of all) {
    const d = (p.district ?? p.city ?? "").trim();
    if (d) byDistrict.set(d, (byDistrict.get(d) ?? 0) + 1);
  }
  const districts: Facet[] = [...byDistrict.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([d, count]) => ({
      key: d,
      label: d,
      count,
      /* ⚠️ Points at the district PAGE, not the filter. `/properties?district=`
         still resolves and is not redirected — those links are in the wild —
         but the menu leads to a route that owns its own hero and metadata. See
         the note on `districtSlug` below. */
      href: `/locations/${districtSlug(d)}`,
    }));

  const selling = all.filter(isSellable);
  return {
    phases,
    districts,
    hasJournal,
    totals: {
      developments: all.length,
      selling: selling.length,
      plotsAvailable: selling.reduce((n, p) => n + (p.plots_available ?? 0), 0),
    },
  };
}

/* ── DISTRICTS AS PAGES ─────────────────────────────────────────────────────
 *
 * The Locations menu used to point at `/properties?district=Erode`, where the
 * district is client-side URL state. That works as a filter but it cannot carry
 * a district's own hero: the page is statically prerendered, so the server has
 * no idea which district is being asked for and any per-district image would
 * have to be swapped after hydration — a wrong photograph for one paint on
 * every shared link.
 *
 * So each district is a real, statically generated route. The filter still
 * works — `/properties?district=…` is untouched and old links keep resolving —
 * but the menu now leads to a page that owns its own picture and metadata.
 *
 * ⚠️ The slug is derived, not stored. `district` is free text typed in the
 * admin console, so anything that assumes a fixed set breaks the first time
 * somebody adds one. `districtSlug` and `districtFromSlug` are inverses over
 * whatever the database happens to hold.
 */
export function districtSlug(district: string): string {
  return district
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Resolves a slug back to the district string as the DATABASE spells it —
 *  which is the only spelling that matches a property row. */
export function districtFromSlug(slug: string, districts: string[]): string | null {
  return districts.find((d) => districtSlug(d) === slug) ?? null;
}

/** Every district that actually has a property, as written in the records. */
export function districtNames(items: { district?: string | null; city?: string | null }[]): string[] {
  const seen = new Set<string>();
  for (const p of items) {
    const d = (p.district ?? p.city ?? "").trim();
    if (d) seen.add(d);
  }
  return [...seen].sort((a, b) => a.localeCompare(b));
}
