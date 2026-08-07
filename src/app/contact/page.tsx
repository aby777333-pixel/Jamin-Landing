import type { Metadata } from "next";
import { Container, SectionLabel } from "@/components/ui";
import { EnquiryForm } from "@/components/EnquiryForm";
import { DeskActions } from "@/components/DeskActions";
import { getProperties, isSellable, locationLine } from "@/lib/properties";
import { getDeskContact } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact & Site Visits",
  description:
    "Arrange a site visit or speak to the Jamin Properties sales desk about DTCP-approved plots in Salem, Erode, Tiruppur and Coimbatore.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [all, desk] = await Promise.all([getProperties(), getDeskContact()]);
  const live = all.filter(isSellable);

  return (
    <Container className="py-phi5">
      <div className="grid gap-phi5 lg:grid-cols-[1.618fr_1fr]">
        <div>
          <SectionLabel>Get in touch</SectionLabel>
          <h1 className="mt-phi2 text-3xl text-ink lg:text-4xl">Book a site visit</h1>
          <p className="mt-phi3 max-w-xl text-lg leading-relaxed text-ink-muted">
            Walk the layout, see the approvals and stand on the plot before you decide. Visits are
            arranged at your convenience and carry no obligation.
          </p>

          {/* The enquiry lands in the same leads queue the app and the V-Card
              feed, with the referring promoter attached — one pipeline, not a
              second one the desk would have to reconcile. */}
          <div className="mt-phi4 rounded-card border border-line bg-canvas-alt p-phi4">
            <h2 className="text-xl text-ink">Tell us what you are after</h2>
            <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
              Two fields is all we need to call you back. Everything else is optional.
            </p>
            <div className="mt-phi3">
              <EnquiryForm />
            </div>
          </div>

          <div className="mt-phi4">
            <h2 className="text-tiny font-semibold uppercase tracking-[0.16em] text-ink">
              Or reach the desk directly
            </h2>
            <p className="mt-phi2 text-base text-ink-muted">
              {desk.label ?? "Jamin Properties Help Desk"} — we usually respond within working
              hours.
            </p>
            <div className="mt-phi3">
              <DeskActions />
            </div>
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
            <p className="mt-phi3 border-t border-line pt-phi2 text-tiny leading-relaxed text-ink-faint">
              A requested visit is not yet a confirmed appointment — we call to agree the time with
              you.
            </p>
          </div>
        </aside>
      </div>
    </Container>
  );
}
