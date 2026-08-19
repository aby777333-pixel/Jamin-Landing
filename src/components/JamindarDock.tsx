"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  JAMINDAR_LANGUAGES,
  JamindarError,
  jamindarChat,
  jamindarSpeak,
  type ChatMsg,
} from "@/lib/jamindar";

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

/* ══════════════════════════════════════════════════════════════════════════
   THE HAIL — Jamindar introducing himself (owner 2026-08-19: "it is very hard
   to notice it").

   The medallion is deliberately discreet (§6.8), and discreet turned out to
   mean invisible: readers were leaving without ever learning the site can be
   asked questions. So the seal now HAILS — a small glass card unfurls beside
   it on arrival and again at intervals, and the medallion wears the pulsar
   ring for as long as the card is up.

   ⚠️ IT HAILS, IT DOES NOT OPEN. Auto-opening the panel was the obvious
   reading of "pop up" and is the wrong one on a phone: below `sm` the panel is
   FULL SCREEN (see the class list on #jamindar-panel), so an automatic open
   would put a chat window over the whole site five seconds after arrival, on
   every page, before the reader has read a line. The card is loud enough to be
   noticed and costs the reader nothing to ignore. Flip AUTO_OPEN to true if
   the full panel is genuinely wanted — everything else here already works.

   ⚠️ IT GIVES UP. Three rules stop it, and any one of them is enough:
   opening the panel once (`engaged`), dismissing the card (`×`, remembered for
   the session), or simply having been shown MAX_HAILS times. A nudge that
   never stops is an advertisement.
   ══════════════════════════════════════════════════════════════════════════ */
const AUTO_OPEN = false;
/** First hail. Late enough that the hero has been looked at, early enough to
 *  land before a reader who is only skimming has gone. */
const HAIL_FIRST_MS = 5_000;
/** And again, every so often, for a reader who is still browsing. */
const HAIL_EVERY_MS = 75_000;
/** How long the card stays up before it withdraws by itself. */
const HAIL_DWELL_MS = 11_000;
/** Per session, across every page — see the sessionStorage counter. */
const MAX_HAILS = 4;
const HAIL_KEY = "jamin.jamindar.hail";

/** What he says. Rotates, so the second hail is not the first one repeated —
 *  a card that says the same thing twice reads as a bug. */
const HAIL_LINES = [
  "Ask me anything about our projects.",
  "Want to know what DTCP approval covers?",
  "I can tell you what is selling right now.",
  "Buying a plot? Ask me what to check first.",
];

/**
 * The session counter lives in `sessionStorage` rather than in state.
 *
 * ⚠️ Every route is a fresh mount. This is the App Router: a click to another
 * page re-runs the layout's client tree, so a counter held in React would
 * reset to zero on each navigation and a reader browsing six pages would be
 * hailed twenty-four times. The store is also what makes "×" mean *stop*
 * rather than *stop until the next click*.
 */
function readHailState(): { count: number; off: boolean } {
  try {
    const raw = sessionStorage.getItem(HAIL_KEY);
    if (raw === "off") return { count: MAX_HAILS, off: true };
    return { count: raw ? Number(raw) || 0 : 0, off: false };
  } catch {
    // Private mode, or storage disabled. Hail once per page rather than not at
    // all; the dwell timer still takes it away.
    return { count: 0, off: false };
  }
}
function writeHailCount(n: number) {
  try { sessionStorage.setItem(HAIL_KEY, String(n)); } catch {}
}
function silenceHail() {
  try { sessionStorage.setItem(HAIL_KEY, "off"); } catch {}
}

/* ---------- browser speech, typed just enough ---------- */

