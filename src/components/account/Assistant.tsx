"use client";

import { useEffect, useRef, useState } from "react";
import { AccountShell } from "./AccountShell";
import { PropertyCard } from "@/components/PropertyCard";
import { Skeleton } from "@/components/ui";
import { JAMINDAR_LANGUAGES, jamindarChat, type ChatMsg } from "@/lib/jamindar";
import type { Property } from "@/lib/properties";

/**
 * Jamindar, the assistant that already lives in the app, on the web.
 *
 * §30 is explicit that it must not be a decorative chatbot: the edge function
 * injects a live inventory block on every turn and the model can only
 * recommend from it, so fabricating a project is impossible by construction.
 * When a reply names real projects the function returns their ids, and those
 * become cards below the answer.
 *
 * Text only for now. Voice needs MediaRecorder plus the STT round trip and is
 * worth its own increment rather than a half-working microphone button.
 */
const SUGGESTIONS = [
  "Which developments are selling right now?",
  "What should I check before buying a plot?",
  "Show me something in Salem district",
  "What does DTCP approval actually cover?",
];

export function Assistant({ all }: { all: Property[] }) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [cards, setCards] = useState<Record<number, string[]>>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState("en-IN");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || busy) return;
    const next: ChatMsg[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await jamindarChat(next, { language });
      const idx = next.length; // index the assistant reply will occupy
      setMessages([...next, { role: "assistant", content: res.reply }]);
      if (res.mentioned?.length) setCards((c) => ({ ...c, [idx]: res.mentioned! }));
    } catch (e) {
      // Leave the conversation intact — retrying should not mean retyping.
      setError(e instanceof Error ? e.message : "Jamindar could not answer just now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AccountShell title="Ask Jamindar">
      <p className="max-w-2xl text-base leading-relaxed text-ink-muted">
        The same assistant that lives in the Jamin Bazaar app. It answers from our live inventory,
        so it can only point you at projects that genuinely exist — and it will say when it does not
        know something.
      </p>

      <div className="mt-phi3 flex flex-wrap items-center gap-2">
        <span className="text-micro font-semibold uppercase tracking-brand text-ink-faint">
          Language
        </span>
        {JAMINDAR_LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLanguage(l.code)}
            aria-pressed={language === l.code}
            className={`rounded-full border px-3.5 py-1.5 text-tiny font-medium transition-colors ${
              language === l.code
                ? "border-ink bg-ink text-canvas"
                : "border-line bg-canvas text-ink-soft hover:border-ink-faint"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="mt-phi4 space-y-phi3">
        {messages.length === 0 && (
          <div className="rounded-card border border-line bg-canvas-alt p-phi3">
            <p className="text-base text-ink-soft">Try one of these to start:</p>
            <div className="mt-phi2 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-line bg-canvas px-4 py-2 text-tiny text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i}>
            <div
              className={
                m.role === "user"
                  ? "ml-auto max-w-[85%] rounded-card bg-ink px-phi3 py-phi2 text-base text-canvas"
                  : "max-w-[85%] rounded-card border border-line bg-canvas px-phi3 py-phi2 text-base leading-relaxed text-ink-soft"
              }
            >
              {m.content.split(/\n{2,}/).map((para, j) => (
                <p key={j} className={j ? "mt-phi2" : ""}>
                  {para}
                </p>
              ))}
            </div>

            {/* Cards come from the ids the server matched, never from parsing
                the reply text — a non-English reply transliterates the project
                names and text matching would find nothing. */}
            {cards[i]?.length ? (
              <div className="mt-phi3 grid gap-phi3 sm:grid-cols-2">
                {cards[i]
                  .map((id) => all.find((p) => p.id === id))
                  .filter(Boolean)
                  .map((p) => (
                    <PropertyCard key={p!.id} p={p!} />
                  ))}
              </div>
            ) : null}
          </div>
        ))}

        {busy && (
          <div className="max-w-[85%] space-y-2 rounded-card border border-line bg-canvas px-phi3 py-phi2">
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-64" />
            <span className="sr-only">Jamindar is thinking</span>
          </div>
        )}

        {error && (
          <p role="alert" className="rounded-card border border-jamin-red bg-jamin-red-soft p-phi2 text-base text-jamin-red-deep">
            {error}
          </p>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="sticky bottom-0 mt-phi4 flex items-center gap-2 bg-canvas/95 py-phi2 backdrop-blur"
      >
        <label htmlFor="jam-input" className="sr-only">
          Ask Jamindar a question
        </label>
        <input
          id="jam-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a project, a document, or what to check…"
          className="w-full rounded-full border border-line bg-canvas px-phi3 py-3 text-base text-ink outline-none focus:border-ink-faint"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="shrink-0 rounded-full bg-jamin-red px-5 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep disabled:opacity-40"
        >
          Ask
        </button>
      </form>

      <p className="mt-phi2 text-tiny leading-relaxed text-ink-faint">
        Jamindar answers from live project records. It does not quote a plot price, because none is
        published — the sales desk confirms rates.
      </p>
    </AccountShell>
  );
}
