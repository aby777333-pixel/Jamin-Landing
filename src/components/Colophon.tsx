import { publishedLabel, readingMinutes, type JournalPost } from "@/lib/journal";

/**
 * The colophon: the note at the end of a book that says how it was made.
 *
 * The Journal has 33 articles and ends each one on a bare paragraph. A closing
 * record — who wrote it, when it was published, when it was last checked, how
 * long it runs, and what it is set in — is what separates a publisher from a
 * blog, and every field here is one the site already holds.
 *
 * ⚠️ ONLY WHAT IS RECORDED. No "edition", no "printed by", no ISBN — the
 * conventions a real colophon carries that this document does not have. The
 * same rule as the title block: a made-up publishing record is a forgery, and a
 * shorter true one reads better anyway.
 *
 * ⚠️ `reviewed_at` is drawn ONLY when it is later than publication. On this
 * schema an unreviewed article can carry a `reviewed_at` equal to its
 * `published_at`, and "Reviewed 12 Aug 2026 · Published 12 Aug 2026" claims a
 * check that never happened — on a site whose subject is legal diligence, that
 * is the worst possible line to get wrong.
 */
export function Colophon({ post }: { post: JournalPost }) {
  const published = publishedLabel(post);
  const minutes = readingMinutes(post);

  const fmt = (iso: string) =>
    new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));

  /* A revision is only a revision if it happened after publication — and a day
     of slack, because an edit an hour after publishing is the publishing. */
  const revised =
    post.reviewed_at && post.published_at
      ? new Date(post.reviewed_at).getTime() - new Date(post.published_at).getTime() > 864e5
        ? fmt(post.reviewed_at)
        : null
      : null;

  const entries: [string, string][] = [];
  if (post.blog_authors?.name) entries.push(["Written by", post.blog_authors.name]);
  if (published) entries.push(["Published", published]);
  if (revised) entries.push(["Last reviewed", revised]);
  if (minutes !== null) entries.push(["Extent", `${minutes} min read`]);

  if (entries.length < 2) return null;

  return (
    <section
      aria-labelledby="colophon-heading"
      className="rj-deboss mt-phi5 rounded-card border border-line bg-canvas-alt px-phi3 py-phi4"
    >
      <h2 id="colophon-heading" className="ledger-label text-ink-muted">
        Colophon
      </h2>
      <dl className="mt-phi3 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map(([term, value]) => (
          <div key={term}>
            <dt className="ledger-label text-ink-faint">{term}</dt>
            <dd className="ledger mt-0.5 text-tiny text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      {/* The one line a colophon always carries, and the one this document can
          state without inventing anything: what it is set in. Inter is the only
          face on the site, which is itself the design decision worth recording. */}
      <p className="mt-phi3 border-t border-line pt-phi3 text-micro text-ink-faint">
        Set in Inter. Published by Jamin Properties, Tamil Nadu.
      </p>
    </section>
  );
}
