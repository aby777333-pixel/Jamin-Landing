import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink, Badge } from "@/components/ui";
import {
  KIND_LABEL,
  getJournalCategories,
  getJournalPosts,
  journalHref,
  publishedLabel,
  readingMinutes,
  type JournalPost,
} from "@/lib/journal";

/** 60s, not the site-wide hour. The Journal is the one section edited daily,
 *  and an hour between pressing Publish and seeing the article reads as the
 *  publish having failed — it sent the owner back to redeploy three times in a
 *  single afternoon. Property records change far less often and keep the hour. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Jamin Journal",
  description:
    "Guides and explainers from Jamin Properties: what to check before buying a plot in Tamil Nadu, what the approvals mean, and how the documents fit together.",
  alternates: { canonical: "/journal" },
};

/**
 * §141 — an editorial landing page, not a grid of rectangles. The lead story
 * takes the width; the rest reads as a magazine contents page.
 */
export default async function JournalPage() {
  const [posts, categories] = await Promise.all([getJournalPosts(), getJournalCategories()]);

  const featured = posts.find((p) => p.is_featured) ?? posts[0] ?? null;
  const rest = posts.filter((p) => p.id !== featured?.id);
  const used = new Set(posts.map((p) => p.blog_categories?.slug).filter(Boolean));

  return (
    <>
      {/* `cinematic` — the tone is a property of the artwork, not of the page.
          hero-09 was a graphic render on near-white and had to keep its words
          off the image; hero-23 is a photograph with real tonal range, which is
          the case `veil` and the `gilt` plate exist for.

          hero-23 also happens to be the only frame in the set that shows what
          this section is actually about: villas, a plotted layout and apartment
          towers in one view. The Journal's most-read piece compares exactly
          those three. ⚠️ Which is why the towers are not a mistake here and
          must not be "corrected" — they are the Journal's subject, not a claim
          that the company builds them. */}
      <PageHero
        art={25}
        tone="cinematic"
        sheer
        /* ⚠️ 0.10, not the 0.32 the Vault needs. This frame is deep shade under
           the banyan and clears AA at NO tint at all (white 6.09, gold 5.64);
           0.10 is a hint of body, not a scrim. See `.rj-gilt-sheer`. */
        sheerAlpha={0.1}
        eyebrow="Jamin Journal"
        title="Land, and the things worth knowing before you decide."
        lead="Patta, chitta, encumbrance, DTCP approval — buying land means meeting a set of documents most people see only once. These are our notes on them, written plainly and kept current."
      />
      <Container className="py-phi5">

      {posts.length === 0 ? (
        <div className="mt-phi5">
          <EmptyState
            title="The first pieces are being written"
            body="Jamin Journal opens shortly with guides on patta and chitta, what DTCP approval actually certifies, and a plot-buying checklist. Until then, the sales desk will answer any of it directly."
            action={
              <>
                <ButtonLink href="/properties" variant="secondary">
                  Browse properties
                </ButtonLink>
                <ButtonLink href="/contact">Ask the desk</ButtonLink>
              </>
            }
          />
        </div>
      ) : (
        <>
          {/* categories that actually hold something */}
          {categories.filter((c) => used.has(c.slug)).length > 1 && (
            <nav className="mt-phi4 flex flex-wrap gap-2" aria-label="Journal categories">
              {categories
                .filter((c) => used.has(c.slug))
                .map((c) => (
                  <Link
                    key={c.slug}
                    href={`/journal/category/${c.slug}`}
                    /* These read as static labels: no arrow, no colour, nothing
                       that says a category can be opened. A gold hairline and a
                       chevron give the affordance without turning the row into
                       a set of buttons. */
                    /* ⚠️ The gem now carries the affordance the note above
                       describes, so the row matches the nav tabs and the
                       property filters instead of inventing a third look for
                       the same job. Jade is the Journal's stone; the arrow
                       stays because a category genuinely opens a page. */
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
      </Container>
    </>
  );
}

function LeadStory({ post }: { post: JournalPost }) {
  return (
    <Link
      href={journalHref(post)}
      className="group grid items-center gap-phi4 lg:grid-cols-[1.618fr_1fr]"
    >
      {/* ⚠️ The LEAD story alone gets the image's own ratio.
          A cover is frequently a designed infographic, and on the lead it is
          doing the selling — forcing it into a 1.9:1 box cropped the title off
          the top and the strip off the bottom, so the one image a reader
          actually looks at was the one arriving incomplete. The small cards
          below keep `object-cover`, because there the job is a tidy grid and
          the whole picture is a click away. */}
      <div className="overflow-hidden rounded-card border border-line bg-canvas-sunken">
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.cover_alt ?? post.title}
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

function ArticleCard({ post }: { post: JournalPost }) {
  return (
    <Link
      href={journalHref(post)}
      className="group block overflow-hidden rounded-card border border-line bg-canvas shadow-lift transition-all duration-500 hover:-translate-y-1 hover:shadow-raise"
      style={{ transitionTimingFunction: "var(--ease-silk)" }}
    >
      <div className="relative aspect-[1.618/1] overflow-hidden bg-canvas-sunken">
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={post.cover_alt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            /* ⚠️ `object-contain`, not cover. The note on the lead story above
               explains why a cover here is usually a designed infographic;
               what it got wrong is assuming the small cards could still crop
               one. They cannot — cropping a graphic whose whole content is
               type cuts the headline off the top and the strip off the bottom,
               which is what was reported. The box keeps its fixed ratio so the
               grid stays even, and `bg-canvas-sunken` letterboxes what is left
               over. */
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

function Meta({ post }: { post: JournalPost }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone="gold">{KIND_LABEL[post.kind] ?? post.kind}</Badge>
      {post.blog_categories && (
        <span className="text-micro uppercase tracking-[0.14em] text-ink-faint">
          {post.blog_categories.name}
        </span>
      )}
      {readingMinutes(post) !== null && (
        <span className="text-micro uppercase tracking-[0.14em] text-ink-faint">
          <span className="ledger">{readingMinutes(post)}</span> min read
        </span>
      )}
      {publishedLabel(post) && (
        <span className="text-micro uppercase tracking-[0.14em] text-ink-faint">
          {publishedLabel(post)}
        </span>
      )}
    </div>
  );
}
