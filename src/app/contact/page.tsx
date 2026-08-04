import type { Metadata } from "next";
import { getProperties, isSellable, locationLine } from "@/lib/properties";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact & Site Visits",
  description:
    "Arrange a site visit or speak to the Jamin Properties sales desk about DTCP-approved plots in Salem, Erode and Coimbatore.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const live = (await getProperties()).filter(isSellable);

  return (
    <div className="mx-auto max-w-[1280px] px-5 py-phi5 lg:px-10">
      <div className="grid gap-phi5 lg:grid-cols-[1.618fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-jamin-gold" />
            <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold">
              Get in touch
            </span>
          </div>
          <h1 className="mt-phi2 text-3xl text-ink lg:text-4xl">Book a site visit</h1>
          <p className="mt-phi3 max-w-xl text-lg leading-relaxed text-ink-muted">
            Walk the layout, see the approvals and stand on the plot before you decide. Visits are
            arranged at your convenience and carry no obligation.
          </p>

          {/* The app owns enquiry capture and lead attribution. Rather than
              open a second, unattributed pipeline that the sales desk would
              have to reconcile, the website hands over to it. */}
          <div className="mt-phi5 rounded-card border border-line bg-canvas-alt p-phi4">
            <h2 className="text-xl text-ink">Speak to the sales desk</h2>
            <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
              Enquiries are handled through the Jamin Bazaar platform so your request reaches the
              right advisor with your chosen project attached, and you can track it afterwards.
            </p>
            <a
              href="https://merry-begonia-4c3cd1.netlify.app/login"
              className="mt-phi3 inline-block rounded-full bg-jamin-red px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
            >
              Continue to Jamin Bazaar
            </a>
          </div>
        </div>

        <aside>
          <div className="rounded-card border border-line bg-canvas p-phi3 shadow-lift">
            <h2 className="text-tiny font-semibold uppercase tracking-[0.16em] text-ink">
              Visitable developments
            </h2>
            <ul className="mt-phi3 space-y-phi2">
              {live.map((p) => (
                <li key={p.id} className="border-t border-line pt-phi2">
                  <div className="text-base font-medium text-ink">{p.title}</div>
                  <div className="mt-1 text-tiny text-ink-muted">{locationLine(p)}</div>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
