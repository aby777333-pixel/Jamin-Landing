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
  if (error) throw new Error(error.message);
  const res = data as JamindarReply & { error?: string };
  if (res?.error) throw new Error(res.error);
  return { reply: res?.reply ?? "", mentioned: res?.mentioned ?? [] };
}
