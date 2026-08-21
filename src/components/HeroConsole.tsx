import { Suggestion } from "@/lib/search";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";

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
 *
 * 🚨 THE HEADING IS LEFT AND LARGE (report 10, 2026-08-21: "Make 'Where would
 * you like to own?' more prominent and properly aligned currently it is at
 * right move that to left side and increase the size"). It was an `rj-eyebrow`,
 * and that class right-aligns centrally in royal.css — which is why it sat at
 * the far edge. It is a real heading now: its own size, its own left edge, a
 * drawn pin beside it, and the controls grew a size with it (h-12 → h-14).
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
      <div className="flex items-center gap-3">
        {/* Drawn, not typed — the pin the property cards already carry. */}
        <span
          aria-hidden="true"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-champagne-300"
        >
          <SurveyIcon name="pin" size="h-4 w-4" />
        </span>
        <p
          className="text-lg font-semibold uppercase tracking-[0.14em] sm:text-xl"
          style={{ color: "var(--color-champagne-300)" }}
        >
          Where would you like to own?
        </p>
      </div>

      <div className="mt-phi3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="min-w-0 flex-1">
          <label htmlFor="hero-q" className="sr-only">
            Search by place, project or survey number
          </label>
          {/* The magnifier sits inside the field: the input keeps its native
              name and the icon is decoration, so the GET form stays script-free. */}
          <div className="relative">
            <svg
              viewBox="0 0 20 20"
              className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-plat-300"
              aria-hidden="true"
            >
              <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              id="hero-q"
              name="q"
              type="search"
              placeholder="Place, project or survey number"
              className="h-14 w-full rounded-full rj-console-field border border-white/15 pl-12 pr-5 text-base text-bone placeholder:text-plat-300 focus:border-champagne-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-300"
            />
          </div>
        </div>

        {districts.length > 0 && (
          /* 🚨 BRANDED, STILL NATIVE (report 12, 2026-08-21: "the District
              dropdown currently appears with the browser's default dropdown
              styling… should have a custom, branded appearance consistent
              with the surrounding search controls. Remove the default blue
              browser selection styling"). `rj-console-select` in royal.css
              strips the platform button and recolours the list; the chevron
              below is ours, in champagne, matching the fields beside it.
              The control stays a real `<select>` because this form ships with
              no JavaScript at all — see the header. */
          <div className="relative sm:w-60">
            <label htmlFor="hero-district" className="sr-only">
              District
            </label>
            <select
              id="hero-district"
              name="district"
              defaultValue=""
              className="rj-console-select rj-console-field h-14 w-full rounded-full border border-white/15 pl-5 pr-11 text-base text-bone focus:border-champagne-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne-300"
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
            {/* Our chevron, since `appearance: none` took the platform's.
                `pointer-events-none` so it never eats a click meant for the
                control underneath it. */}
            <svg
              viewBox="0 0 12 8"
              aria-hidden="true"
              className="pointer-events-none absolute right-5 top-1/2 h-2 w-3 -translate-y-1/2 text-champagne-300"
            >
              <path
                d="M1 1.5 6 6.5l5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        <button
          type="submit"
          className="rj-cta h-14 shrink-0 rounded-full bg-cta px-8 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-transform duration-300 hover:-translate-y-0.5"
          style={{ transitionTimingFunction: "var(--ease-silk)" }}
        >
          Find plots{" "}
          <span aria-hidden="true" className="ml-1">
            →
          </span>
        </button>
      </div>

      {/* ⚠️ §8: the plot counts are evidence, so they stay plain. No gold on a
          number that is doing the selling by itself.

          ⚠️ `bone`, not `plat-300`, and that is the price of the sheer ground
          rather than a change of emphasis. This line starts at 71.4% of the
          panel, by which point it is over the page's ivory — where the
          backdrop blur does nothing at all, because blurring a flat colour
          returns the flat colour. Against the sheer foot `plat-300` measures
      3.80 and `bone` measures 4.88. Putting `plat-300` back means putting
          the 0.79 foot back with it; see royal.css. */}
      <p className="mt-phi2 flex items-center gap-2 text-tiny text-bone">
        <SurveyIcon name="stamp" size="h-3.5 w-3.5" className="shrink-0 text-champagne-300" />
        Every layout is DTCP-approved, with the plot schedule published before you visit.
      </p>
    </form>
  );
}
