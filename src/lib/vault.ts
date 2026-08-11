import { supabase } from "./supabase";

/**
 * THE VAULT — Jamin Bazaar's private property desk.
 *
 * Shapes verified against the live tables created in migration 0081. Every read
 * here is anonymous, so RLS is the enforcement and this file is only the shape:
 * `vault_requests`, `vault_offers` and `vault_matches` have NO anon policy at
 * all, which is why there is no function in this file that reads them. If one
 * ever appears, that is the bug.
 *
 * ⚠️ `vault_listings` is filtered by RLS to `published and visibility='public'`.
 * The `.eq()` calls below are belt-and-braces — they make the intent legible in
 * the query, but the database would return the same rows without them. Never
 * relax the policy on the grounds that the client filters.
 */

export type VaultCategory = {
  id: string;
  family: string;
  slug: string;
  label: string;
  note: string | null;
  image_url: string | null;
  sort: number;
};

export type VaultDestination = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  region: string | null;
  image_url: string | null;
  sort: number;
};

export type VaultListing = {
  id: string;
  slug: string | null;
  title: string;
  headline: string | null;
  summary: string | null;
  story: string | null;
  category_slug: string | null;
  destination_slug: string | null;
  locality: string | null;
  state: string | null;
  intent: string;
  discreet: boolean;
  discreet_label: string | null;
  price_display: string | null;
  price_on_request: boolean;
  land_area: string | null;
  built_area: string | null;
  bedrooms: number | null;
  amenities: string[] | null;
  images: string[] | null;
  video_url: string | null;
  brochure_url: string | null;
  map_lat: number | null;
  map_lng: number | null;
  stage: string;
  featured: boolean;
  sort: number;
};

const LISTING_COLUMNS =
  "id, slug, title, headline, summary, story, category_slug, destination_slug, locality, state, " +
  "intent, discreet, discreet_label, price_display, price_on_request, land_area, built_area, " +
  "bedrooms, amenities, images, video_url, brochure_url, map_lat, map_lng, stage, featured, sort";

/**
 * §19 — hero copy, the standing lines, the FAQ and the legal notices all live
 * in `vault_settings` so the console can change them without a deploy.
 *
 * ⚠️ EVERY CONSUMER MUST TREAT THESE AS OPTIONAL. The fallbacks below are not
 * decoration: if a row is deleted in the console the page has to degrade, not
 * throw. That is also why this returns a plain object rather than a class —
 * `settings.hero?.title ?? FALLBACK` is the only access pattern allowed.
 */
export type VaultHero = { eyebrow?: string; title?: string; lead?: string; note?: string };
export type VaultFaq = { q: string; a: string };
/** The picture rail at the foot of /vault (0083). Admin-fed, and empty until
 *  somebody puts something in it — the page reserves the space either way. */
export type VaultGalleryItem = { url: string; caption?: string };
export type VaultLegal = {
  intro?: string;
  restricted?: string;
  verification?: string;
  privacy?: string;
};
export type VaultSettings = {
  hero: VaultHero;
  promise: string[];
  faq: VaultFaq[];
  legal: VaultLegal;
  gallery: VaultGalleryItem[];
  /** Family slug → picture (0084). ⚠️ Per-FAMILY, not per-category: a family is
   *  many rows and none of them owns it, so this cannot live on
   *  `vault_categories.image_url`. Missing keys fall back to the drawn plate. */
  familyImages: Record<string, string>;
};

export const VAULT_FALLBACK: VaultSettings = {
  hero: {
    eyebrow: "Jamin Bazaar",
    title: "The Vault",
    lead: "Exceptional properties. Private opportunities. Personally handled.",
    note: "Private real estate and exceptional assets for a select clientele.",
  },
  promise: [
    "Private enquiries. Personal attention.",
    "Some properties are never publicly listed.",
    "For requirements beyond the ordinary.",
  ],
  faq: [],
  legal: {},
  gallery: [],
  familyImages: {},
};

/** A family of assets — the grouping the brief lists in §2, derived from the
 *  rows rather than declared, so adding a category in the console creates or
 *  joins a family without a code change. */
export type VaultFamily = { name: string; slug: string; items: VaultCategory[] };

/** Slug used for the placeholder plate and for anchors. Deterministic, so the
 *  same family always draws the same plate. */
