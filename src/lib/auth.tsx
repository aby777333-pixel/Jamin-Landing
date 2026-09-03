"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { browserClient } from "./supabase-browser";
import { clearShortlist } from "./local-shortlist";

/**
 * Session state for the account area.
 *
 * The provider is mounted inside the account layout only — the public pages
 * stay untouched by it, so nothing on the indexed part of the site depends on
 * a client-side session existing.
 *
 * `loading` starts true and the UI must respect it. Rendering "signed out"
 * while the session is still being restored is how a returning visitor gets
 * bounced back to a sign-in screen they do not need — the same trap the app hit
 * with getUser() versus getSession().
 */
export type Profile = {
  id: string;
  full_name: string | null;
  mobile: string | null;
  email: string | null;
  city: string | null;
  role: string | null;
  member_code: string | null;
  referral_code: string | null;
  partner_code: string | null;
  partner_status: string | null;
  kyc_status: string | null;
  is_profile_complete: boolean | null;
};

type AuthState = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState>({
  loading: true,
  session: null,
  profile: null,
  refresh: async () => {},
  signOut: async () => {},
});

const PROFILE_COLUMNS =
  "id, full_name, mobile, email, city, role, member_code, referral_code, partner_code, partner_status, kyc_status, is_profile_complete";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = useCallback(async (uid: string | undefined) => {
    if (!uid) {
      setProfile(null);
      return;
    }
    // RLS restricts this to the caller's own row.
    const { data } = await browserClient()
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", uid)
      .maybeSingle();
    setProfile((data as Profile) ?? null);
  }, []);

  useEffect(() => {
    const sb = browserClient();
    let alive = true;

    // getSession(), never getUser(): getUser() is a network call that 401s on
    // an expired cold-start token before it has had a chance to refresh, which
    // signs a perfectly valid returning visitor out.
    sb.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session ?? null);
      await loadProfile(data.session?.user?.id);
      if (alive) setLoading(false);
    });

    const { data: sub } = sb.auth.onAuthStateChange(async (_e, s) => {
      if (!alive) return;
      setSession(s);
      await loadProfile(s?.user?.id);
      setLoading(false);
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refresh = useCallback(async () => {
    const { data } = await browserClient().auth.getSession();
    setSession(data.session ?? null);
    await loadProfile(data.session?.user?.id);
  }, [loadProfile]);

  const signOut = useCallback(async () => {
    await browserClient().auth.signOut();
    /* The browser shortlist was filled by the person signing out — the hearts
       are session-gated — so it leaves with them (report 18). */
    clearShortlist();
    setSession(null);
    setProfile(null);
  }, []);

  return (
    <Ctx.Provider value={{ loading, session, profile, refresh, signOut }}>{children}</Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
