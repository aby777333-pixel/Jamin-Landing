import type { Metadata } from "next";
import { Container, ButtonLink, SectionLabel } from "@/components/ui";
import { MissingParcel } from "@/components/cadastral/MissingParcel";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** §62 — never a blank screen. A 404 still offers the two things a visitor who
 *  landed here almost certainly wants.
 *
 *  2026-08-15: it now also LOOKS like this site. The copy and the two routes
 *  onward were already right; what it had no picture for was the situation, so
 *  it read as the one page nobody had designed. `MissingParcel` draws it in the
 *  cadastral language — a sheet with one lot hatched out and its number
 *  replaced by a query.
 *
 *  ⚠️ The drawing is decoration and the page must read without it: the heading,
 *  the paragraph and both links come first in the DOM and the picture is
 *  `aria-hidden`. On a narrow screen it sits BELOW the copy for the same
 *  reason — a visitor who followed a broken link wants the way out before they
 *  want the illustration. */
export default function NotFound() {
  return (
    <Container className="py-phi7">
      <div className="grid items-center gap-phi5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="max-w-xl">
          <SectionLabel>404</SectionLabel>
          <h1 className="mt-phi2 text-3xl text-ink lg:text-4xl">This page has moved on.</h1>
          <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
            The address you followed does not lead anywhere on Jamin Properties. It may have been an
            older link, or a project that has since been renamed.
          </p>
          <div className="mt-phi4 flex flex-wrap gap-3">
            <ButtonLink href="/properties">Browse properties</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back to home
            </ButtonLink>
          </div>
          {/* The gazetteer is the right third option HERE specifically: somebody
              who followed a dead link to a renamed project is usually looking
              for a PLACE, and that page indexes every place name the site
              knows. It is deliberately a quiet link rather than a third button
              — two buttons is a choice, three is a menu. */}
          <p className="mt-phi3 text-tiny text-ink-faint">
            Looking for a particular place? The{" "}
            <a href="/gazetteer" className="rj-underline text-ink-muted hover:text-champagne-700">
              gazetteer
            </a>{" "}
            lists every district, taluk, town and village on record.
          </p>
        </div>
        {/* `min-w-0` on the grid item: an SVG with a viewBox will happily set a
            track wider than the viewport otherwise — the trap this repo has
            paid for twice. */}
        <div className="min-w-0 text-ink-faint">
          <MissingParcel className="h-auto w-full max-w-lg" />
        </div>
      </div>
    </Container>
  );
}
