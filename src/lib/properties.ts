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

/** Every column the public site is allowed to read. Listed explicitly so a new
 *  admin-only column can never leak onto the website by accident. */
const PUBLIC_COLUMNS = [
  "id", "slug", "title", "project_name", "description", "property_type", "status",
  "project_phase", "listing_type", "price", "price_unit", "area_value", "area_unit",
  "plots_total", "plots_available", "city", "district", "state", "locality",
  "location_text", "lat", "lng", "gmaps_url", "images", "videos", "drone_videos",
  "amenities", "approvals", "nearby_places", "brochure_url", "brochure_cover_url",
  "master_plan_url", "virtual_tour_url", "rera_number", "is_featured", "seo",
  "created_at", "updated_at",
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

export async function getProperty(slugOrId: string): Promise<Property | null> {
  // Try slug first; fall back to id so NULL-slug rows stay reachable.
  const bySlug = await supabase
    .from("properties")
    .select(PUBLIC_COLUMNS)
    .eq("slug", slugOrId)
    .maybeSingle();
  if (bySlug.data) return bySlug.data as unknown as Property;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  if (!isUuid) return null;

  const byId = await supabase
    .from("properties")
    .select(PUBLIC_COLUMNS)
    .eq("id", slugOrId)
    .maybeSingle();
  return (byId.data as unknown as Property) ?? null;
}

/* ---------- presentation helpers ---------- */

/** Indian-format price, or an honest "on request".
 *  ⚠️ Every plot is currently unpriced in the database. Inventing or estimating
 *  a figure for land someone may actually buy would be far worse than saying
 *  the rate is not published yet. */
export function formatPrice(p: Property): string {
  if (p.price == null || Number(p.price) <= 0) return "Price on request";
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