type SpeechAlt = { transcript: string };
type SpeechResult = ArrayLike<SpeechAlt> & { isFinal?: boolean };
type SpeechResultEvent = { resultIndex?: number; results: ArrayLike<SpeechResult> };
type SpeechErrorEvent = { error?: string };
type Recognition = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  maxAlternatives?: number;
  start: () => void;
  stop: () => void;
  abort?: () => void;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: ((e: SpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
};

/** What went wrong, in words a reader can act on. Silence plus a button that
 *  turned red is the worst possible feedback. */
const MIC_ERROR: Record<string, string> = {
  "not-allowed":
    "Microphone access is blocked. Allow it for this site in your browser settings, then tap the mic again.",
  "service-not-allowed":
    "Microphone access is blocked. Allow it for this site in your browser settings, then tap the mic again.",
  "audio-capture": "No microphone was found on this device.",
  network: "Speech recognition needs a connection and could not reach the service.",
  "no-speech": "Nothing was heard. Tap the mic and speak again.",
  aborted: "",
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
  /** The hail card is up right now. */
  const [hailing, setHailing] = useState(false);
  /** The reader has opened the panel at least once — he never hails again. */
  const [engaged, setEngaged] = useState(false);
  /** Which line he says. Driven off the session count, so the second hail of
   *  the visit is the second line even when it lands on a different page. */
  const [hailIndex, setHailIndex] = useState(0);
  // A mic button that does nothing on Firefox is worse than no mic button.
  const canListen = useSyncExternalStore(noSubscribe, hasRecognition, notOnServer);
  const canSpeak = useSyncExternalStore(noSubscribe, hasSynthesis, notOnServer);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<Recognition | null>(null);
  /** Reused so a second answer replaces the first rather than talking over it. */
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, busy, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /**
   * Opening it once retires the hail for the rest of the session.
   *
   * ⚠️ A handler, NOT an effect on `open`. Writing it as
   * `useEffect(() => { if (open) setEngaged(true) }, [open])` is the obvious
   * shape and `react-hooks/set-state-in-effect` rejects it: a setState in an
   * effect body is a second render for a value that was already known at the
   * moment of the click. Every path that opens the panel goes through here.
   */
  const openPanel = useCallback(() => {
    setOpen(true);
    setEngaged(true);
    setHailing(false);
    silenceHail();
  }, []);

  /**
   * THE HAIL TIMER.
   *
   * ⚠️ `document.hidden` is checked at fire time, not at schedule time. A
   * reader who opens the site in a background tab and comes back four minutes
   * later would otherwise arrive to find the whole session's hails already
   * spent on a tab nobody was looking at. Skipping a hidden fire costs
   * nothing — the interval brings the next one round.
   *
   * ⚠️ The count is re-read from the store on every fire rather than held in a
   * closure, so two hails cannot be spent by two mounts of this component
   * racing across a navigation.
   */
  useEffect(() => {
    if (engaged) return;
    if (readHailState().off) return;

    let dwell: number | undefined;
    let repeat: number | undefined;

    const withdraw = () => setHailing(false);

    const hail = () => {
      if (document.hidden) return;
      const { count, off } = readHailState();
      if (off || count >= MAX_HAILS) {
        window.clearInterval(repeat);
        return;
      }
      writeHailCount(count + 1);
      setHailIndex(count % HAIL_LINES.length);
      if (AUTO_OPEN) {
        openPanel();
        return;
      }
      setHailing(true);
      window.clearTimeout(dwell);
      dwell = window.setTimeout(withdraw, HAIL_DWELL_MS);
    };

    const first = window.setTimeout(() => {
      hail();
      repeat = window.setInterval(hail, HAIL_EVERY_MS);
    }, HAIL_FIRST_MS);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(dwell);
      window.clearInterval(repeat);
    };
  }, [engaged, openPanel]);

  /**
   * Stop whatever is talking, whichever engine is talking.
   *
   * ⚠️ THERE ARE TWO OF THEM, and that is the bug this exists to fix. A
   * local voice speaks through `speechSynthesis`; every language the device has
   * no voice for falls back to Sarvam and plays through an <audio> element. The
   * Voice button only ever called `speechSynthesis.cancel()`, so on exactly the
   * languages the fallback serves — Tamil, Telugu, Kannada, Malayalam — pressing
   * it did nothing audible and the answer kept reading to the end. This is now
   * the ONLY way playback is stopped, so the two can never diverge again.
   */
  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    const a = audioRef.current;
    if (a) {
      a.pause();
      // Rewind, or the next reply resumes this one from where it was cut.
      try { a.currentTime = 0; } catch {}
    }
  }, []);

  // Escape closes, and stops anything still being read aloud.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        stopSpeech();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, stopSpeech]);

  /**
   * 🚨 THE KEYBOARD FALLBACK — pins the full-screen panel to the part of the
   * screen the reader can actually see.
   *
   * `interactiveWidget: "resizes-content"` in app/layout.tsx is the real fix and
   * covers Chrome. Safari ignores that key entirely: there, the on-screen
   * keyboard shrinks only the VISUAL viewport, `100dvh` stays the height of the
   * whole screen, and the composer sits underneath the keyboard — the exact
   * symptom that was reported. `window.visualViewport` is the only thing that
   * reports the visible box in that browser, so the height is set from it
   * directly.
   *
   * ⚠️ Guarded on `< sm`. From 640px up the panel is a floating card with its
   * own `sm:h-auto` and `sm:max-h`, and an inline height would override both —
   * a desktop panel would suddenly be as tall as the window. The style is also
   * cleared on the way out, so a resize across the breakpoint cannot leave a
   * stale pixel height behind.
   *
   * ⚠️ `offsetTop` as well as `height`. Safari does not just shrink the visual
   * viewport, it SCROLLS it — so a panel pinned to `top: 0` of the layout
   * viewport drifts off the top of the screen. Following `offsetTop` keeps the
   * header where the reader is looking.
   */
  useEffect(() => {
    if (!open) return;
    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (!vv) return;

    const apply = () => {
      const el = panelRef.current;
      if (!el) return;
      if (window.innerWidth >= 640) {
        el.style.height = "";
        el.style.top = "";
        return;
      }
      el.style.height = `${vv.height}px`;
      el.style.top = `${vv.offsetTop}px`;
    };

    apply();
    /* Captured now rather than read in the cleanup: the panel unmounts with
       `open`, so by the time cleanup runs `panelRef.current` is already null and
       the styles would never be cleared. */
    const panel = panelRef.current;
    vv.addEventListener("resize", apply);
    vv.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    return () => {
      vv.removeEventListener("resize", apply);
      vv.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      if (panel) {
        panel.style.height = "";
        panel.style.top = "";
      }
    };
  }, [open]);

  // Leaving the page mid-sentence must not keep talking.
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
      audioRef.current?.pause();
      recRef.current?.stop();
    };
  }, []);


  /**
   * ⚠️ Setting `utterance.lang` is a REQUEST, not an instruction.
   *
   * If no voice for that language is installed the browser quietly falls back
   * to its default and reads Telugu text aloud in an English voice — which is
   * worse than silence, because the reply on screen is correct and only the
   * audio lies. So the voice is chosen explicitly: exact locale first
   * ("te-IN"), then any voice for the same language ("te"), and if the device
   * genuinely has none, nothing is spoken and the reader is told why rather
   * than being read to in the wrong language.
   */
  const say = useCallback(
    (text: string) => {
      if (!speak || typeof window === "undefined" || !("speechSynthesis" in window)) return;
      const synth = window.speechSynthesis;
      synth.cancel();

      const base = language.split("-")[0].toLowerCase();
      const norm = (l: string) => l.replace("_", "-").toLowerCase();
      const pick = (voices: SpeechSynthesisVoice[]) =>
        voices.find((v) => norm(v.lang) === norm(language)) ??
        voices.find((v) => norm(v.lang).split("-")[0] === base);

      const speakWith = (voices: SpeechSynthesisVoice[]) => {
        const match = pick(voices);
        if (match) {
          const u = new SpeechSynthesisUtterance(text);
          u.voice = match;
          u.lang = match.lang;
          synth.speak(u);
          return;
        }
        // ⚠️ No local voice for this language, so fall back to the server.
        // This is the one path that spends money — see `jamindarSpeak`. Most
        // devices ship English and Hindi, so Tamil, Telugu, Kannada and
        // Malayalam are where it actually fires. Failing quietly is right for a
        // decorative feature: the reply is already on screen in the language
        // that was asked for.
        void jamindarSpeak(text, language).then((url) => {
          if (!url) return;
          const audio = audioRef.current ?? new Audio();
          audioRef.current = audio;
          audio.src = url;
          void audio.play().catch(() => {});
        });
      };

      // ⚠️ Chrome populates the voice list asynchronously, so the first call
      // after a page load returns []. Reporting "no voice installed" off that
      // empty list would be wrong on a device that has one — wait for
      // `voiceschanged` once instead.
      const voices = synth.getVoices();
      if (voices.length) {
        speakWith(voices);
        return;
      }
      const onVoices = () => {
        synth.removeEventListener("voiceschanged", onVoices);
        speakWith(synth.getVoices());
      };
      synth.addEventListener("voiceschanged", onVoices);
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
    /* ⚠️ Interim results ON. Without them the field stays empty for the whole
       utterance and the only feedback is a button that changed colour — which
       is indistinguishable from the microphone not working at all. */
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;

    let finalText = "";
    rec.onresult = (e) => {
      let interim = "";
      const results = e.results ?? [];
      for (let i = 0; i < results.length; i++) {
        const r = results[i];
        const t = r?.[0]?.transcript ?? "";
        if (r?.isFinal) finalText += t;
        else interim += t;
      }
      // Show it landing, word by word.
      setInput((finalText + interim).trim());
    };
    rec.onerror = (e) => {
      setListening(false);
      const msg = MIC_ERROR[e?.error ?? ""] ?? "The microphone could not be started.";
      if (msg) setError({ text: msg, throttled: false });
    };
    /* Send on `onend` rather than on the first result: recognition ends when
       the speaker stops, and sending mid-sentence truncated the question. */
    rec.onend = () => {
      setListening(false);
      const said = finalText.trim();
      if (said) void send(said);
    };

    setError(null);
    setListening(true);
    try {
      rec.start();
    } catch {
      // Chrome throws if start() is called while already running.
      setListening(false);
    }
  }

  const byId = (id: string) => properties.find((p) => p.id === id);

  return (
    <>
      {/* ---- launcher ---- */}
      {/* ⚠️ §6.8 — a discreet concierge seal, not a chat bubble. The visible
          words are gone, so the accessible name now comes from `aria-label`;
          without it this button would announce as "button" and the assistant
          would be unreachable by screen reader. The label that appears on hover
          is decoration and is hidden from the tree to avoid saying it twice. */}
      {/* ---- the hail ----
          Sits beside the seal, pointing at it, so the card and the button read
          as one object rather than as a stray toast. `aria-live="polite"`, not
          an alert: it interrupts nothing and waits its turn. */}
      {hailing && !open && (
        <div className="rj-hail fixed bottom-5 right-[4.75rem] z-40 print:hidden">
          <div className="rj-hail-card" role="status" aria-live="polite">
            <button
              type="button"
              onClick={openPanel}
              className="rj-hail-say"
            >
              <span className="rj-hail-name">Jamindar</span>
              <span className="rj-hail-line">{HAIL_LINES[hailIndex]}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setHailing(false);
                setEngaged(true);
                silenceHail();
              }}
              aria-label="Don't show this again"
              className="rj-hail-dismiss"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                <path
                  d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-expanded={open}
        aria-controls="jamindar-panel"
        aria-label={open ? "Close Jamindar" : "Ask Jamindar"}
        /* ⚠️ `rj-pulsar` is CONDITIONAL, and the note beside that rule in
           royal.css explains why it must stay so: on the base class it would
           set the seal beating on every page for the life of the visit. Here
           it rides only for the eleven seconds the card is up, which is what
           makes it a hail rather than a notification badge. */
        className={`rj-medallion fixed bottom-5 right-5 z-40 inline-flex items-center justify-center print:hidden ${hailing && !open ? "rj-pulsar" : ""} ${open ? "hidden sm:inline-flex" : ""}`}
      >
        <span className="rj-medallion-label" aria-hidden="true">
          {open ? "Close ✦" : "Ask Jamindar ✦"}
        </span>
        {/* JAMINDAR HIMSELF (owner 2026-08-17): the namaste illustration from
            the app's own asset set replaces the app mark — the assistant has a
            face now. Cropped square to the turban and set in a circle; still a
            plain <img> for the same reason the mark was (a fixed control on
            every page, optimiser round-trip costs more than the file). */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/jamindar-avatar.webp"
          alt=""
          aria-hidden="true"
          className="h-9 w-9 rounded-full bg-white object-cover"
        />
      </button>

      {/* ---- panel ---- */}
      {open && (
        <div
          id="jamindar-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-label="Ask Jamindar"
          /* ⚠️ Full screen on a phone, a panel from `sm` up.
             A floating panel is fine until the on-screen keyboard opens: the
             viewport halves, the panel is squeezed, and the language chips end
             up above the scroll. Taking the whole screen means the keyboard
             takes space from the message list and nothing else. `dvh`, not
             `vh`, because `vh` on iOS is the height WITHOUT the browser chrome
             and the composer ends up under it.

             ⚠️ THIS COLUMN WAS ALWAYS RIGHT AND STILL FAILED — read the two
             notes it depends on before changing anything here. `shrink-0`
             header, `min-h-0 flex-1` transcript, `shrink-0` composer is exactly
             the "only the chat scrolls" structure that was asked for; what
             broke it is that `100dvh` does not shrink when the keyboard opens,
             so the column was resolving against a box 300px taller than the
             screen. The height comes from `interactiveWidget` in
             app/layout.tsx and from the `visualViewport` effect above, and
             those two are what make this class list mean what it says. */
          className="rj-unfurl fixed inset-0 z-40 flex h-[100dvh] w-full flex-col overflow-hidden border-line bg-canvas print:hidden sm:inset-x-auto sm:inset-y-auto sm:bottom-24 sm:right-5 sm:h-auto sm:max-h-[min(34rem,70vh)] sm:w-[26rem] sm:rounded-xl sm:border sm:shadow-raise"
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
                      if (!nextOn) stopSpeech();
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
