import Image from "next/image";

/**
 * JAMIN CARTOUCHE §4.1 — the Cartouche.
 *
 * The red lozenge from the reference creative: fully rounded on three
 * corners, squared off at the bottom-right, a paper inner tab holding the
 * lockup, and a small paper shoulder tucked beneath. In drafting, a cartouche
 * is the title block that identifies the drawing; here it identifies the
 * site.
 *
 * ONE per page — it lives in the header only, never the footer, never
 * centred. `compact` is driven by the header's existing scroll state so the
 * lozenge contracts from 64px to 44px once the reader is into the page.
 *
 * Presentational only: the Link, its target and its aria-label stay on the
 * caller (HeaderShell), so nothing about navigation or crawling changes.
 */
export function Cartouche({ compact = false }: { compact?: boolean }) {
  return (
    /* ⚠️ `shrink-0` EVERYWHERE IN THIS TREE (owner 2026-08-17: "the main logo
       is shrunk") — the header row grew a mode toggle and the flex container
       started squeezing the lockup, clipping the wordmark. The Cartouche
       never shares its width. The lozenge also grew back to the old header
       logo's presence: 72px tall with the image at h-12. */
    <span
      className="relative inline-flex shrink-0 flex-col"
      style={{ transition: "all 220ms var(--ease-silk)" }}
    >
      <span
        className="inline-flex shrink-0 items-center bg-cta"
        style={{
          borderRadius: "999px 999px 8px 999px",
          padding: compact ? "5px 14px 5px 8px" : "8px 20px 8px 12px",
          height: compact ? 48 : 72,
          boxShadow: "0 10px 26px -14px rgba(201, 2, 2, 0.42)",
          transition: "all 220ms var(--ease-silk)",
        }}
      >
        <span
          className="inline-flex shrink-0 items-center"
          /* ⚠️ THE RAW PAPER TOKEN, NOT bg-canvas-alt — reported 2026-08-17:
             on /vault the theme scope remaps canvas-alt to onyx, which put
             the lockup's near-black BAZAAR wordmark on a dark chip (the
             logo-full.png dark-ground problem the memory of this repo already
             records). --color-jp-sand-050 is a Cartouche literal no theme
             rescopes, so the chip stays paper on every ground. */
          style={{
            background: "var(--color-jp-sand-050)",
            borderRadius: 999,
            padding: compact ? "3px 12px" : "5px 16px",
            transition: "all 220ms var(--ease-silk)",
          }}
        >
          <Image
            src="/logo-full.png"
            alt="Jamin Bazaar"
            width={793}
            height={312}
            priority
            sizes="(max-width: 1024px) 112px, 140px"
            className={compact ? "h-8 w-auto max-w-none" : "h-10 w-auto max-w-none lg:h-12"}
            style={{ transition: "height 220ms var(--ease-silk)" }}
          />
        </span>
      </span>
      {/* The paper shoulder beneath the squared corner — the detail that makes
          the lozenge read as APPLIED to the page rather than laid out on it.
          ⚠️ ABSOLUTE, pinned to the lozenge's bottom-right (owner 2026-08-17:
          "alignment problem") — as a flow sibling it added its height to the
          Cartouche's layout box, so the header centred the nav against
          lozenge-plus-shoulder and the chip could drift from the corner it
          belongs to. Pinned, it contributes nothing to layout and cannot
          detach. */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "100%",
          right: 0,
          background: "var(--color-jp-sand-050)",
          width: "42%",
          height: compact ? 4 : 6,
          borderRadius: "0 0 8px 8px",
          opacity: compact ? 0 : 1,
          transition: "all 220ms var(--ease-silk)",
        }}
      />
    </span>
  );
}
