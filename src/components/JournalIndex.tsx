"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { matchesQuery, normaliseForSearch } from "@/lib/journal";

/**
 * One article, reduced to what a card renders plus its search haystack.
 *
 * ⚠️ This is the whole reason the shape is not `JournalPost`. The page is a
 * client component from here down, so every field on this type crosses to the
 * browser in the RSC payload — `body` and `faqs` are not fetched by the list
 * query at all, and there is no reason to send `related_property_ids`, the
 * author bio or the raw `seo` object either. What the browser gets is what it
 * draws, plus `hay`, which is a deduplicated word list rather than the prose
 * it was built from.
 */
export type JournalCard = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
  kindLabel: string;
  categoryName: string | null;
  minutes: number | null;
  dateLabel: string | null;
  hay: string;
};

export type JournalCategoryChip = { slug: string; name: string };

/**
 * The Journal index, with search.
 *
 * ⚠️ THE SEARCH IS CLIENT-SIDE ON PURPOSE, and the reason is the route's
 * caching rather than a preference. Reading `searchParams` on the server turns
 * /journal dynamic, which would cost the static prerender the whole section's
 * SEO rests on. Twenty articles filter instantly in the browser, so the
 * server keeps shipping one cached HTML page and the reader still gets an
 * as-you-type result.
 *
 * ⚠️ It is therefore the one control on this page that needs JavaScript. That
 * is acceptable HERE and would not be in the hero console: a reader with no
 * script still gets every article, the categories, the lead story and the
 * grid — search narrows a list that is already fully present. The hero console
 * is the only way into the inventory, which is why that one is a plain GET
 * form with no client bundle at all.
 */
