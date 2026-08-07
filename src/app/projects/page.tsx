import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { PageHero } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { getProperties } from "@/lib/properties";
import { PHASE_META, PHASE_ORDER, type Phase } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects by Stage",
  description:
    "Every Jamin Properties development grouped by stage: ongoing layouts selling now, upcoming releases, future land, and completed projects already handed over.",
  alternates: { canonical: "/projects" },
};

/**
 * §13 — project discovery grouped the way a buyer actually thinks: how far
 * along is it, and can I buy into it yet. The groups come from live rows, so a
 * stage with nothing in it never renders an empty shelf.
 */
export default async function ProjectsPage() {
  const all = await getProperties();
  const groups = PHASE_ORDER.map((phase) => ({
    phase,
    meta: PHASE_META[phase],
    items: all.filter((p) => p.project_phase === phase),
  })).filter((g) => g.items.length > 0);

  return (
    <>
      <PageHero
        art={5}
        eyebrow="Plotted developments"
        title="Every Jamin project, by stage"
        lead="Land moves through stages, and what you can do at each one differs — from land secured and sanctioned, through roads going in, to keys handed over."
      />
      <Container className="py-phi5">

      {groups.length === 0 ? (
        <div className="mt-phi5">
          <EmptyState
            title="Nothing published yet"
            body="Developments appear here as soon as they are published from the Jamin admin console."
            action={<ButtonLink href="/contact">Talk to the sales desk</ButtonLink>}
          />
        </div>
      ) : (
        groups.map((g) => (
          <section key={g.phase} className="mt-phi6 first:mt-phi5">
            <div className="flex flex-wrap items-end justify-between gap-phi2 border-b border-line pb-phi2">
              <div className="max-w-xl">
                <h2 className="text-2xl text-ink">{g.meta.label}</h2>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">{g.meta.blurb}</p>
              </div>
              <Link
                href={`/projects/${g.phase}`}
                className="text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red"
              >
                View {g.meta.label.toLowerCase()} →
              </Link>
            </div>
            <div className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((p, i) => (
                <PropertyCard key={p.id} p={p} priority={i === 0 && g.phase === PHASE_ORDER[0]} />
              ))}
            </div>
          </section>
        ))
      )}
      </Container>
    </>
  );
}

export type { Phase };
