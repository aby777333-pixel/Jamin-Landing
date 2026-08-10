import { supabase } from "./supabase";

/**
 * Shapes verified against the live `public.properties` table rather than
 * assumed: `images` / `videos` / `amenities` are arrays of plain strings,
 * `nearby_places` is `{name, category, distance}`, `approvals` is an object of
 * flags like `{dtcp: true}`, and `seo` is `{title, description}` that the admin
 * already fills in — so the site reuses the admin's own SEO copy instead of
 * inventing its own.
 */
export type NearbyPlace = { name?: string; category?: string; distance?: string };
export type PropertySeo = { title?: string; description?: string };
export type PropertyDoc = { url?: string; label?: string; size?: string };

/**
 * One plot in `plot_layout`. Shapes verified against both live cases:
 * Edappadi carries the traced geometry (`poly`, `at`, `block`, `dim_m`,
 * `road_m`, `size_sqm`) that the app's PlotPlan draws; Shastri Nagar carries
 * only the schedule (`plot`, `facing`, `status`, `size_sqft`). Everything past
 * the first four fields is therefore optional, and the UI picks its rendering
 * from what is present rather than from the property.
 */
export type Plot = {
  plot: string;
  status?: string;
  facing?: string;
  size_sqft?: number;
  size_sqm?: number;
  block?: string;
  dim_m?: string;
  road_m?: number;
  poly?: [number, number][];
  at?: [number, number];
  clipped?: boolean;
  price?: number | null;
};

/** The DTCP drawing itself, when it has been traced (`plot_plan`). */
export type PlotPlan = {
  viewBox?: [number, number, number, number];
  boundary?: [number, number][];
  roads?: { band: [number, number, number, number]; label?: string; widthM?: number }[];
  existingRoad?: { quad: [number, number][]; label?: string; widthM?: number };
  osr?: { polygon?: [number, number][]; rect?: number[]; label?: string; areaSqm?: number };
  dimensions?: { from: [number, number]; to: [number, number]; label?: string }[];
  areaStatement?: { label: string; areaSqm?: number; percent?: number }[];
  notes?: string[];
  scale?: string;
  approvalNo?: string;
  authority?: string;
  village?: string;
  taluk?: string;
  surveyNos?: string;
  totalPlots?: number;
  metresPerUnit?: number;
};

export type Property = {
  id: string;
  slug: string | null;
  title: string;
  project_name: string | null;
  description: string | null;
  property_type: string | null;
  status: string | null;
  project_phase: string | null;
  listing_type: string | null;
  price: number | null;
  price_unit: string | null;
  area_value: number | null;
  area_unit: string | null;
  plots_total: number | null;
  plots_available: number | null;
  city: string | null;
  district: string | null;
  state: string | null;
  locality: string | null;
  location_text: string | null;
  lat: number | null;
  lng: number | null;
  gmaps_url: string | null;
  images: string[] | null;
  videos: string[] | null;
  drone_videos: string[] | null;
  amenities: string[] | null;
  approvals: Record<string, boolean> | null;
  /** Printed on the sanctioned plan, so it is public record — the whole point
   *  of publishing it is that a buyer can check it against the DTCP file. */
  survey_number: string | null;
  nearby_places: NearbyPlace[] | null;
  brochure_url: string | null;
  brochure_cover_url: string | null;
  master_plan_url: string | null;
  virtual_tour_url: string | null;
  rera_number: string | null;
  is_featured: boolean | null;
  seo: PropertySeo | null;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * The extra columns only the detail page needs.
 *
 * Kept off the list query on purpose: Edappadi's `plot_plan` and its 27 traced
 * polygons are several kilobytes, and a listing page that pulled them for every
 * row would pay that cost on the homepage, /properties, /projects and the
 * sitemap for data none of them render.
 */
export type PropertyDetail = Property & {
  plot_layout: Plot[] | null;
  plot_plan: PlotPlan | null;
  documents: PropertyDoc[] | null;
  legal: Record<string, string> | null;
  investment: Record<string, string> | null;
  utilities: string[] | null;
  street_view_url: string | null;
  google_earth_url: string | null;
  road_frontage: string | null;
  before_images: string[] | null;
};

/** Every column the public site is allowed to read. Listed explicitly so a new
 *  admin-only column can never leak onto the website by accident. */
const PUBLIC_COLUMNS = [
  "id", "slug", "title", "project_name", "description", "property_type", "status",
  "project_phase", "listing_type", "price", "price_unit", "area_value", "area_unit",
  "plots_total", "plots_available", "city", "district", "state", "locality",
  "location_text", "lat", "lng", "gmaps_url", "images", "videos", "drone_videos",
  "amenities", "approvals", "nearby_places", "brochure_url", "brochure_cover_url",
  "master_plan_url", "virtual_tour_url", "rera_number", "survey_number", "is_featured", "seo",
  "created_at", "updated_at",
].join(",");

/** Everything the list needs, plus the heavy per-plot and document payloads.
 *  Still an allow-list, so a new admin-only column cannot leak by accident. */
const DETAIL_COLUMNS = [
  PUBLIC_COLUMNS,
  "plot_layout", "plot_plan", "documents", "legal", "investment", "utilities",
  "street_view_url", "google_earth_url", "road_frontage", "before_images",
].join(",");

/** Udumalaipet has a NULL slug and Edappadi's is a leftover working title, so a
 *  property is addressable by slug OR id and we always link via this helper. */
export function propertyHref(p: Pick<Property, "id" | "slug">) {
  return `/property/${p.slug || p.id}`;
}

/** Sold-out and completed projects still belong on the site — they are the
 *  track record that makes the brand credible — but they must never be
 *  presented as buyable. */
export function isSellable(p: Property) {
  return p.status === "available" || p.status === "reserved";
}

export async function getProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from("properties")
    .select(PUBLIC_COLUMNS)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw new Error(`properties query failed: ${error.message}`);
  return (data ?? []) as unknown as Property[];
}

