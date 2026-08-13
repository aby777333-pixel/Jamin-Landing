import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, SectionLabel, Badge, EmptyState, ButtonLink } from "@/components/ui";
import {
  KIND_LABEL,
  getJournalCategories,
  getJournalPosts,
  journalHref,
  publishedLabel,
  readingMinutes,
} from "@/lib/journal";
import { SITE_URL } from "@/lib/supabase";

/** 60s — see the note in journal/page.tsx. */
export const revalidate = 60;

/**
 * §50 / §169 — only categories that actually hold a published article become
 * pages. `dynamicParams = false` means an empty category 404s instead of
 * quietly adding a thin page to the index.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const [cats, posts] = await Promise.all([getJournalCategories(), getJournalPosts()]);
  const used = new Set(posts.map((p) => p.blog_categories?.slug).filter(Boolean));
  return cats.filter((c) => used.has(c.slug)).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/journal/category/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const cat = (await getJournalCategories()).find((c) => c.slug === slug);
  if (!cat) return {};
  return {
    title: `${cat.name} — Jamin Journal`,
    description: cat.description ?? undefined,
    alternates: { canonical: `/journal/category/${cat.slug}` },
    openGraph: {
      title: `${cat.name} — Jamin Journal`,
      description: cat.description ?? undefined,
      url: `${SITE_URL}/journal/category/${cat.slug}`,
    },
  };
}

export default async function JournalCategoryPage({
  params,
}: PageProps<"/journal/category/[slug]">) {
  const { slug } = await params;
  const [cats, posts] = await Promise.all([getJournalCategories(), getJournalPosts()]);
  const cat = cats.find((c) => c.slug === slug);
  if (!cat) notFound();

  const items = posts.filter((p) => p.blog_categories?.slug === slug);
  // Deliberately NOT notFound() when the list is empty. `dynamicParams = false`
  // already guarantees the category exists; turning "no articles right now"
  // into a 404 is how a transient read failure got baked into a permanently
  // cached 404 for a page that was perfectly real.

  return (
    <Container className="py-phi5">
      <nav aria-label="Breadcrumb" className="text-tiny text-ink-faint">
        <Link href="/journal" className="hover:text-jamin-red-deep">
          Jamin Journal
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink-soft">{cat.name}</span>
      </nav>

      <header className="mt-phi3 max-w-2xl">
        <SectionLabel>Jamin Journal</SectionLabel>
        <h1 className="mt-phi2 text-3xl text-ink lg:text-4xl">{cat.name}</h1>
        {cat.description && (
          <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">{cat.description}</p>
        )}
        <p className="mt-phi2 text-base text-ink-faint">
          {items.length} article{items.length === 1 ? "" : "s"}
        </p>
      </header>

      {items.length === 0 ? (
        <div className="mt-phi5">
          <EmptyState
            title="Nothing in this section yet"
            body="Articles filed under this heading will appear here as they are published."
            action={
              <ButtonLink href="/journal" variant="secondary">
                Back to the Journal
              </ButtonLink>
            }
          />
        </div>
      ) : (
      <div className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p, i) => (
          <Link
            key={p.id}
            href={journalHref(p)}
            className="group block overflow-hidden rounded-card border border-line bg-canvas shadow-lift transition-all duration-500 hover:-translate-y-1 hover:shadow-raise"
          >
            {/* ⚠️ 2/1 + `object-left`, matching `ArticleCard` — the reasoning
                and the sweep over the real covers are written up there. This
                grid was 1.618 + centre `cover`, which cropped 31% off the
                widest covers and took their headlines with it. Keep the two in
                step: a reader moves between /journal and a category page and
                the cards must not be two different components. */}
            <div className="relative aspect-[2/1] overflow-hidden bg-canvas-sunken">
              {p.cover_url ? (
                <Image
                  src={p.cover_url}
                  alt={p.cover_alt ?? p.title}
                  fill
                  priority={i < 3}
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-left transition-transform duration-[1200ms] group-hover:scale-[1.06]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-tiny uppercase tracking-brand text-ink-faint">
                  Jamin Journal
                </div>
              )}
            </div>
            <div className="p-phi3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="gold">{KIND_LABEL[p.kind] ?? p.kind}</Badge>
                {readingMinutes(p) !== null && (
                  <span className="text-micro uppercase tracking-[0.14em] text-ink-faint">
                    <span className="ledger">{readingMinutes(p)}</span> min read
                  </span>
                )}
                {publishedLabel(p) && (
                  <span className="text-micro uppercase tracking-[0.14em] text-ink-faint">
                    {publishedLabel(p)}
                  </span>
                )}
              </div>
              <h2 className="mt-2 text-xl text-ink transition-colors group-hover:text-jamin-red-deep">
                {p.title}
              </h2>
              {p.excerpt && (
                <p className="mt-1.5 line-clamp-2 text-base text-ink-muted">{p.excerpt}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      )}
    </Container>
  );
}
