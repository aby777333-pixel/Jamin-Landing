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
        <nav className="mt-phi4" aria-label="Journal categories">
          {/* 🚨 THE RAIL HAS A NAME NOW (report 7, 2026-08-19: "add a clear
              Categories or related heading above the category navigation").
              A row of arrowed pills under a hero reads as breadcrumbs or as
              filters; the word is what tells a reader these are places to go.
              `id` + `aria-labelledby` so the nav announces itself by the same
              word it shows, instead of by a label only a screen reader hears. */}
          {/* 🚨 LEFT, overriding `.rj-eyebrow`'s central `text-align: right`
              (report 10, 2026-08-20: "move the Categories heading and category
              buttons to the left side and align them with the main
              content/search area"). The pills below were always left — only
              this label sat right, so the rail read as two blocks. The
              captions-right rule already splits by role (SectionLabel went
              left 2026-08-18); this label now follows the control row it
              names. Inline style rather than a utility because the class sets
              alignment centrally and utility order is not a contract. */}
          <h2
            id="journal-categories"
            className="rj-eyebrow text-jamin-gold-ink"
            style={{ textAlign: "left" }}
          >
            Categories
          </h2>
          <div className="mt-phi2 flex flex-wrap gap-2" aria-labelledby="journal-categories">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/journal/category/${c.slug}`}
              /* ⚠️ `min-h-[44px]` + `whitespace-nowrap` (same report: "keep all
                 category buttons equal in height and consistent in size"). The
                 padding was already identical, so the pills only ever differed
                 when a two-word category wrapped inside one — which made that
                 pill twice as tall as its neighbours and dragged the whole row
                 with it. `nowrap` removes the cause, the min-height guarantees
                 the floor, and 44px is the tap target this site keeps to. */
              className="group inline-flex min-h-[44px] items-center gap-2 whitespace-nowrap rounded-full border border-line bg-canvas px-4 py-2 text-tiny font-medium text-jamin-red-deep transition-colors hover:border-jamin-gold hover:bg-jamin-gold-soft"
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
          </div>
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
      /* 🚨 `flex h-full flex-col` (report 7, 2026-08-19: "keep all article
         cards the same overall size and structure… do not allow individual
         cards to become taller or shorter based on title length").

         The image was already a fixed 2/1 box — that half was solved on
         2026-08-13. What still varied was the TEXT: an unclamped `h3` runs one
         line for "Buying land" and three for a full sentence, so cards in the
         same row ended at different heights and the grid row stretched to the
         tallest, leaving the short ones with dead space under the excerpt.

         Three things together make the shape fixed, and all three are needed:
         `h-full` so the card fills whatever height its grid row has, a clamp
         AND a reserved minimum on both text blocks so the content cannot ask
         for more or less than two lines, and `flex-1` on the body so any
         remainder collects in one predictable place rather than under the
         title. */
      className="group flex h-full flex-col overflow-hidden rounded-card border border-line bg-canvas shadow-lift transition-all duration-500 hover:-translate-y-1 hover:shadow-raise"
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
      {/* Aesthetics item 21: `rj-pageturn` — the cover lifts a corner on
          hover, the dog-ear made literal. Rides the IMAGE BOX (the card
          root's pseudos belong to its own chrome). */}
      {/* `shrink-0` — in a flex column the image box would otherwise be
          squeezed by a tall body and stop being the fixed 2/1 it exists to be. */}
      <div className="rj-sheen rj-pageturn relative aspect-[2/1] shrink-0 overflow-hidden">
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
      <div className="flex flex-1 flex-col p-phi3">
        <Meta post={post} />
        {/* ⚠️ `min-h` AS WELL AS `line-clamp`, and in `em` so it tracks the
            type scale. The clamp stops a long title growing; only the minimum
            stops a short one shrinking, and a card is uneven either way. Two
            lines at this leading is 2.5em. */}
        <h3 className="mt-2 line-clamp-2 min-h-[2.5em] text-xl text-ink transition-colors group-hover:text-jamin-red-deep">
          {post.title}
        </h3>
        {/* ⚠️ RENDERED EVEN WHEN EMPTY. Conditionally omitting it is what let a
            post with no excerpt sit 3em shorter than its neighbours — the exact
            variance the report is about. The element reserves the space; with
            no text there is nothing to announce, so nothing is read out. */}
        <p className="mt-1.5 line-clamp-2 min-h-[3em] text-base text-ink-muted">
          {post.excerpt ?? ""}
        </p>
      </div>
    </Link>
  );
}

/* Anti-beige item 3: each Journal category wears its own stone — a wash pill
   with the category's ink, keyed DETERMINISTICALLY from the name so a new
   console-authored category gets a stable colour without a code change. The
   named ones are pinned to read meaningfully; the hash covers the rest. Every
   ink here is an audited text cousin, never a fill. */
const CATEGORY_STONE: Record<string, { stone: string; ink: string }> = {
  "buying land": { stone: "var(--color-emerald)", ink: "var(--color-emerald-deep)" },
  "legal guides": { stone: "var(--color-sapphire)", ink: "var(--color-sapphire)" },
  "location guides": { stone: "var(--color-amethyst)", ink: "var(--color-amethyst)" },
  "investment": { stone: "var(--color-jamin-gold)", ink: "var(--color-jamin-gold-ink)" },
};
const STONE_POOL: { stone: string; ink: string }[] = [
  { stone: "var(--color-ruby)", ink: "var(--color-ruby)" },
  { stone: "var(--color-emerald)", ink: "var(--color-emerald-deep)" },
  { stone: "var(--color-sapphire)", ink: "var(--color-sapphire)" },
  { stone: "var(--color-amethyst)", ink: "var(--color-amethyst)" },
  { stone: "var(--color-topaz)", ink: "var(--color-jamin-gold-ink)" },
];
function categoryStone(name: string) {
  const key = name.trim().toLowerCase();
  if (CATEGORY_STONE[key]) return CATEGORY_STONE[key];
  let h = 5381;
  for (let i = 0; i < key.length; i++) h = (h * 33 + key.charCodeAt(i)) >>> 0;
  return STONE_POOL[h % STONE_POOL.length];
}

/**
 * 🚨 TWO FIXED ROWS, NOT ONE WRAPPING ROW (report 7, 2026-08-19: "maintain
 * consistent image dimensions, card height, title area, and metadata placement
 * across every article card").
 *
 * This was `flex flex-wrap` carrying up to four items — a kind badge, a
 * category chip, a reading time and a date. Three of them fit on one line and
 * four do not, so a single post with all four ("Project story · Project
 * Stories · 11 min read · 11 August 2026") wrapped to a second line and stood
 * 27px taller than the other thirty-eight cards in the grid. Measured: 46px
 * against 72px.
 *
 * ⚠️ THE FIX IS A SECOND ROW THAT IS ALWAYS THERE, not a reserved minimum on
 * one. Both make the cards equal; only this one puts something in the space.
 * A `min-h` sized to the worst case would have added 26px of white to
 * thirty-eight cards to accommodate one — which is the "excessive empty space"
 * this same report objects to two items further down.
 *
 * ⚠️ The rows are chips-then-facts, and that split is why it can never wrap
 * again: row one holds at most two short pills, row two at most two short
 * phrases. Adding a THIRD chip would reopen the bug.
 *
 * ⚠️ `min-h` on row two, because a post with neither a reading time nor a date
 * would otherwise collapse it and take the card back down with it.
 */
function Meta({ post }: { post: JournalCard }) {
  const cat = post.categoryName ? categoryStone(post.categoryName) : null;
  return (
    <div className="flex flex-col gap-1.5">
      {/* ⚠️ `flex-nowrap` + `min-w-0` + `truncate`, ALL THREE. Splitting the
          meta into two rows fixed most of the variance but not this: a post
          whose kind and category are both long ("Project story" + "Project
          Stories") still overflowed row one and wrapped it, standing 15px
          taller than the other thirty-eight. `truncate` alone does nothing
          inside a flex row — the item's default `min-width: auto` lets it push
          the row wider rather than ellipsing — which is the same trap this repo
          has paid for in the footer's district column and the account sidebar.
          The badge is `shrink-0` because the kind is the one word that must
          never be cut; the category ellipses instead. */}
      <div className="flex min-w-0 flex-nowrap items-center gap-2">
        <span className="shrink-0">
          <Badge tone="gold">{post.kindLabel}</Badge>
        </span>
        {post.categoryName && cat && (
          <span
            className="min-w-0 truncate rounded-full px-2 py-0.5 text-micro font-semibold uppercase tracking-[0.14em]"
            style={{
              color: cat.ink,
              background: `color-mix(in srgb, ${cat.stone} 13%, transparent)`,
            }}
          >
            {post.categoryName}
          </span>
        )}
      </div>
      <div className="flex min-h-[1.1rem] items-center gap-2 text-micro uppercase tracking-[0.14em] text-ink-faint">
        {post.minutes !== null && (
          <span>
            <span className="ledger">{post.minutes}</span> min read
          </span>
        )}
        {post.dateLabel && <span>{post.dateLabel}</span>}
      </div>
    </div>
  );
}