export async function getProperty(slugOrId: string): Promise<PropertyDetail | null> {
  // Try slug first; fall back to id so NULL-slug rows stay reachable.
  const bySlug = await supabase
    .from("properties")
    .select(DETAIL_COLUMNS)
    .eq("slug", slugOrId)
    .maybeSingle();
  if (bySlug.data) return bySlug.data as unknown as PropertyDetail;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (!isUuid) return null;

  const byId = await supabase
    .from("properties")
    .select(DETAIL_COLUMNS)
    .eq("id", slugOrId)
    .maybeSingle();
  return (byId.data as unknown as PropertyDetail) ?? null;
}

/* ---------- plots ---------- */

export type PlotStatus = "available" | "reserved" | "booked" | "sold" | "blocked";

/** Live values today are `available` and `reserved`; the rest are the states the
 *  app's own admin can set, so the key is ready for them rather than falling
 *  through to an unlabelled grey. */
/* ⚠️ `text` is measured against `fill`, not against the page. It is the colour
   of the plot number printed INSIDE the polygon and of the legend chip's own
   label, so both sit on the tint rather than on white. The strokes keep the
   brighter tones — an outline is not text and carries no ratio.

   ⚠️ The nineteen hexes that used to be here are gone; every value is now a
   token from the plot-state block in royal.css. The audited ratios that
   justified the old numbers have been re-measured against the gemstones rather
   than assumed to carry over — the figures beside each row are the new ones.

   ⚠️ `hatch` is not decoration. §6.5 forbids relying on colour alone, so every
   state that is not `available` carries a texture as well as a tint, which is
   what makes the drawing survive colour-blindness and a black-and-white print.
   `null` is meaningful: available is the state with no texture, and that is
   what makes the textured ones read as exceptions. */
export type PlotHatch = "diagonal" | "cross" | "dot" | null;

export const PLOT_STATUS: Record<
  PlotStatus,
  { label: string; fill: string; stroke: string; text: string; hatch: PlotHatch }
