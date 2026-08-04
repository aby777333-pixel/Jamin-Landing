import { createClient } from "@supabase/supabase-js";

/**
 * Read-only Supabase client for the public website.
 *
 * The Jamin Bazaar app is the master product and its admin console is the only
 * place data is written. This site never writes to the shared tables — it reads
 * the same rows the app reads, so there is exactly one source of truth and no
 * duplicated dataset to drift.
 *
 * Uses the publishable key and therefore only ever sees what RLS exposes to an
 * anonymous visitor.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
});

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://jaminproperties.com";
