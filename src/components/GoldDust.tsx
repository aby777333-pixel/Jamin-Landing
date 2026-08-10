/**
 * Gold dust — the only particles on the site (§6.6), and only inside the Vault.
 *
 * ⚠️ THE POSITIONS ARE A FIXED TABLE, NOT `Math.random()`. This renders on the
 * server; a random layout would differ between the server pass and hydration
 * and React would throw a mismatch. Written out, it also means the field was
 * composed rather than sprayed — the specks are spread across the width and
 * given unequal durations so the drift never falls into a visible rhythm.
 *
 * 24 of them, inside §6.6's 20–26. It is a server component: no state, no
 * JavaScript, and the whole effect is CSS.
 */
const MOTES = [
  { x: 4, y: 82, dx: 14, dy: -150, dur: 19, delay: 0 },
  { x: 11, y: 94, dx: -9, dy: -170, dur: 23, delay: 2.4 },
  { x: 17, y: 71, dx: 18, dy: -130, dur: 16, delay: 5.1 },
  { x: 23, y: 88, dx: -6, dy: -190, dur: 26, delay: 1.2 },
  { x: 29, y: 63, dx: 11, dy: -145, dur: 21, delay: 7.3 },
  { x: 34, y: 97, dx: -14, dy: -160, dur: 18, delay: 3.8 },
  { x: 39, y: 76, dx: 7, dy: -175, dur: 24, delay: 9.6 },
  { x: 44, y: 90, dx: -11, dy: -135, dur: 17, delay: 6.2 },
  { x: 49, y: 68, dx: 16, dy: -185, dur: 25, delay: 0.9 },
  { x: 54, y: 85, dx: -8, dy: -155, dur: 20, delay: 4.7 },
  { x: 58, y: 95, dx: 12, dy: -140, dur: 22, delay: 8.1 },
  { x: 63, y: 73, dx: -16, dy: -165, dur: 19, delay: 2.0 },
  { x: 68, y: 89, dx: 9, dy: -180, dur: 27, delay: 5.9 },
  { x: 72, y: 66, dx: -12, dy: -150, dur: 18, delay: 10.4 },
  { x: 77, y: 92, dx: 15, dy: -170, dur: 23, delay: 3.1 },
  { x: 81, y: 79, dx: -7, dy: -132, dur: 16, delay: 7.8 },
  { x: 86, y: 96, dx: 10, dy: -188, dur: 26, delay: 1.7 },
  { x: 90, y: 70, dx: -15, dy: -158, dur: 21, delay: 6.5 },
  { x: 94, y: 87, dx: 6, dy: -142, dur: 19, delay: 11.2 },
  { x: 8, y: 60, dx: 13, dy: -176, dur: 24, delay: 4.3 },
  { x: 26, y: 55, dx: -10, dy: -128, dur: 17, delay: 8.9 },
  { x: 47, y: 58, dx: 8, dy: -192, dur: 28, delay: 2.7 },
  { x: 66, y: 52, dx: -13, dy: -148, dur: 20, delay: 9.1 },
  { x: 88, y: 57, dx: 11, dy: -168, dur: 22, delay: 5.4 },
];

export function GoldDust() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="rj-dust"
          style={
            {
              left: `${m.x}%`,
              top: `${m.y}%`,
              "--rj-dust-dx": `${m.dx}px`,
              "--rj-dust-dy": `${m.dy}px`,
              "--rj-dust-dur": `${m.dur}s`,
              "--rj-dust-delay": `${m.delay}s`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
