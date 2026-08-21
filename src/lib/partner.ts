"use client";

import { browserClient } from "./supabase-browser";
import type { Profile } from "./auth";

/**
 * The partner side, read through the app's own RPCs.
 *
 * ⚠️ Commission logic is NEVER recomputed here. Every figure on the partner
 * pages comes out of `bazaar_income_summary`, `bazaar_wallet_summary` and
 * `my_referral_stats` — the same functions the app reads. A second
 * implementation of the same arithmetic is a second answer waiting to disagree
 * with the first, and money is the worst place for that.
 *
 * All of these are keyed on auth.uid() inside the function, verified by calling
 * them anonymously: my_referral_stats returns {}, my_promoter_tree and
 * my_commissions return []. There is no user id to pass and no way to ask for
 * somebody else's numbers.
 */

/** Owner's rule, and the trap that goes with it: the owner is a VERIFIED
 *  PARTNER whose role is super_admin, so a check for role === 'promoter' alone
 *  misses them. Partner status counts on its own. */
export function isPartner(p: Profile | null): boolean {
  if (!p) return false;
  return p.role === "promoter" || p.partner_status === "verified";
}

export function isVerifiedPartner(p: Profile | null): boolean {
  return !!p && p.partner_status === "verified";
}

export type ReferralStats = {
  registrations: number;
  kyc_completed: number;
  clicks: number;
  downloads: number;
  enquiries: number;
  site_visits: number;
  purchases: number;
  rewards: number;
};

export async function fetchReferralStats(): Promise<ReferralStats> {
  const { data } = await browserClient().rpc("my_referral_stats");
  const d = (data ?? {}) as Partial<ReferralStats>;
  return {
    registrations: d.registrations ?? 0,
    kyc_completed: d.kyc_completed ?? 0,
    clicks: d.clicks ?? 0,
    downloads: d.downloads ?? 0,
    enquiries: d.enquiries ?? 0,
    site_visits: d.site_visits ?? 0,
    purchases: d.purchases ?? 0,
    rewards: d.rewards ?? 0,
  };
}

export type Wallet = {
  balance: number;
  withdrawable: number;
  pending_income: number;
  total_earnings: number;
  on_hold: number;
  withdrawn: number;
  min_withdrawal: number;
};

export async function fetchWallet(): Promise<Wallet | null> {
  const { data, error } = await browserClient().rpc("bazaar_wallet_summary");
  if (error) return null;
  const d = (data ?? {}) as Partial<Wallet>;
  return {
    balance: Number(d.balance ?? 0),
    withdrawable: Number(d.withdrawable ?? 0),
    pending_income: Number(d.pending_income ?? 0),
    total_earnings: Number(d.total_earnings ?? 0),
    on_hold: Number(d.on_hold ?? 0),
    withdrawn: Number(d.withdrawn ?? 0),
    min_withdrawal: Number(d.min_withdrawal ?? 0),
  };
}

export type TreeLevel = { level: number; users: number };

export async function fetchTree(): Promise<TreeLevel[]> {
  const { data, error } = await browserClient().rpc("my_promoter_tree");
  if (error) return [];
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    level: Number(r.level),
    users: Number(r.users),
  }));
}

export type ReferralRow = {
  referred_name: string | null;
  referred_code: string | null;
  joined_at: string;
  referred_at: string;
};

export async function fetchReferrals(): Promise<ReferralRow[]> {
  const { data, error } = await browserClient().rpc("my_referrals");
  if (error) return [];
  return (data ?? []) as ReferralRow[];
}

export type Lead = {
  id: string;
  status: string;
  source: string | null;
  notes: string | null;
  created_at: string;
  property: { title: string | null } | null;
};

/** RLS scopes leads to the promoter they are assigned to.
 *  ⚠️ The free-text column is `notes`, not `message` — a v-card enquiry's
 *  visitor name and number live there. */
export async function fetchLeads(): Promise<Lead[]> {
  const { data, error } = await browserClient()
    .from("leads")
    .select("id, status, source, notes, created_at, property:properties(title)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Lead[];
}

/* ---------- sharing ---------- */

const APP_BASE = "https://merry-begonia-4c3cd1.netlify.app";

/** The public V-Card and invite pages are served by the app's Netlify site, so
 *  a link shared from here is the same link shared from the phone. */
export const cardLink = (code: string) => `${APP_BASE}/card?c=${encodeURIComponent(code)}`;
export const inviteLink = (code: string) => `${APP_BASE}/i/${encodeURIComponent(code)}`;
export const propertyShareLink = (id: string, ref?: string | null) =>
  `${APP_BASE}/s/${encodeURIComponent(id)}${ref ? `?ref=${encodeURIComponent(ref)}` : ""}`;

export const inr = (n: number) =>
  n >= 1e7 ? `₹${(n / 1e7).toFixed(2).replace(/\.00$/, "")} Cr`
  : n >= 1e5 ? `₹${(n / 1e5).toFixed(2).replace(/\.00$/, "")} L`
  : `₹${Math.round(n).toLocaleString("en-IN")}`;
