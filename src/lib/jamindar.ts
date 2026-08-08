"use client";

import { browserClient } from "./supabase-browser";

/**
 * Jamindar on the web (§30).
 *
 * Calls the app's own `jamindar-voice` edge function, unchanged.
 *
 * ⚠️ A correction worth recording, because the opposite was assumed at first:
 * `verify_jwt = true` does NOT mean a signed-in user. The publishable anon key
 * is itself a valid project JWT, so the function answers an anonymous caller
 * perfectly happily — verified by calling it with nothing but that key.
 *
 * The assistant is nonetheless kept inside the account area, and for a better
 * reason than the wrong one: an unauthenticated LLM endpoint reachable with a
 * public key is a spend surface, and every reply costs Sarvam credits. Putting
 * a link to it on public pages would multiply traffic to an endpoint whose
 * rate limiting has not been established. Moving it out front is a decision to
 * take deliberately, with a limiter in place — not a side effect of adding a
 * page.
 *
 * ⚠️ `mentioned` is the important part of the response. The function matches
 * project names against the reply BEFORE translating it, because non-English
 * replies transliterate project names into Indic scripts and client-side text
 * matching then fails. Always render cards from these ids, never by searching
 * the reply text.
 */
export type ChatMsg = { role: "user" | "assistant"; content: string };

export type JamindarReply = {
  reply: string;
  mentioned?: string[];
};

export const JAMINDAR_LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "ta-IN", label: "தமிழ்" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "te-IN", label: "తెలుగు" },
  { code: "kn-IN", label: "ಕನ್ನಡ" },
  { code: "ml-IN", label: "മലയാളം" },
] as const;

/** Carries the server's own wording plus whether this was the rate limiter, so
 *  the UI can present a throttle as guidance rather than as a failure. */
export class JamindarError extends Error {
  rateLimited: boolean;
  constructor(message: string, rateLimited = false) {
    super(message);
    this.name = "JamindarError";
    this.rateLimited = rateLimited;
  }
}

export async function jamindarChat(
  messages: ChatMsg[],
  opts: { language?: string; conversationId?: string; propertyContext?: string } = {},
): Promise<JamindarReply> {
  const userText = [...messages].reverse().find((m) => m.role === "user")?.content;
  const { data, error } = await browserClient().functions.invoke("jamindar-voice", {
    body: {
      action: "chat",
      messages,
      userText,
      language: opts.language ?? "en-IN",
      conversationId: opts.conversationId,
      propertyContext: opts.propertyContext,
    },
  });

  // ⚠️ supabase-js treats any non-2xx as `error` and leaves `data` null, so the
  // body has to be read off the thrown Response or the anonymous rate limiter's
  // 429 would surface as "Edge Function returned a non-2xx status code". The
  // limiter already writes a human sentence server-side; show that, not this.
  if (error) {
    const res = (error as { context?: Response }).context;
    if (res && typeof res.json === "function") {
      const body = await res.json().catch(() => null);
      if (body?.error) throw new JamindarError(body.error, body.rateLimited === true);
    }
    throw new JamindarError(error.message);
  }

  const res = data as JamindarReply & { error?: string; rateLimited?: boolean };
  if (res?.error) throw new JamindarError(res.error, res.rateLimited === true);
  return { reply: res?.reply ?? "", mentioned: res?.mentioned ?? [] };
}
