import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Container, SectionLabel, Badge, ButtonLink } from "@/components/ui";
import { Prose, extractHeadings } from "@/components/Prose";
import { ZoomableImage } from "@/components/cadastral/ZoomableImage";
import { TableOfContents } from "@/components/cadastral/TableOfContents";
import { ReadingRule } from "@/components/ReadingRule";
import { RunningHead } from "@/components/RunningHead";
import { Marginalia } from "@/components/Marginalia";
import { Colophon } from "@/components/Colophon";
import { PropertyCard } from "@/components/PropertyCard";
import {
  KIND_LABEL,
  getJournalPost,
  getJournalPosts,
  getJournalRedirect,
  journalHref,
  publishedLabel,
  readingMinutes,
  type JournalPost,
} from "@/lib/journal";
import { getProperties } from "@/lib/properties";
import { SITE_URL } from "@/lib/supabase";

/** 60s — see the note in journal/page.tsx. An edited article should not need a
 *  redeploy to appear. */
export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getJournalPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getJournalPost(slug);
  if (!p) return { title: "Article not found" };

  const title = p.seo?.title ?? p.title;
  const description = p.seo?.description ?? p.excerpt ?? undefined;
  const image = p.seo?.og_image ?? p.cover_url ?? undefined;

  return {
    title,
    description,
    alternates: { canonical: p.seo?.canonical ?? journalHref(p) },
    robots: p.seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: "article",
      url: `${SITE_URL}${journalHref(p)}`,
      title,
      description,
      publishedTime: p.published_at ?? undefined,
      modifiedTime: p.updated_at ?? undefined,
      images: image ? [{ url: image, width: 1200, height: 630, alt: p.cover_alt ?? p.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

/** §170 — real fields only. No author or image is emitted if none exists. */
function articleSchema(p: JournalPost) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.seo?.description ?? p.excerpt ?? undefined,
    url: `${SITE_URL}${journalHref(p)}`,
    datePublished: p.published_at ?? undefined,
    dateModified: p.updated_at ?? p.published_at ?? undefined,
    image: p.cover_url ?? undefined,
    publisher: {
      "@type": "Organization",
      name: "Jamin Properties",
      url: SITE_URL,
    },
  };
  if (p.blog_authors) {
    schema.author = { "@type": "Person", name: p.blog_authors.name };
  }
  return schema;
}

/** §149 — FAQ structured data only when the article genuinely carries FAQs. */
function faqSchema(p: JournalPost) {
  if (!p.faqs?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: p.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default async function JournalArticle({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const post = await getJournalPost(slug);

  // §158 — a renamed article keeps its indexed address working.
  if (!post) {
    const to = await getJournalRedirect(slug);
    if (to) permanentRedirect(`/journal/${to}`);
    notFound();
  }

  const headings = extractHeadings(post.body ?? "");
  const faq = faqSchema(post);

  const [allPosts, allProperties] = await Promise.all([getJournalPosts(), getProperties()]);
  const related = allProperties.filter((x) => post.related_property_ids?.includes(x.id));
  const more = allPosts
    .filter((x) => x.id !== post.id)
    .filter((x) => !post.blog_categories || x.blog_categories?.slug === post.blog_categories.slug)
    .slice(0, 3);

  return (
    <Container className="py-phi5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema(post)) }}
      />
      {faq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      )}

      <nav aria-label="Breadcrumb" className="text-tiny text-ink-faint">
        <Link href="/journal" className="hover:text-jamin-red-deep">
          Jamin Journal
        </Link>
        {post.blog_categories && (
          <>
            <span className="px-2">/</span>
            <Link
              href={`/journal/category/${post.blog_categories.slug}`}
              className="hover:text-jamin-red-deep"
            >
              {post.blog_categories.name}
            </Link>
          </>
        )}
      </nav>

      {/* Verso the work, recto the chapter — for a guide that runs past twenty
          screens and whose title scrolls away in the first one. */}
      <RunningHead title={post.title} headings={headings} />

      <article className="mt-phi3">
        {/* ⚠️ FULL WIDTH ON PURPOSE, and it does NOT contradict §142's measure
            rule below. `max-w-3xl` here capped the headline at 48rem inside a
            75rem container, so a four-line title and its standfirst sat in the
            left two-thirds with the right third empty — the reader met a column
            before they met the piece. A headline is display type, read in one
            glance rather than line by line, so the measure that protects body
            copy costs it nothing and buys back the space. The body still wraps
            at 68ch; that cap is the one that matters and it stays. */}
        <header>
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="gold">{KIND_LABEL[post.kind] ?? post.kind}</Badge>
            {readingMinutes(post) !== null && (
              <span className="text-micro uppercase tracking-[0.14em] text-ink-faint">
                <span className="ledger">{readingMinutes(post)}</span> min read
              </span>
            )}
          </div>
          <h1 className="mt-phi2 text-3xl text-ink lg:text-4xl">{post.title}</h1>
          {/* `rj-standfirst` sets the FIRST LINE in small caps — the way a
              magazine opens a piece, and free of markup because `::first-line`
              follows the text however it re-wraps. */}
          {post.excerpt && (
            <p className="rj-standfirst mt-phi3 text-lg leading-relaxed text-ink-muted">
              {post.excerpt}
            </p>
          )}

          {/* §134 — who wrote it, who checked it, and when. */}
          <dl className="mt-phi3 flex flex-wrap gap-x-phi4 gap-y-2 border-y border-line py-phi2 text-tiny">
            {post.blog_authors && (
              <div>
                <dt className="inline text-ink-faint">Written by </dt>
                <dd className="inline text-ink">{post.blog_authors.name}</dd>
              </div>
            )}
            {publishedLabel(post) && (
              <div>
                <dt className="inline text-ink-faint">Published </dt>
                <dd className="ledger inline text-ink">{publishedLabel(post)}</dd>
              </div>
            )}
            {post.reviewed_at && (
              <div>
                <dt className="inline text-ink-faint">Information reviewed </dt>
                <dd className="inline text-ink">
                  {new Date(post.reviewed_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </dd>
              </div>
            )}
          </dl>
        </header>

        {post.cover_url && (
          /* Never cropped, and openable. Covers are often dense infographics —
             a 21-step checklist in 10px type — which at column width is
             decoration rather than something a buyer can read. */
          <div className="mt-phi4">
            {/* ⚠️ Capped. An uncropped 2000x2800 infographic ran for two full
                screens before the article even began, so the reader met the
                picture instead of the piece. The cap is on the IMAGE, not the
                container, so nothing is cropped — it is scaled down, and the
                viewer is where it gets read at full size. */}
            <ZoomableImage
              src={post.cover_url}
              alt={post.cover_alt ?? post.title}
              priority
              imageClassName="max-h-[70vh] w-auto mx-auto"
            />
          </div>
        )}

        {/* Decoration: a hairline filled as the reader moves through a long
            piece. It reports nothing the scrollbar does not, which is why it is
            `aria-hidden` and carries no role. */}
        <ReadingRule />

        <div className="mt-phi5 grid gap-phi5 lg:grid-cols-[1fr_16rem]">
          {/* §142 — a comfortable measure, not a wall of text across a monitor */}
          {/* `rj-dropcap` sets the opening letter of the first paragraph only —
              see the note on it in ornament.css. Applied by hand rather than to
              every article body automatically, because a piece that opens on a
              list or a quotation must not get one. */}
          <div className="rj-dropcap max-w-[68ch]">
            <Prose markdown={post.body ?? ""} />

            {post.faqs?.length > 0 && (
              <section className="mt-phi5">
                <h2 className="text-2xl text-ink">Common questions</h2>
                <div className="mt-phi3 divide-y divide-line border-y border-line">
                  {post.faqs.map((f, i) => (
                    <details key={i} className="group py-phi2">
                      <summary className="cursor-pointer text-lg text-ink">{f.q}</summary>
                      <p className="mt-phi2 text-base leading-relaxed text-ink-soft">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}

            {post.disclaimer && (
              <p className="mt-phi5 rounded-card border border-line bg-canvas-alt p-phi3 text-tiny leading-relaxed text-ink-muted">
                {post.disclaimer}
              </p>
            )}

            {/* §128 — the article hands the reader to real inventory. Nothing
                about the property is copied into the body; it is read live, so
                availability here can never contradict the property page. */}
            {related.length > 0 && (
              <section className="mt-phi6 border-t border-line pt-phi4">
                <SectionLabel>Relevant right now</SectionLabel>
                <h2 className="mt-phi2 text-2xl text-ink">Jamin developments this applies to</h2>
                <div className="mt-phi4 grid gap-phi3 sm:grid-cols-2">
                  {related.map((r) => (
                    <PropertyCard key={r.id} p={r} />
                  ))}
                </div>
              </section>
            )}

            <div className="mt-phi5 rounded-card border border-line bg-canvas-alt p-phi4">
              <h2 className="text-xl text-ink">Still deciding?</h2>
              <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
                Our desk will walk you through any of this against a specific plot — including the
                documents you should ask to see.
              </p>
              <div className="mt-phi3 flex flex-wrap gap-2">
                <ButtonLink href="/contact">Talk to Jamin</ButtonLink>
                <ButtonLink href="/properties" variant="secondary">
                  See what is available
                </ButtonLink>
              </div>
            </div>
          </div>

          {/* §143 — sticky table of contents on desktop, and the marginalia
              beneath it. Both live in the SAME gutter: a second margin would
              take width off the measure, and the measure is what makes a long
              guide readable. */}
          {(headings.length > 2 || related.length > 0) && (
            /* ⚠️ `min-w-0` on the grid ITEM. A grid item's default
               `min-width: auto` is its content's minimum, and the subjects line
               is a long unbroken run of tag names — the trap this repo has paid
               for twice already. A wrap rule on the child cannot save it. */
            <aside className="hidden min-w-0 lg:block">
              {/* 🚨 ONE STICKY BOX HOLDING BOTH, which is the fix for the
                  overlap reported 2026-08-15. Previously the contents list was
                  itself `sticky top-28` and the marginalia was a static sibling
                  under it: the list pinned, the notes scrolled up through it,
                  and both then rode over the article. The cap and the pin now
                  belong to this wrapper, so the two move as one object and the
                  list scrolls inside it. */}
              <div className="sticky top-28 flex max-h-[calc(100vh-9rem)] flex-col">
                {headings.length > 2 && <TableOfContents headings={headings} />}
                <Marginalia post={post} related={related} />
              </div>
            </aside>
          )}
        </div>

        {/* The publishing record, at the foot where a colophon belongs. */}
        <Colophon post={post} />
      </article>

      {more.length > 0 && (
        <section className="mt-phi7 border-t border-line pt-phi5">
          <h2 className="text-2xl text-ink">More like this</h2>
          <ul className="mt-phi4 grid gap-phi3 sm:grid-cols-3">
            {more.map((m) => (
              /* ⚠️ `flex` on the item and `h-full` on the card. A grid item
                  stretches to the tallest in its row but a `block` child does
                  not follow it, so a two-line title made one card taller and
                  the row stopped aligning — the same defect PropertyCard was
                  fixed for, in a second grid that never got the treatment. */
              <li key={m.id} className="flex">
                <Link
                  href={journalHref(m)}
                  className="flex h-full w-full flex-col rounded-card border border-line bg-canvas p-phi3 transition-colors hover:border-ink-faint"
                >
                  <span className="text-micro uppercase tracking-[0.14em] text-ink-faint">
                    {KIND_LABEL[m.kind] ?? m.kind}
                  </span>
                  <span className="mt-1 block text-lg text-ink">{m.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Container>
  );
}
