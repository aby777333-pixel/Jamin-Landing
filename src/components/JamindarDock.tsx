"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { JAMINDAR_LANGUAGES, JamindarError, jamindarChat, type ChatMsg } from "@/lib/jamindar";

/**
 * Jamindar, in front of the paywall of signing in (§30).
 *
 * This was deliberately kept inside the account area until now, for one
 * reason: the edge function proxies Sarvam on a paid key, and the publishable
 * anon key is itself a valid project JWT, so `verify_jwt = true` never stopped
 * an anonymous caller. Putting it on public pages without a limiter would have
 * been an open spend surface. The limiter shipped on 2026-08-08 (migration 0080
 * plus `jamindar-voice` v25) and is verified counting, so the door can open.
 *
 * Speech is done entirely in the BROWSER — `SpeechRecognition` for input and
 * `speechSynthesis` for output. Sarvam's own `stt` and `tts` actions are never
 * called, so the voice experience adds nothing to the bill and no audio ever
 * leaves the device.
 */

/** Only what a card needs. The full Property is ~60 columns and this component
 *  is embedded in the layout, so it would ride on every page of the site. */
export type JamindarProperty = {
  id: string;
  href: string;
  title: string;
  location: string;
  phase: string | null;
  sellable: boolean;
};

const SUGGESTIONS = [
  "What is selling right now?",
  "What should I check before buying a plot?",
  "What does DTCP approval cover?",
];

/* ---------- browser speech, typed just enough ---------- */

type SpeechResultEvent = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};
type RecognitionCtor = new () => Recognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Capability is read as an external store rather than detected in an effect.
 *
 * It has to be read on the client — the server has no `window` — but the server
 * snapshot must be `false` so the prerendered HTML and the hydration pass agree,
 * and a `setState` in an effect for this would just be a cascading render for a
 * value that never changes. Support is fixed for the life of the page, so
 * `subscribe` has nothing to listen to.
 */
const noSubscribe = () => () => {};
const hasRecognition = () => !!recognitionCtor();
const hasSynthesis = () => typeof window !== "undefined" && "speechSynthesis" in window;
const notOnServer = () => false;

