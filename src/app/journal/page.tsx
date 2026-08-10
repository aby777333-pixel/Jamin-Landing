import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { JournalIndex, type JournalCard } from "@/components/JournalIndex";
import {
  KIND_LABEL,
  buildSearchIndex,
  getJournalCategories,
  getJournalPosts,
  publishedLabel,
  readingMinutes,
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
 *
 * ⚠️ This page is now a DATA PREPARATION step and nothing else: it reads,
 * reduces each article to what a card draws plus a search haystack, and hands
 * the list to `JournalIndex`. The markup moved there rather than being
 * duplicated, because the search has to be able to re-order and replace the
 * layout — a client component that could only render a second list beside the
 * server's would have left two versions of every card to keep in step.
 */
export default async function JournalPage() {
  const [posts, categories] = await Promise.all([getJournalPosts(), getJournalCategories()]);

  const used = new Set(posts.map((p) => p.blog_categories?.slug).filter(Boolean));

  /* ⚠️ The editor's featured article is sorted to the FRONT here, on the
     server, and that is the whole contract with JournalIndex: it treats
     `posts[0]` as the lead. Doing it here keeps `is_featured` out of the
     payload and keeps the editorial decision on the server side, where the
     rest of the article's ordering already lives. */
  const ordered = [...posts].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

  const cards: JournalCard[] = ordered.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverUrl: p.cover_url,
    coverAlt: p.cover_alt,
    kindLabel: KIND_LABEL[p.kind] ?? p.kind,
    categoryName: p.blog_categories?.name ?? null,
    minutes: readingMinutes(p),
    dateLabel: publishedLabel(p),
    hay: buildSearchIndex(p),
  }));

  return (
    <>
      {/* `cinematic` — the tone is a property of the artwork, not of the page.
          hero-25 is a photograph with real tonal range, which is the case
          `veil` and the `gilt` plate exist for. */}
      <PageHero
        art={25}
        tone="cinematic"
        sheer
        /* ⚠️ The lightest plate on the site, and the only frame that allows it.
           Deep shade under the banyan, so it takes almost no tint AND almost no
           blur: at 8px / 0.10 it measures white 4.97 and gold 4.60. Every other
           hero has to choose — a sharp picture costs tint (the Vault needs 0.50
           at this blur), a light tint costs sharpness. This one needs neither.
           See `.rj-gilt-sheer`. */
        sheerAlpha={0.02}
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
          <JournalIndex
            posts={cards}
            /* Only categories that actually hold something. */
            categories={categories
              .filter((c) => used.has(c.slug))
              .map((c) => ({ slug: c.slug, name: c.name }))}
          />
        )}
      </Container>
    </>
  );
}