> = {
  available: {
    label: "Available",
    fill: "var(--plot-available-fill)",
    stroke: "var(--plot-available-line)",
    text: "var(--plot-available-ink)",
    hatch: null,
  },
  reserved: {
    label: "Reserved",
    fill: "var(--plot-reserved-fill)",
    stroke: "var(--plot-reserved-line)",
    text: "var(--plot-reserved-ink)",
    hatch: "diagonal",
  },
  booked: {
    label: "Booked",
    fill: "var(--plot-booked-fill)",
    stroke: "var(--plot-booked-line)",
    text: "var(--plot-booked-ink)",
    hatch: "cross",
  },
  sold: {
    label: "Sold",
    fill: "var(--plot-sold-fill)",
    stroke: "var(--plot-sold-line)",
    text: "var(--plot-sold-ink)",
    hatch: null,
  },
  blocked: {
    label: "Not released",
    fill: "var(--plot-blocked-fill)",
    stroke: "var(--plot-blocked-line)",
    text: "var(--plot-blocked-ink)",
    hatch: "dot",
  },
};

export function plotStatus(p: Plot): PlotStatus {
  const s = (p.status ?? "available").toLowerCase();
  return (s in PLOT_STATUS ? s : "available") as PlotStatus;
}

/** Only the statuses actually present, so the key never promises a colour the
 *  drawing does not use — the exact complaint the app's own plan key drew. */
export function plotStatusKey(plots: Plot[]): { status: PlotStatus; count: number }[] {
  const seen = new Map<PlotStatus, number>();
  for (const p of plots) {
    const s = plotStatus(p);
    seen.set(s, (seen.get(s) ?? 0) + 1);
  }
  return [...seen.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({ status, count }));
}

export function plotArea(p: Plot): string | null {
  if (p.size_sqft) return `${Math.round(p.size_sqft).toLocaleString("en-IN")} sq ft`;
  if (p.size_sqm) return `${p.size_sqm} sq m`;
  return null;
}

/* ---------- presentation helpers ---------- */

/** Indian-format price, or an honest "on request".
 *  ⚠️ Every plot is currently unpriced in the database. Inventing or estimating
 *  a figure for land someone may actually buy would be far worse than saying
 *  the rate is not published yet.
 *
 *  ⚠️ "On request" is only honest where there is something to request. A
 *  sold-out project showing it sends a reader to the desk to ask the rate of
 *  stock that does not exist, which wastes their time and the desk's. What the
 *  price slot should say about a delivered project is that it is gone. */
export function formatPrice(p: Property): string {
  if (p.price == null || Number(p.price) <= 0) {
    if (isSellable(p)) return "Price on request";
    return p.status === "sold" ? "Sold out" : "Not for sale";
  }
  const n = Number(p.price);
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2).replace(/\.00$/, "")} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2).replace(/\.00$/, "")} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatArea(p: Property): string | null {
  if (p.area_value == null) return null;
  const n = Number(p.area_value);
  const v = Number.isInteger(n) ? n.toLocaleString("en-IN") : n.toLocaleString("en-IN");
  return `${v} ${p.area_unit ?? ""}`.trim();
}

export function locationLine(p: Property): string {
  if (p.location_text) return p.location_text;
  return [p.locality, p.city, p.district, p.state].filter(Boolean).join(", ");
}

/** "current" reads as Upcoming in the app's own tiles — keep the website
 *  saying exactly what the app says so the two never contradict each other. */
const PHASE_LABEL: Record<string, string> = {
  current: "Upcoming",
  ongoing: "Ongoing",
  future: "Future",
  completed: "Completed",
};
export function phaseLabel(p: Property): string | null {
  if (!p.project_phase) return null;
  return PHASE_LABEL[p.project_phase] ?? p.project_phase;
}

export function typeLabel(p: Property): string {
  return (p.property_type ?? "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function approvalBadges(p: Property): string[] {
  if (!p.approvals) return [];
  return Object.entries(p.approvals)
    .filter(([, v]) => v)
    .map(([k]) => k.toUpperCase());
}

export function coverImage(p: Property): string | null {
  return p.images?.[0] ?? p.brochure_cover_url ?? null;
}

/**
 * A photograph deliberately NOT the card cover.
 *
 * Any page that opens with a project photograph and then lists projects as
 * cards below would otherwise show the same frame twice — once full-bleed and
 * once in the grid. Reaching past the first image avoids that without needing
 * to know what else the page renders.
 */
export function secondaryImage(p: Property): string | null {
  return p.images?.[1] ?? null;
}
