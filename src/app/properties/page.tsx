import type { Metadata } from "next";
import { PropertyCard } from "@/components/PropertyCard";
import { getProperties, isSellable } from "@/lib/properties";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Properties — DTCP-Approved Plots Across Tamil Nadu",
  description:
    "Browse every Jamin Properties development: DTCP-approved residential plotted layouts in Salem, Erode and Coimbatore, with plot availability, approvals and site photography.",
  alternates: { canonical: "/properties" },
};

export default async function PropertiesPage() {
  const all = await getProperties();
  const live = all.filter(isSellable);
  const completed = all.filter((p) => !isSellable(p));
  const totalPlots = live.reduce((n, p) => n + (p.plots_available ?? 0), 0);

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-phi5 lg:px-10">
      <header className="max-w-2xl">
        <div className="flex items-center gap-3">
          <span className="h-px w-10 bg-jamin-gold" />
          <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold">
            Our developments
          </span>
        </div>
        <h1 className="mt-phi2 text-3xl text-ink lg:text-4xl">Properties</h1>
        <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
          {live.length} development{live.length === 1 ? "" : "s"} currently selling
          {totalPlots > 0 ? `, with ${totalPlots} plots available` : ""}. Every layout is
          DTCP-approved with clear and marketable title.
        </p>
      </header>

      <section className="mt-phi5">
        <div className="grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((p, i) => (
            <PropertyCard key={p.id} p={p} priority={i < 3} />
          ))}
        </div>
      </section>

      {completed.length > 0 && (
        <section className="mt-phi6 border-t border-line pt-phi5">
          <h2 className="text-2xl text-ink">Completed projects</h2>
          <p className="mt-phi2 max-w-xl text-base leading-relaxed text-ink-muted">
            Fully delivered developments, listed for reference. These are not available to buy.
          </p>
          <div className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
