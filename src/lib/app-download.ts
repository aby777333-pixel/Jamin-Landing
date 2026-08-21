import { supabase } from "./supabase";

/**
 * Where the Jamin app is downloaded from (owner spec 2026-08-21 §6).
 *
 * 🚨 THE URLS LIVE IN `site_config`, NOT IN THIS FILE, AND THAT IS THE POINT.
 * The spec's binding clause is "The direct-download APK must always point to
 * the current approved version of the application." A constant here would be
 * correct for exactly as long as nobody ships a new build — and the person who
 * ships one is on the admin console, not in this repo. The admin panel writes
 * the row (`site_config` is public-read, super-admin-write), this reads it, and
 * the site picks the change up within its one-hour revalidation window with no
 * deploy at all.
 *
 * ⚠️ NOTHING RENDERS UNTIL A URL IS SET, which is why every field is nullable
 * and the caller checks. At the time of writing the Play listing does not exist
 * and the APK rebuild is deferred by the owner, so a hard-coded pair of links
 * would ship two dead controls onto every page of the site — the exact failure
 * the footer's own note has been guarding against ("the app link is withdrawn
 * until the Play Store listing is live"). Publishing the mechanism without the
 * destination is the honest half of the job; the destination is one admin field
 * away.
 */
export type AppDownload = {
  apkUrl: string | null;
  playUrl: string | null;
  /** Shown beside the direct link so the reader knows what they are getting. */
  version: string | null;
  sizeLabel: string | null;
};

const EMPTY: AppDownload = { apkUrl: null, playUrl: null, version: null, sizeLabel: null };

/**
 * ⚠️ SCHEME-CHECKED. This is operator-entered text arriving from the database,
 * and an `href` is an execution surface: `javascript:` in that field would run
 * on every page of the site. Only http(s) survives, and a malformed value is
 * dropped rather than patched into something plausible.
 */
function safeUrl(v: unknown): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  try {
    const u = new URL(v.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}

export async function getAppDownload(): Promise<AppDownload> {
  const { data, error } = await supabase
    .from("site_config")
    .select("value")
    .eq("key", "app_download")
    .maybeSingle();

  /* A missing row is the normal state before the owner fills it in, not a
     fault — the footer simply omits the section. */
  if (error || !data?.value) return EMPTY;

  const v = data.value as Record<string, unknown>;
  return {
    apkUrl: safeUrl(v.apk_url),
    playUrl: safeUrl(v.play_url),
    version: str(v.version),
    sizeLabel: str(v.size_label),
  };
}
