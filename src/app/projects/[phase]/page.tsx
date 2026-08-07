import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/PropertyCard";
import { PageHero, type HeroArt } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { getProperties } from "@/lib/properties";
import { PHASE_META, PHASE_ORDER, type Phase } from "@/lib/site";
import { SITE_URL } from "@/lib/supabase";
import { seoTitle } from "@/lib/seo";

export const revalidate = 3600;

/**
 * §50 — programmatic pages, with quality control. Only stages that actually
 * hold a development are generated, and `dynamicParams = false` means any other
 * value 404s instead of quietly producing a thin page for a crawler to index.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await getProperties();
  return PHASE_ORDER.filter((phase) => all.some((p) => p.project_phase === phase)).map((phase) => ({
    phase,
  }));
}

function isPhase(v: string): v is Phase {
  return (PHASE_ORDER as readonly string[]).includes(v);
}

export async function generateMetadata({ params }: PageProps<"/projects/[phase]">): Promise<Metadata> {
  const { phase } = await params;
  if (!isPhase(phase)) return {};
  const meta = PHASE_META[phase];
  return {
    title: { absolute: seoTitle(`${meta.label} Jamin Projects in Tamil Nadu`) },
    description: meta.blurb,
    alternates: { canonical: `/projects/${phase}` },
    openGraph: {
      title: `${meta.label} Jamin projects`,
      description: meta.blurb,
      url: `${SITE_URL}/projects/${phase}`,
    },
  };
}

export default async function PhasePage({ params }: PageProps<"/projects/[phase]">) {
  const { phase } = await params;
  if (!isPhase(phase)) notFound();

  const meta = PHASE_META[phase];
  const all = await getProperties();
  const items = all.filter((p) => p.project_phase === phase);
  const plots = items.reduce((n, p) => n + (p.plots_available ?? 0), 0);

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
      { "@type": "ListItem", position: 3, name: meta.label, item: `${SITE_URL}/projects/${phase}` },
    ],
  };

  // One image per stage, so the four pages are visually distinct rather than
  // four copies of the same header.
  const ART_BY_PHASE: Record<string, HeroArt> = {
    ongoing: 4, current: 9, future: 7, completed: 1,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <PageHero
        art={ART_BY_PHASE[phase] ?? 5}
        eyebrow={`${meta.label} projects`}
        title={`${meta.label} Jamin developments`}
        lead={meta.blurb}
        meta={
          <>
            {items.length} development{items.length === 1 ? "" : "s"}
            {plots > 0 ? ` · ${plots} plot${plots === 1 ? "" : "s"} available` : ""}
          </>
        }
      />
      <Container className="py-phi5">
      <nav aria-label="Breadcrumb" className="text-tiny text-ink-faint">
        <Link href="/projects" className="hover:text-jamin-red">
          Projects
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-ink-soft">{meta.label}</span>
      </nav>

      <div className="mt-phi4">
        {items.length === 0 ? (
          <EmptyState
            title={`No ${meta.label.toLowerCase()} projects right now`}
            body="This stage is empty at the moment. The other stages have developments you can look at today."
            action={
              <>
                <ButtonLink href="/projects" variant="secondary">
                  All projects
                </ButtonLink>
                <ButtonLink href="/contact">Talk to the desk</ButtonLink>
              </>
            }
          />
        ) : (
          <>
            {/* Cards are h3; without this the outline jumps h1 → h3. */}
            <h2 className="sr-only">{meta.label} developments</h2>
            <div className="grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p, i) => (
                <PropertyCard key={p.id} p={p} priority={i < 3} />
              ))}
            </div>
          </>
        )}
      </div>
      </Container>
    </>
  );
}
