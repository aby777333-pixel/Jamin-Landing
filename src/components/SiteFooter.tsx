import Image from "next/image";
import Link from "next/link";

const COLUMNS = [
  {
    title: "Properties",
    links: [
      { href: "/properties", label: "All Properties" },
      { href: "/properties?type=residential_plot", label: "Residential Plots" },
      { href: "/projects/completed", label: "Completed Projects" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Jamin" },
      { href: "/contact", label: "Contact" },
      { href: "/legal", label: "Legal & Approvals" },
    ],
  },
  {
    title: "Buyers",
    links: [
      { href: "/contact", label: "Book a Site Visit" },
      { href: "/guide", label: "Investment Guide" },
      { href: "https://merry-begonia-4c3cd1.netlify.app/", label: "Buyer Portal" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-phi7 border-t border-line bg-canvas-alt">
      <div className="mx-auto max-w-[1280px] px-5 py-phi6 lg:px-10">
        <div className="grid gap-phi5 lg:grid-cols-[1.618fr_1fr_1fr_1fr]">
          <div>
            <Image src="/logo.png" alt="Jamin Bazaar" width={200} height={73} className="h-11 w-auto" />
            <p className="mt-phi3 max-w-sm text-base leading-relaxed text-ink-muted">
              DTCP-approved residential plotted developments across Tamil Nadu — planned for
              families who intend to build, and for investors who intend to hold.
            </p>
            <div className="mt-phi3 h-px w-24 rule-gold" />
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-tiny font-semibold uppercase tracking-[0.18em] text-ink">
                {col.title}
              </h4>
              <ul className="mt-phi2 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-base text-ink-muted transition-colors hover:text-jamin-red"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-phi5 flex flex-col gap-3 border-t border-line pt-phi3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-tiny text-ink-faint">
            © {new Date().getFullYear()} Jamin Properties. All rights reserved.
          </p>
          <p className="text-tiny text-ink-faint">
            Plot availability and pricing are confirmed by our sales desk at the time of booking.
          </p>
        </div>
      </div>
    </footer>
  );
}
