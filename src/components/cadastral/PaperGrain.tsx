/**
 * The sheet the whole site is drawn on.
 *
 * A server component with no JavaScript at all — one inline SVG turbulence
 * filter, painted once over the viewport and fixed there. It must be rendered
 * exactly once, in the root layout: `feTurbulence` is among the most expensive
 * filters a browser can run, and instantiating it per section is the difference
 * between free and a dropped scroll.
 *
 * `aria-hidden` because it carries no meaning, and `pointer-events: none` in
 * the stylesheet because it covers everything.
 */
export function PaperGrain() {
  return (
    <svg className="cd-grain" aria-hidden="true" focusable="false">
      <filter id="cd-grain-f">
        <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#cd-grain-f)" />
    </svg>
  );
}
