import type { Metadata } from "next";
import { Container, ButtonLink, SectionLabel } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/** §62 — never a blank screen. A 404 still offers the two things a visitor who
 *  landed here almost certainly wants. */
export default function NotFound() {
  return (
    <Container className="py-phi7">
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
      </div>
    </Container>
  );
}
