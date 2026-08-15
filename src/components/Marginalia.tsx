import Link from "next/link";
import type { JournalPost } from "@/lib/journal";
import type { Property } from "@/lib/properties";
import { locationLine, propertyHref } from "@/lib/properties";

/**
 * Notes in the margin, in lighter ink — an engineer's annotations beside a
 * drawing rather than a second panel underneath it.
 *
 * The article page already reserves a margin for the contents list. Below the
 * list that column is empty for the whole length of a long guide, and the two
 * things a reader most often wants there — what this piece is about, and which
 * of our projects it bears on — are currently either buried in the body or on
 * the far side of the page.
 *
 * ⚠️ IT SITS IN THE EXISTING MARGIN AND OPENS NO NEW ONE. A second gutter would
 * take width off the measure, and this repo's own note on the Journal is that
 * the measure is what makes the prose readable. Marginalia is a position, not a
 * column of its own.
 *
 * ⚠️ Lighter ink is the point and also the risk: `text-ink-faint` is the
 * lightest token that still clears AA on the canvas, and nothing here may go
 * below it. The LINKS take `text-ink-muted` — a link that is fainter than the
 * prose around it stops reading as a link at all.
 *
 * ⚠️ `related` is filtered by the article's own `related_property_ids`, so it
 * is an editorial decision made in the console, never a guess. Nothing is
 * inferred from tags or from the body text: a note saying "this bears on
 * Edappadi" is a claim, and the site does not make claims it was not given.
 */
export function Marginalia({ post, related }: { post: JournalPost; related: Property[] }) {
  const tags = (post.tags ?? []).filter(Boolean).slice(0, 6);
  if (!tags.length && !related.length) return null;

  return (
    <aside aria-labelledby="marginalia-heading" className="mt-phi4 border-t border-line pt-phi4">
      <h2 id="marginalia-heading" className="ledger-label text-ink-faint">
        In the margin
      </h2>

      {related.length > 0 && (
        <div className="mt-phi3">
          <div className="ledger-label text-ink-faint">Bears on</div>
          <ul className="mt-1.5 space-y-1.5">
            {related.map((p) => (
              <li key={p.id}>
                <Link
                  href={propertyHref(p)}
                  className="rj-underline text-tiny text-ink-muted transition-colors hover:text-champagne-700"
                >
                  {p.project_name ?? p.title}
                  {/* The place, so the link means something to a reader who
                      does not already know the project by name. */}
                  {locationLine(p) && (
                    <span className="text-ink-faint"> · {locationLine(p)}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-phi3">
          <div className="ledger-label text-ink-faint">Subjects</div>
          <p className="mt-1.5 text-tiny leading-relaxed text-ink-faint">
            {/* Set as a run of prose separated by the site's own middot rather
                than as chips. A chip implies a filter behind it, and there is no
                tag route on this site — a row of buttons that do nothing is a
                worse promise than a plain line of subjects. */}
            {tags.join(" · ")}
          </p>
        </div>
      )}
    </aside>
  );
}
