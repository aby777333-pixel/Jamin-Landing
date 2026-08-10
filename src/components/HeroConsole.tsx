import { Suggestion } from "@/lib/search";

/**
 * THE SEARCH CONSOLE (§6.2) — the way into the inventory from the front page.
 *
 * ⚠️ A PLAIN GET FORM, and that is the whole design. `/properties` already
 * reads `q`, `district` and `phase` from the URL, so this needs no state, no
 * client bundle and no JavaScript at all — it submits natively, it works with
 * scripting disabled, and a crawler sees a real form. Hero.tsx is a server
 * component and its header records that as where the page's LCP win comes
 * from; a console that hydrated would have spent exactly that.
 *
 * ⚠️ It sits BELOW the banner, not over it. §6.2 floats the console on the
 * hero image, which on any ordinary photograph is right. This banner is 3.3:1
 * and `object-cover` sizes it to the box HEIGHT, so anything added inside it is
 * paid for in picture WIDTH — the inventory rail was moved out for that reason
 * and the register records 107px of rail costing about a tenth of the frame.
 * Floating this inside would have cropped the arch it exists to show.
 */
export function HeroConsole({ districts }: { districts: Suggestion[] | { label: string; count: number }[] }) {
  return (
    <form
      action="/properties"
      method="GET"
      /* `rj-glass-onyx` is §6.2's --glass-dark. It reads as an instrument
         against the ivory rail beneath it rather than competing with it. */
      className="rj-console rj-glass-onyx rj-sheer-copy rj-arrive overflow-hidden p-phi3 sm:p-phi4"
      style={{ "--rj-arrive-delay": "760ms" } as React.CSSProperties}
      aria-label="Find a plot"
    >
      <p className="rj-eyebrow" style={{ color: "var(--color-champagne-300)" }}>
        Where would you like to own?
      </p>

      <div className="mt-phi3 flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1">
          <label htmlFor="hero-q" className="sr-only">
            Search by place, project or survey number
          </label>
          <input
            id="hero-q"
            name="q"
            type="search"
            placeholder="Place, project or survey number"
            className="h-12 w-full rounded-full rj-console-field border border-white/15 px-5 text-base text-bone placeholder:text-plat-300 focus:border-champagne-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-300"
          />
        </div>

        {districts.length > 0 && (
          <div className="sm:w-56">
            <label htmlFor="hero-district" className="sr-only">
              District
            </label>
            {/* A native select: it is the one control that already works on
                every phone, needs no library and no script. */}
            <select
              id="hero-district"
              name="district"
              defaultValue=""
              className="h-12 w-full rounded-full rj-console-field border border-white/15 px-5 text-base text-bone focus:border-champagne-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-300"
            >
              {/* ⚠️ The options are dark-on-light because a native select's
                  popup is drawn by the OS, not by this stylesheet. Styling them
                  to bone would make the list white-on-white on most platforms. */}
              <option value="" className="text-ink">
                Any district
              </option>
              {districts.map((d) => (
                <option key={d.label} value={d.label} className="text-ink">
                  {d.label} ({d.count})
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          className="rj-cta h-12 shrink-0 rounded-full bg-cta px-7 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-transform duration-300 hover:-translate-y-0.5"
          style={{ transitionTimingFunction: "var(--ease-silk)" }}
        >
          Find plots
        </button>
      </div>

      {/* ⚠️ §8: the plot counts are evidence, so they stay plain. No gold on a
          number that is doing the selling by itself. */}
      <p className="mt-phi2 text-tiny text-plat-300">
        Every layout is DTCP-approved, with the plot schedule published before you visit.
      </p>
    </form>
  );
}
