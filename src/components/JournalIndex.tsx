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
      /* ⚠️ 1.2fr, down from 1.618fr — and the ratio ALONE does not fix this.
         Reported as the two halves being different heights, which they were:
         measured at 1440, the picture came out 721x360 beside 445x555 of text,
         a 194px overhang.

         Swept the ratio on the live page first, because the obvious move is to
         change it and stop. It does not work. The picture's height falls
         LINEARLY with its column (height = width / 2.0), while the text's falls
         in line-steps and hits a floor around 355px however wide it gets — so
         every ratio from 1.618fr down to 1fr_1.618fr left a 130-190px gap, and
         the narrow end just made the picture small as well as unbalanced.

         What actually closes it is bounding the text: `line-clamp-3` on the
         excerpt below. Measured together at 1440 — 1.2fr + clamp 3 gives 318
         against 339, a 21px residual that `items-center` splits to about 10px
         at each end. */
      className="group grid items-center gap-phi4 lg:grid-cols-[1.2fr_1fr]"
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
        {/* Clamped for the same reason as the excerpt: this block's height has
            to be bounded or the balance holds only for today's lead story. Four
            lines fits every headline in the table and leaves the cap doing
            nothing most days. */}
        <h2 className="mt-phi2 line-clamp-4 text-2xl text-ink transition-colors group-hover:text-jamin-red-deep lg:text-3xl">
          {post.title}
        </h2>
        {post.excerpt && (
          /* ⚠️ THE CLAMP IS THE HALF THAT DOES THE WORK — see the note on the
             grid above. Unclamped, the excerpt is whatever the editor wrote and
             the column simply runs past the picture; no column ratio can
             balance against an unbounded height. Three lines, where the article
             cards below use two: the lead gets one more, not a different rule. */
          <p className="mt-phi2 line-clamp-3 text-lg leading-relaxed text-ink-muted">
            {post.excerpt}
          </p>
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
      {/* 🚨 2/1 AND `object-cover object-left-top`, AND EVERY PART OF THAT IS A
          MEASUREMENT.

          Two reports pulled opposite ways: one asked for a consistent
          container, the other for covers that are not cropped. This shipped as
          `object-contain` in a 1.618 box, which satisfied neither in the end —
          the CONTAINER was identical but the PICTURE inside it was not, because
          a contained image only touches the box on its long axis. The covers run
          1.50:1 to 2.34:1, so a 2.34 cover sat 31% shorter than a 1.50 one with
          a band of sunken canvas above and below it. Reported 2026-08-13 as
          "different cards have different image heights", and it was.

          `cover` is the only fit that makes the picture itself identical, so the
          question became where to spend the crop. Measured over the published
          covers rather than guessed:

            box 1.618 + centre  the 2.34 covers lose 31% of their width, half
                                off each side — "What Does a Property Buyer…"
                                came back as "…oes a …perty Buyer". Unusable:
                                these covers ARE headlines.
            box 2/1  + centre   15% off a 2.34 cover, still clipping its first
                                glyph.
            box 2/1  + LEFT     the crop comes off the RIGHT only. Every
                                headline and every JAMIN BAZAAR lockup survives
                                on all six covers checked.

          2/1 because it is the dominant native ratio in the set — most covers
          are exactly 1774x887 and crop by nothing at all. `object-left` because
          these are designed banners with the type on the left; a photograph
          whose subject sits right would want the opposite, and if the covers
          ever change character this is the line to re-check.

          The `p-2` mat and the sunken ground went with the letterbox they
          existed to excuse.

          ⚠️ `-top` WAS ADDED 2026-08-14, AND IT OVERTURNS THE CLAIM ABOVE THAT
          "every JAMIN BAZAAR lockup survives". That was true of the six covers
          on the table at the time. Re-measured across all 29 published covers:

            2.000  11 covers  1774x887   crop nothing
            1.500   9 covers  1536x1024  lose 12.5% off the top AND the bottom
            1.777   4 covers  1672x941   lose 5.6% off each
            1.874   1 cover              lose 3.1% off each
            >2.0    4 covers             crop off the RIGHT only, as before

          So 14 of 29 were losing their top edge, because `object-left` sets
          `left CENTER` — the horizontal anchor was chosen deliberately and the
          vertical one came along as a default nobody picked. On a 1.5 cover
          that centred band cut the headline in half: `what-is-dtcp-approval`
          rendered as "IN PLAIN LANGUAGE" with the words "DTCP APPROVAL,"
          outside the box, and `what-is-patta` as a bare "DO NOT MATCH?".
          Reported 2026-08-14 as content clipping, priority high.

          ⚠️ AND THE LOCKUP IS AT THE TOP ON THIS GENERATION OF COVERS, not the
          bottom — five of the 1.5s carry JAMIN BAZAAR in the top-left corner,
          so the centred crop was destroying the brand mark the old note thought
          it was protecting. What `-top` spends instead is the bottom furniture:
          icon strips, footer straplines, small print. Checked frame by frame
          against every tall cover before taking it.

          The horizontal half is UNCHANGED — wide covers still crop off the
          right only. If a cover ever arrives with its subject at the bottom,
          this is the line to re-check, and re-render the comparison rather than
          reasoning about it. */}
      <div className="relative aspect-[2/1] overflow-hidden">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.coverAlt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover object-left-top transition-transform duration-[1200ms] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-canvas-sunken text-tiny uppercase tracking-brand text-ink-faint">
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
