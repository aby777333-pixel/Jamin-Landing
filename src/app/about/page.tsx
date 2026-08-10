import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { getProperties, isSellable } from "@/lib/properties";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Jamin Properties",
  description:
    "Jamin Properties develops DTCP-approved residential plotted layouts across Tamil Nadu, with clear and marketable title, wide internal roads and bank loan assistance.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    t: "Approved before it is offered",
    d: "Every layout carries planning-authority approval. We do not pre-sell land that is still waiting on paperwork.",
  },
  {
    t: "Clear and marketable title",
    d: "Title is verified up front, and the documents are yours to inspect — before you commit, not after.",
  },
  {
    t: "Built to be built on",
    d: "Wide internal roads, common water supply and demarcated boundaries, so construction can begin immediately.",
  },
  {
    t: "Published, not promised",
    d: "Site progress is photographed and published as work proceeds. What you see is the site as it stands today.",
  },
];

export default async function AboutPage() {
  const all = await getProperties();
  const live = all.filter(isSellable);
  const delivered = all.filter((p) => !isSellable(p));
  const plots = all.reduce((n, p) => n + (p.plots_total ?? 0), 0);

  return (
    <>
      {/* ⚠️ hero-19 has the JAMIN BAZAAR name rendered into the gate, so it is
          the one frame in the set that identifies itself. It is still a render,
          not a photograph of a delivered layout, which is exactly why it stays
          uncaptioned and out of the accessibility tree — the no-caption rule in
          public/hero/README.md binds harder here than anywhere else. */}
      <PageHero
        art={19}
        tone="cinematic"
        size="tall"
        sheer
        /* Swept on this frame, not copied. The brightest frame the site carries: white 4.96, gold 4.59 at blur 16. */
        sheerAlpha={0.22}
        sheerBlur={8}
        eyebrow="Who we are"
        title="Land, sold the way it should be."
        lead="Jamin Properties plans and delivers DTCP-approved residential plotted developments across Tamil Nadu — in Salem, Erode, Coimbatore and Tiruppur. We sell to families who intend to build and to investors who intend to hold, and we would rather say “not published yet” than quote a number we cannot stand behind."
      />
      <Container className="py-phi5">

      {/* figures computed from the live database, never hand-typed */}
      <section className="mt-phi5 grid gap-phi3 border-y border-line py-phi4 sm:grid-cols-3">
        <div>
          <div className="text-3xl text-jamin-red-deep">{live.length}</div>
          <div className="mt-1 text-base text-ink-muted">developments currently selling</div>
        </div>
        <div>
          <div className="text-3xl text-jamin-red-deep">{delivered.length}</div>
          <div className="mt-1 text-base text-ink-muted">completed and handed over</div>
        </div>
        <div>
          <div className="text-3xl text-jamin-red-deep">{plots}</div>
          <div className="mt-1 text-base text-ink-muted">plots planned across all projects</div>
        </div>
      </section>

      <section className="mt-phi6 grid gap-phi4 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <div key={p.t}>
            <h2 className="text-xl text-ink">{p.t}</h2>
            <p className="mt-phi2 text-base leading-relaxed text-ink-muted">{p.d}</p>
          </div>
        ))}
      </section>

      <section className="mt-phi6">
        <Link
          href="/properties"
          className="inline-block rounded-full bg-jamin-red px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
        >
          See our developments
        </Link>
      </section>
      </Container>
    </>
  );
}
