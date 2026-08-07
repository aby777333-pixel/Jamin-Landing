"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * The signed-in client — browser only.
 *
 * ⚠️ Deliberately SEPARATE from `lib/supabase.ts`, and never imported by a
 * server component. That file's client is the read-only one used at build and
 * revalidation time; it sets `persistSession: false` precisely so a session can
 * never attach to a shared server-side singleton and bleed between requests.
 *
 * This one is the opposite: it persists and refreshes a session, and it only
 * ever exists inside a visitor's own browser tab.
 *
 * ⚠️ Nothing behind a login may be fetched on the server. The site is
 * statically generated with ISR, and increment 4a proved how readily a response
 * gets cached and re-served — a private profile rendered server-side could be
 * handed to the next visitor. Every read in the account area therefore happens
 * client-side, after the session is known.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

export function browserClient(): SupabaseClient {
  if (!url || !key) throw new Error("Supabase env missing");
  if (client) return client;
  client = createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: "jamin-web-auth",
    },
  });
  return client;
}

export const FUNCTIONS_URL = `${url}/functions/v1`;

/**
 * The app's own OTP endpoints, called exactly the way the app calls them
 * (lib/store.ts) so one account works in both places: `send-otp` issues the
 * code, `verify-otp` returns a one-time credential pair, and that pair is
 * immediately exchanged for a real Supabase session.
 *
 * `verify_jwt` is false on both functions, so they take the publishable key —
 * which is why they, not this client, own the rate limiting and the expiry.
 */
async function callFn<T>(name: string, body: unknown): Promise<T> {
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key ?? "",
      Authorization: `Bearer ${key ?? ""}`,
    },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? "Something went wrong. Please try again.");
  return json as T;
}

export type SendOtpResult = {
  sent: boolean;
  mobile: string;
  delivered: boolean;
  newUser?: boolean;
  devCode?: string;
};

export function sendOtp(mobile: string) {
  return callFn<SendOtpResult>("send-otp", { mobile });
}

export async function verifyOtp(mobile: string, code: string) {
  const res = await callFn<{
    verified: boolean;
    email: string;
    password: string;
    isNew: boolean;
    userId: string;
  }>("verify-otp", { mobile, code });

  const { error } = await browserClient().auth.signInWithPassword({
    email: res.email,
    password: res.password,
  });
  if (error) throw new Error(error.message);
  return res;
}