export function familySlug(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function getVaultCategories(): Promise<VaultCategory[]> {
  const { data, error } = await supabase
    .from("vault_categories")
    .select("id, family, slug, label, note, image_url, sort")
    .eq("active", true)
    .order("sort", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as VaultCategory[];
}

/** Groups in first-appearance order, which the `sort` column controls. */
export function groupFamilies(rows: VaultCategory[]): VaultFamily[] {
  const out: VaultFamily[] = [];
  const index = new Map<string, VaultFamily>();
  for (const row of rows) {
    let fam = index.get(row.family);
    if (!fam) {
      fam = { name: row.family, slug: familySlug(row.family), items: [] };
      index.set(row.family, fam);
      out.push(fam);
    }
    fam.items.push(row);
  }
  return out;
}

export async function getVaultDestinations(): Promise<VaultDestination[]> {
  const { data, error } = await supabase
    .from("vault_destinations")
    .select("id, slug, name, tagline, region, image_url, sort")
    .eq("active", true)
    .order("sort", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as VaultDestination[];
}

export async function getVaultListings(): Promise<VaultListing[]> {
  const { data, error } = await supabase
    .from("vault_listings")
    .select(LISTING_COLUMNS)
    .eq("published", true)
    .eq("visibility", "public")
    .order("featured", { ascending: false })
    .order("sort", { ascending: true });
  if (error) throw new Error(error.message);
  // Supabase types a runtime-built select string as a possible error shape, so
  // the cast has to go through `unknown`. The columns are listed one constant
  // above; that constant is the contract.
  return (data ?? []) as unknown as VaultListing[];
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Resolves by slug, falling back to the id — the same tolerance `getProperty()`
 * has, and for the same reason: a listing may not have been given a slug yet
 * and its URL is then the uuid.
 *
 * ⚠️ TWO QUERIES, NOT ONE `.or()`. `slug.eq.X,id.eq.X` looks tidier and is a
 * trap: Postgres has to parse X as a uuid for the id half, so any ordinary
 * slug comes back as an ERROR rather than as zero rows. Swallowing that error
 * would make every genuine read failure indistinguishable from a mistyped URL —
 * and this route calls `notFound()` on null, so a transient outage would cache
 * a 404 over a real listing. Splitting them keeps "missing" and "broken"
 * separate: missing returns null, broken still throws.
 */
export async function getVaultListing(key: string): Promise<VaultListing | null> {
  const bySlug = await supabase
    .from("vault_listings")
    .select(LISTING_COLUMNS)
    .eq("published", true)
    .eq("visibility", "public")
    .eq("slug", key)
    .maybeSingle();
  if (bySlug.error) throw new Error(bySlug.error.message);
  if (bySlug.data) return bySlug.data as unknown as VaultListing;

  if (!UUID.test(key)) return null;

  const byId = await supabase
    .from("vault_listings")
    .select(LISTING_COLUMNS)
    .eq("published", true)
    .eq("visibility", "public")
    .eq("id", key)
    .maybeSingle();
  if (byId.error) throw new Error(byId.error.message);
  return (byId.data as unknown as VaultListing) ?? null;
}

export async function getVaultSettings(): Promise<VaultSettings> {
  try {
    const { data, error } = await supabase
      .from("vault_settings")
      .select("key, value")
      .eq("is_public", true);
    if (error) throw new Error(error.message);
    const map = new Map((data ?? []).map((r) => [r.key as string, r.value]));
    return {
      hero: (map.get("hero") as VaultHero) ?? VAULT_FALLBACK.hero,
      promise: (map.get("promise") as string[]) ?? VAULT_FALLBACK.promise,
      faq: (map.get("faq") as VaultFaq[]) ?? VAULT_FALLBACK.faq,
      legal: (map.get("legal") as VaultLegal) ?? VAULT_FALLBACK.legal,
      /* Stored as `{items:[…]}` so the row can grow other gallery-level
         settings later without a migration. Anything malformed degrades to an
         empty rail rather than throwing — the section reserves its space
         regardless. */
      gallery:
        ((map.get("gallery") as { items?: VaultGalleryItem[] } | undefined)?.items ?? []).filter(
          (i) => i && typeof i.url === "string" && i.url.length > 0,
        ),
      /* Family slug → picture (0084). A missing or malformed row leaves the map
         empty, and every family falls back to its drawn plate — which is why
         `FamilyBlock` takes the image as an optional prop rather than looking
         it up itself. */
      familyImages: (map.get("familyImages") as Record<string, string>) ?? {},
    };
  } catch {
    // The Vault must still render if this one table is unreachable. Copy is the
    // least important thing on the page and the most annoying thing to have
    // take a page down.
    return VAULT_FALLBACK;
  }
}

export function vaultListingHref(l: VaultListing) {
  return `/vault/${l.slug ?? l.id}`;
}

/**
 * §13 — what a discreet listing is allowed to say.
 *
 * "Private Estate — South India" and nothing more. The rule is enforced here,
 * at one choke point, rather than in each component: a card, the dossier and
 * any future rail all call this, so a discreet property cannot leak its
 * locality because one of them forgot.
 */
export function publicTitle(l: VaultListing) {
  if (!l.discreet) return l.title;
  return l.discreet_label?.trim() || "Private estate";
}

export function publicPlace(l: VaultListing) {
  if (l.discreet) return l.state?.trim() || null;
  return [l.locality, l.state].filter(Boolean).join(", ") || null;
}

/**
 * §12 — the verification ladder, in public words.
 *
 * ⚠️ ONLY `vault_verified` produces a badge, and its wording says what Jamin
 * did rather than what is legally true. Every other stage returns null on
 * purpose: "Documents received" on a public page reads to a buyer as "the
 * paperwork is fine", which is exactly the implication §12 forbids.
 */
export function verificationBadge(stage: string): string | null {
  return stage === "vault_verified" ? "Reviewed by Jamin" : null;
}