export function JamindarDock({ properties }: { properties: JamindarProperty[] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [cards, setCards] = useState<Record<number, string[]>>({});
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; throttled: boolean } | null>(null);
  const [language, setLanguage] = useState("en-IN");
  const [listening, setListening] = useState(false);
  const [speak, setSpeak] = useState(false);
  // A mic button that does nothing on Firefox is worse than no mic button.
  const canListen = useSyncExternalStore(noSubscribe, hasRecognition, notOnServer);
  const canSpeak = useSyncExternalStore(noSubscribe, hasSynthesis, notOnServer);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<Recognition | null>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Escape closes, and stops anything still being read aloud.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Leaving the page mid-sentence must not keep talking.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      recRef.current?.stop();
    };
  }, []);

  const say = useCallback(
    (text: string) => {
      if (!speak || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = language;
      window.speechSynthesis.speak(u);
    },
    [speak, language],
  );

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || busy) return;
      const next: ChatMsg[] = [...messages, { role: "user", content: q }];
      setMessages(next);
      setInput("");
      setBusy(true);
      setError(null);
      try {
        const res = await jamindarChat(next, { language });
        const idx = next.length;
        setMessages([...next, { role: "assistant", content: res.reply }]);
        if (res.mentioned?.length) setCards((c) => ({ ...c, [idx]: res.mentioned! }));
        say(res.reply);
      } catch (e) {
        // The conversation is left intact — a retry should never mean retyping.
        // A 429 already carries a sentence written server-side; show that
        // verbatim rather than inventing a friendlier one that says less.
        setError(
          e instanceof JamindarError
            ? { text: e.message, throttled: e.rateLimited }
            : { text: "Jamindar could not answer just now. Please try again.", throttled: false },
        );
      } finally {
        setBusy(false);
      }
    },
    [busy, messages, language, say],
  );

  function toggleMic() {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const Ctor = recognitionCtor();
    if (!Ctor) return;
    const rec = new Ctor();
    recRef.current = rec;
    rec.lang = language;
    rec.interimResults = false;
    rec.continuous = false;
    rec.onresult = (e) => {
      const said = e.results?.[0]?.[0]?.transcript;
      if (said) void send(said);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }

  const byId = (id: string) => properties.find((p) => p.id === id);

  return (
    <>
      {/* ---- launcher ---- */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="jamindar-panel"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-jamin-red px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-raise transition-transform duration-300 hover:-translate-y-0.5 print:hidden"
        style={{ transitionTimingFunction: "var(--ease-silk)" }}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
          <path
            d="M3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v6A2.5 2.5 0 0 1 14.5 14H8l-4 3v-3H5.5A2.5 2.5 0 0 1 3 11.5z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        {open ? "Close" : "Ask Jamindar"}
      </button>

      {/* ---- panel ---- */}
      {open && (
        <div
          id="jamindar-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Ask Jamindar"
          className="fixed inset-x-3 bottom-24 z-40 flex max-h-[min(34rem,70vh)] flex-col overflow-hidden rounded-xl border border-line bg-canvas shadow-raise sm:inset-x-auto sm:right-5 sm:w-[26rem] print:hidden"
        >
          <header className="shrink-0 border-b border-line px-phi3 py-phi2">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-base text-ink">Jamindar</div>
                <div className="text-micro uppercase tracking-brand text-ink-faint">
                  Answers from live projects
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {canSpeak && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextOn = !speak;
                      setSpeak(nextOn);
                      if (!nextOn) window.speechSynthesis?.cancel();
                    }}
                    aria-pressed={speak}
                    title={speak ? "Stop reading answers aloud" : "Read answers aloud"}
                    className={`rounded-full border px-3 py-1.5 text-micro font-semibold uppercase tracking-[0.1em] transition-colors ${
                      speak
                        ? "border-ink bg-ink text-canvas"
                        : "border-line text-ink-soft hover:border-ink-faint"
                    }`}
                  >
                    Voice
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-line px-3 py-1.5 text-micro font-semibold uppercase tracking-[0.1em] text-ink-soft hover:border-ink-faint"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="mt-phi2 flex flex-wrap gap-1.5">
              {JAMINDAR_LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLanguage(l.code)}
                  aria-pressed={language === l.code}
                  className={`rounded-full border px-2.5 py-1 text-micro transition-colors ${
                    language === l.code
                      ? "border-ink bg-ink text-canvas"
                      : "border-line text-ink-soft hover:border-ink-faint"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </header>

          <div className="min-h-0 flex-1 space-y-phi2 overflow-y-auto px-phi3 py-phi3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-base leading-relaxed text-ink-muted">
                  Ask about a project, a document, or what to check before you buy.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => void send(s)}
                      className="rounded-full border border-line bg-canvas-alt px-3 py-1.5 text-tiny text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
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
                      ? "ml-auto w-fit max-w-[85%] rounded-card bg-ink px-phi2 py-2 text-base text-canvas"
                      : "max-w-[92%] rounded-card border border-line bg-canvas-alt px-phi2 py-2 text-base leading-relaxed text-ink-soft"
                  }
                >
                  {m.content.split(/\n{2,}/).map((para, j) => (
                    <p key={j} className={j ? "mt-2" : ""}>
                      {para}
                    </p>
                  ))}
                </div>

                {/* Built from the ids the server matched BEFORE translating —
                    a Tamil or Telugu reply transliterates the project names, so
                    matching the reply text would find nothing. */}
                {cards[i]?.length ? (
                  <ul className="mt-phi2 space-y-1.5">
                    {cards[i]
                      .map(byId)
                      .filter((p): p is JamindarProperty => !!p)
                      .map((p) => (
                        <li key={p.id}>
                          <Link
                            href={p.href}
                            onClick={() => setOpen(false)}
                            className="flex items-center justify-between gap-3 rounded-card border border-line bg-canvas px-phi2 py-2 transition-colors hover:border-line-red"
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-base text-ink">{p.title}</span>
                              <span className="block truncate text-tiny text-ink-faint">
                                {p.location}
                              </span>
                            </span>
                            <span className="shrink-0 text-micro uppercase tracking-[0.1em] text-jamin-gold-ink">
                              {p.sellable ? (p.phase ?? "View") : "Sold out"}
                            </span>
                          </Link>
                        </li>
                      ))}
                  </ul>
                ) : null}
              </div>
            ))}

            {busy && (
              <p className="text-tiny text-ink-faint" role="status">
                Jamindar is thinking…
              </p>
            )}

            {error && (
              <p
                role="alert"
                className={`rounded-card border p-phi2 text-tiny leading-relaxed ${
                  error.throttled
                    ? "border-jamin-gold-ink/40 bg-canvas-alt text-ink-soft"
                    : "border-jamin-red bg-jamin-red-soft text-jamin-red-deep"
                }`}
              >
                {error.text}
              </p>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="shrink-0 border-t border-line px-phi3 py-phi2"
          >
            <div className="flex items-center gap-2">
              <label htmlFor="jamindar-input" className="sr-only">
                Ask Jamindar a question
              </label>
              <input
                id="jamindar-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? "Listening…" : "Ask a question…"}
                className="w-full min-w-0 rounded-full border border-line bg-canvas px-4 py-2.5 text-base text-ink outline-none focus:border-ink-faint"
                autoComplete="off"
              />
              {canListen && (
                <button
                  type="button"
                  onClick={toggleMic}
                  aria-pressed={listening}
                  title={listening ? "Stop listening" : "Speak your question"}
                  className={`shrink-0 rounded-full border p-2.5 transition-colors ${
                    listening
                      ? "border-jamin-red bg-jamin-red text-white"
                      : "border-line text-ink-soft hover:border-ink-faint"
                  }`}
                >
                  <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
                    <rect x="7.5" y="2.5" width="5" height="9" rx="2.5" fill="currentColor" />
                    <path
                      d="M4.5 9.5a5.5 5.5 0 0 0 11 0M10 15v2.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="sr-only">{listening ? "Stop listening" : "Speak"}</span>
                </button>
              )}
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="shrink-0 rounded-full bg-jamin-red px-4 py-2.5 text-micro font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-jamin-red-deep disabled:opacity-40"
              >
                Ask
              </button>
            </div>
            <p className="mt-1.5 text-micro leading-relaxed text-ink-faint">
              Answers come from live project records. No plot price is quoted — none is published.
            </p>
          </form>
        </div>
      )}
    </>
  );
}
