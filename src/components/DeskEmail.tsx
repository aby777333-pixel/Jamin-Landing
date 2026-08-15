"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The Email control from `DeskActions`, with the one thing a bare `mailto:`
 * link cannot do: notice when it did nothing.
 *
 * ⚠️ REPORTED AS "the EMAIL button is not working" (bug report 7). The markup
 * was never wrong — the live anchor is a `mailto:` to whatever address
 * `platform_contacts` holds (`info@jaminbazaar.in` since 2026-08-15),
 * unobstructed, `pointer-events: auto`, and it was verified in place. What
 * fails is the hand-off: if the operating system or the browser profile has no
 * handler registered for `mailto:`, the click is swallowed **silently**. No
 * dialog, no error, no navigation. That is the majority case on a Windows
 * machine with no desktop mail client and a Chrome profile that has never been
 * given a webmail handler — which is exactly the desk's own audience.
 *
 * Call and WhatsApp were reported working beside it for a reason worth keeping
 * in mind before anyone "fixes" this by removing the fallback: `wa.me` is an
 * ordinary https URL, so it can never fail this way, and `tel:` usually has a
 * handler on the machines people browse from. Email is the one action here that
 * depends on software the visitor may simply not have.
 *
 * So the anchor stays a real `mailto:` — right for everybody who does have a
 * client, right for right-click → copy address, right for a crawler — and a
 * timer watches whether the click actually left the page. If the document is
 * still focused and visible a beat later, nothing took the link, and the
 * address is revealed instead with a copy button and a webmail route out.
 *
 * ⚠️ The heuristic can only be wrong in the harmless direction. A handler that
 * DID open steals focus or hides the tab, which cancels the timer; the panel
 * only ever appears when the page is demonstrably still sitting there. And even
 * a false positive costs nothing more than showing an address the visitor was
 * trying to reach anyway.
 */

/** Long enough for a protocol handler to take focus, short enough that a dead
 *  click still feels answered rather than ignored. */
const HANDOFF_GRACE_MS = 1200;

export function DeskEmail({
  email,
  className,
  context,
  url,
}: {
  email: string;
  className: string;
  /** The project being asked about, when there is one — same prefill argument
   *  as the WhatsApp text (§95): "Hi" tells the desk nothing. */
  context?: string;
  url?: string;
}) {
  const [stranded, setStranded] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subject = context ? `Enquiry — ${context}` : "Enquiry — Jamin Properties";
  const body = context
    ? `Hello Jamin Properties — I'm interested in ${context}.${url ? `\n${url}` : ""}\n\n`
    : "Hello Jamin Properties — I'd like to know more about your plots.\n\n";
  const href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  /** Gmail's compose URL, for the very common case of a visitor whose mail is
   *  in a browser tab rather than in an application. Same recipient, same
   *  prefill, so the two routes cannot disagree. */
  const webmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    email,
  )}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => {
    // Either of these means something outside the page took the click.
    const onHidden = () => {
      if (document.visibilityState === "hidden") cancel();
    };
    window.addEventListener("blur", cancel);
    document.addEventListener("visibilitychange", onHidden);
    return () => {
      cancel();
      window.removeEventListener("blur", cancel);
      document.removeEventListener("visibilitychange", onHidden);
    };
  }, [cancel]);

  function onClick() {
    // Deliberately NOT preventDefault — the browser still tries the handler,
    // and on a machine that has one this component never shows itself.
    cancel();
    timer.current = setTimeout(() => {
      if (document.visibilityState === "visible" && document.hasFocus()) setStranded(true);
    }, HANDOFF_GRACE_MS);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied("Address copied");
    } catch {
      setCopied("Could not copy — select the address instead");
    }
    setTimeout(() => setCopied(null), 2400);
  }

  return (
    <>
      <a
        href={href}
        onClick={onClick}
        className={className}
        /* The visible label is one word, so the address has to reach a screen
           reader some other way. */
        aria-label={`Email ${email}`}
      >
        Email
      </a>

      {stranded && (
        /* `w-full` so it takes its own line in the wrapping row of buttons
           rather than squeezing in beside them. */
        <div
          className="rj-deboss w-full rounded-xl border border-line bg-canvas-alt p-phi3"
          aria-live="polite"
        >
          <p className="text-tiny text-ink-muted">
            This device has no mail app set up, so nothing opened. Write to us at:
          </p>
          <p className="mt-phi2 select-all break-all text-base font-semibold text-ink">{email}</p>
          <div className="mt-phi2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center justify-center rounded-full border border-line bg-canvas px-4 py-2 text-micro font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink-faint"
            >
              Copy address
            </button>
            <a
              href={webmail}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-line bg-canvas px-4 py-2 text-micro font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink-faint"
            >
              Open in Gmail
            </a>
          </div>
          {copied && <p className="mt-phi2 text-micro text-ink-muted">{copied}</p>}
        </div>
      )}
    </>
  );
}
