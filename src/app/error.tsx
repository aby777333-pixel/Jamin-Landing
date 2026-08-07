"use client";

import { useEffect } from "react";
import { Container, ButtonLink, SectionLabel } from "@/components/ui";

/**
 * §62 — the server-error state. A property site that shows a stack trace, or
 * nothing at all, loses the visitor for good. The retry is real: `reset()`
 * re-renders the segment, which is usually enough when Supabase blipped.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Console only — no third-party reporter is wired up yet, and shipping one
    // silently would be a privacy decision nobody asked for.
    console.error("Unhandled error on Jamin Properties:", error);
  }, [error]);

  return (
    <Container className="py-phi7">
      <div className="max-w-xl">
        <SectionLabel>Something went wrong</SectionLabel>
        <h1 className="mt-phi2 text-3xl text-ink lg:text-4xl">
          We could not load this page.
        </h1>
        <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
          This is on us, not on you. Try again — and if it keeps happening, the sales desk can
          answer anything you were looking for here.
        </p>
        <div className="mt-phi4 flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-jamin-red px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep hover:shadow-raise"
          >
            Try again
          </button>
          <ButtonLink href="/contact" variant="secondary">
            Contact the desk
          </ButtonLink>
        </div>
        {error.digest ? (
          <p className="mt-phi3 text-tiny text-ink-faint">Reference: {error.digest}</p>
        ) : null}
      </div>
    </Container>
  );
}
