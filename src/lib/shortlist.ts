"use client";

import { browserClient } from "./supabase-browser";

/**
 * The shortlist, stored in the app's own `favorites` table so a plot saved on
 * the website is saved on the phone too.
 *
 * ⚠️ The owning column is `buyer_id`, NOT `user_id`. Querying `user_id` here
 * returns nothing and fails silently — it has already cost this project two
 * empty rails in the app. RLS scopes every row to the caller either way.
 */
export async function fetchShortlistIds(uid: string): Promise<string[]> {
  const { data, error } = await browserClient()
    .from("favorites")
    .select("property_id")
    .eq("buyer_id", uid);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => r.property_id as string);
}

export async function addToShortlist(uid: string, propertyId: string): Promise<void> {
  const { error } = await browserClient()
    .from("favorites")
    .insert({ buyer_id: uid, property_id: propertyId });
  // A double tap racing itself is not an error worth showing anyone.
  if (error && !/duplicate key/i.test(error.message)) throw new Error(error.message);
}

export async function removeFromShortlist(uid: string, propertyId: string): Promise<void> {
  const { error } = await browserClient()
    .from("favorites")
    .delete()
    .eq("buyer_id", uid)
    .eq("property_id", propertyId);
  if (error) throw new Error(error.message);
}
