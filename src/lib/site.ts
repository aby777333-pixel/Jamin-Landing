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
};

/** One query, reused by the header, the footer and the projects index. */
export async function getNavFacets(): Promise<NavFacets> {
  let all: Property[] = [];
  try {
    all = await getProperties();
  } catch {
    // The shell must still render if Supabase is unreachable — a menu that
    // throws would take the whole site down with it.
    return { phases: [], districts: [], totals: { developments: 0, selling: 0, plotsAvailable: 0 } };
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
      href: `/properties?district=${encodeURIComponent(d)}`,
    }));

  const selling = all.filter(isSellable);
  return {
    phases,
    districts,
    totals: {
      developments: all.length,
      selling: selling.length,
      plotsAvailable: selling.reduce((n, p) => n + (p.plots_available ?? 0), 0),
    },
  };
}