export function JournalIndex({
  posts,
  categories,
}: {
  posts: JournalCard[];
  categories: JournalCategoryChip[];
}) {
  const [query, setQuery] = useState("");
  const searching = normaliseForSearch(query).length > 0;

  const results = useMemo(
    () => (searching ? posts.filter((p) => matchesQuery(p.hay, query)) : posts),
    [posts, query, searching],
  );

  /* Ranked only while searching, and only one way: an article whose TITLE
     carries every term comes first. Anything cleverer would be guessing at
     relevance across twenty articles that all cover adjacent ground. */
  const ranked = useMemo(() => {
    if (!searching) return results;
    const terms = normaliseForSearch(query).split(" ").filter(Boolean);
    const inTitle = (p: JournalCard) => {
      const words = normaliseForSearch(p.title).split(" ");
      return terms.every((t) => words.some((w) => w.startsWith(t))) ? 0 : 1;
    };
    return [...results].sort((a, b) => inTitle(a) - inTitle(b));
  }, [results, query, searching]);

  /* ⚠️ `posts[0]` IS the lead story — the server sorts the editor's featured
     article to the front before handing the list over, so this component never
     needs to carry `is_featured` across just to re-find it. See the note on
     `cards` in the page. */
  const featured = ranked[0] ?? null;
  const rest = ranked.slice(1);

  return (
    <>
      <div className="mt-phi4 flex flex-col gap-phi3 sm:flex-row sm:items-center sm:justify-between">
        <SearchField value={query} onChange={setQuery} />
        {/* ⚠️ The count is announced, not just printed. A filter that changes a
            grid the reader cannot see is silent to a screen reader otherwise —
            `polite` so it waits for a pause in typing rather than interrupting
            every keystroke. */}
        <p className="text-tiny text-ink-muted" aria-live="polite">
          {searching ? (
            <>
              <span className="ledger">{ranked.length}</span> of{" "}
              <span className="ledger">{posts.length}</span> articles
            </>
          ) : (
            <>
              <span className="ledger">{posts.length}</span> articles
            </>
          )}
        </p>
      </div>

      {/* Categories are a second way in, so they step aside while a search is
          running rather than offering a competing filter that would clear it. */}
      {!searching && categories.length > 1 && (
        <nav className="mt-phi3 flex flex-wrap gap-2" aria-label="Journal categories">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/journal/category/${c.slug}`}
              className="group inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-4 py-2 text-tiny font-medium text-jamin-red-deep transition-colors hover:border-jamin-gold hover:bg-jamin-gold-soft"
              style={{ "--rj-stone": "var(--color-jade)" } as React.CSSProperties}
            >
              <span className="rj-dot" aria-hidden="true" />
              {c.name}
              <span
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              >
                &rarr;
              </span>
            </Link>
          ))}
        </nav>
      )}

      {ranked.length === 0 ? (
        <div className="mt-phi5 rounded-card border border-line bg-canvas-alt p-phi4 text-center">
          <h2 className="text-xl text-ink">Nothing matches “{query.trim()}”</h2>
          <p className="mx-auto mt-phi2 max-w-md text-base leading-relaxed text-ink-muted">
            Try a single word — <em>patta</em>, <em>DTCP</em>, <em>encumbrance</em>,{" "}
            <em>advance</em> — or ask the desk directly and we will answer it in writing.
          </p>
          <div className="mt-phi3 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setQuery("")}
              className="rounded-full border border-ink/20 px-6 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink/35"
            >
              Clear the search
            </button>
            <Link
              href="/contact"
              className="rounded-full bg-ink px-6 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-charcoal"
            >
              Ask the desk
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* ⚠️ While searching, the top result is NOT given the lead-story
              treatment. The lead is an editorial decision — the piece the
              Journal is putting forward — and dressing the best keyword match
              in it says something the ranking cannot support. Search returns an
              even grid; the magazine layout returns when the query clears. */}
          {searching ? (
            <section className="mt-phi5">
              <div className="grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
                {ranked.map((p) => (
                  <ArticleCard key={p.id} post={p} />
                ))}
              </div>
            </section>
          ) : (
            <>
              {featured && (
                <section className="mt-phi5">
                  <LeadStory post={featured} />
                </section>
              )}
              {rest.length > 0 && (
                <section className="mt-phi6 border-t border-line pt-phi5">
                  <h2 className="text-2xl text-ink">More from the Journal</h2>
                  <div className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((p) => (
                      <ArticleCard key={p.id} post={p} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}

function SearchField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="relative w-full sm:max-w-md">
      <label htmlFor="journal-q" className="sr-only">
        Search the Journal
      </label>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink-faint"
      >
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="7" cy="7" r="4.5" />
          <path d="m10.5 10.5 3 3" strokeLinecap="round" />
        </svg>
      </span>
      <input
        id="journal-q"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by keyword — patta, DTCP, advance…"
        /* ⚠️ Not `type="text"`: a search input gets the browser's own clear
           affordance and the right on-screen keyboard. It is not inside a
           <form>, so Enter has nothing to submit and the list is already
           filtered by the time the key is pressed. */
        className="h-12 w-full rounded-full border border-line bg-canvas pl-12 pr-5 text-base text-ink placeholder:text-ink-faint focus:border-jamin-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-jamin-gold"
      />
    </div>
  );
}

function LeadStory({ post }: { post: JournalCard }) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group grid items-center gap-phi4 lg:grid-cols-[1.618fr_1fr]"
    >
      {/* ⚠️ The LEAD story alone gets the image's own ratio. A cover is
          frequently a designed infographic, and on the lead it is doing the
          selling — forcing it into a 1.9:1 box cropped the title off the top
          and the strip off the bottom, so the one image a reader actually looks
          at was the one arriving incomplete. */}
      <div className="overflow-hidden rounded-card border border-line bg-canvas-sunken">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.coverAlt ?? post.title}
            width={1200}
            height={630}
            priority
            sizes="(max-width: 1024px) 100vw, 62vw"
            className="h-auto w-full transition-transform duration-[1200ms] group-hover:scale-[1.02]"
            style={{ transitionTimingFunction: "var(--ease-silk)" }}
          />
        ) : (
          <div className="flex aspect-[1.9/1] items-center justify-center text-tiny uppercase tracking-brand text-ink-faint">
            Jamin Journal
          </div>
        )}
      </div>
      <div className="self-center">
        <Meta post={post} />
        <h2 className="mt-phi2 text-2xl text-ink transition-colors group-hover:text-jamin-red-deep lg:text-3xl">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="mt-phi2 text-lg leading-relaxed text-ink-muted">{post.excerpt}</p>
        )}
        <span className="mt-phi3 inline-block text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep">
          Read the guide →
        </span>
      </div>
    </Link>
  );
}

function ArticleCard({ post }: { post: JournalCard }) {
  return (
    <Link
      href={`/journal/${post.slug}`}
      className="group block overflow-hidden rounded-card border border-line bg-canvas shadow-lift transition-all duration-500 hover:-translate-y-1 hover:shadow-raise"
      style={{ transitionTimingFunction: "var(--ease-silk)" }}
    >
      {/* ⚠️ Two reports pulled opposite ways here: one asked for a consistent
          container, the other for images that are not cropped. `contain` inside
          a FIXED box satisfies both — every card is the same height, and no
          cover loses its headline. The padding and ground are what stop the
          letterboxing reading as an accident. */}
      <div className="relative aspect-[1.618/1] overflow-hidden bg-canvas-sunken p-2">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.coverAlt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain transition-transform duration-[1200ms] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-tiny uppercase tracking-brand text-ink-faint">
            Jamin Journal
          </div>
        )}
      </div>
      <div className="p-phi3">
        <Meta post={post} />
        <h3 className="mt-2 text-xl text-ink transition-colors group-hover:text-jamin-red-deep">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1.5 line-clamp-2 text-base text-ink-muted">{post.excerpt}</p>
        )}
      </div>
    </Link>
  );
}

function Meta({ post }: { post: JournalCard }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone="gold">{post.kindLabel}</Badge>
      {post.categoryName && (
        <span className="text-micro uppercase tracking-[0.14em] text-ink-faint">
          {post.categoryName}
        </span>
      )}
      {post.minutes !== null && (
        <span className="text-micro uppercase tracking-[0.14em] text-ink-faint">
          <span className="ledger">{post.minutes}</span> min read
        </span>
      )}
      {post.dateLabel && (
        <span className="text-micro uppercase tracking-[0.14em] text-ink-faint">
          {post.dateLabel}
        </span>
      )}
    </div>
  );
}
