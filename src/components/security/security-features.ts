/**
 * THE ELEVEN — the security layers, as data.
 *
 * The copy is the owner's, verbatim (2026-08-23). Nothing here is written by
 * the site: every sentence is his, and the hedging in it ("where enabled and
 * consented to", "can incorporate", "where supported") is load-bearing rather
 * than cautious throat-clearing. This page describes a specification that is
 * project-specific, so a sentence rewritten into the indicative — "residents
 * use facial recognition" rather than "can use" — turns an option into a
 * promise on every development at once. Do not tighten the verbs.
 *
 * ⚠️ A STONE MAY NEVER BE THE ONLY CARRIER OF MEANING (lib/stones.ts). Every
 * chip below carries its word beside its colour, and the panel repeats the
 * full heading — so the palette is navigation, never taxonomy.
 *
 * ⚠️ THE STONE IS THE CHIP'S GROUND, SO WHITE HAS TO CLEAR AA ON IT. Measured
 * against #ffffff, worst first: vermilion 4.64, jade 5.18, gilt-700 5.37,
 * jamin-red 6.01, plat-800 7.35, amethyst 7.38, emerald 7.77, ruby 7.84,
 * canopy 9.91, sapphire 9.93, garnet 11.37. Vermilion is the floor and it has
 * 0.14 of headroom over the 4.5 bar at this label size — anything darker than
 * it is fine, anything lighter is not. `--color-topaz` (4.10) and
 * `--color-plat-500` (3.88) are the two stones that look like they belong here
 * and do not.
 */
export type SecurityFeature = {
  key: string;
  /**
   * The chip.
   *
   * ⚠️ SHORT IS A MEASUREMENT, NOT A STYLE. Eleven chips share one wrapping
   * strip, and at 375px the first cut of these labels ("360° Surveillance",
   * "Guest Approval", "Smart Gates", "Instant Alerts", "On Your Phone")
   * wrapped to SEVEN rows — around 300px of navigation standing between the
   * section heading and the first word of content. Trimming those five to
   * their nouns, with a tighter phone chip, brought it to five rows and 193px.
   * Re-measure the row count at 375 before lengthening one.
   *
   * It costs nothing, because the chip is not where the heading lives: the
   * panel restates `title` in full the moment the chip is pressed.
   */
  tab: string;
  /** The owner's own heading, restated in the panel. */
  title: string;
  body: string;
  /** The second paragraph, where he wrote one. */
  note?: string;
  /**
   * THE FILL — the chip's ground and the band across the head of the panel.
   *
   * A token reference, never a hex, so globals.css stays the source of truth.
   * It is measured against WHITE, because white is the only thing ever set on
   * it (see the ratio table above).
   */
  stone: string;
  /**
   * THE WORD, on sand.
   *
   * ⚠️ `stone` AND `ink` ARE THE SAME VALUE FOR EIGHT OF THE ELEVEN, AND THAT
   * IS THE POINT OF SPLITTING THEM. A fill carries no ratio; a 33px heading
   * does. Three stones are correct as a ground and too light as a word on the
   * canvas — gilt-700 measures 4.20:1 there, jade 4.05 and vermilion 3.64 —
   * so each takes a darkened cousin of its own hue instead. This is exactly
   * what NAV_STONE in lib/stones.ts already does when it gives the Journal
   * emerald-deep rather than the jade its dot wears.
   *
   * The heading is large text, so 3:1 would satisfy WCAG and all three
   * already did. 4.5 is the HOUSE bar — stones.ts sets it and names jade and
   * topaz as the stones that fail it — and a page is not the place to lower
   * a standard the rest of the site keeps.
   */
  ink: string;
  /**
   * The heading's ink IN CARBON, and it is a literal hex on purpose.
   *
   * ⚠️ `stone` IS UNUSABLE AS A WORD ON THE DARK CARD. Measured against
   * onyx-900, the eleven stones run from garnet's 1.69:1 to vermilion's
   * 4.14:1 — so the heading of the layer you had just opened was the least
   * readable thing on the page. `.rj-sec-title` in royal.css swaps to this
   * value under `[data-mode="dark"]`.
   *
   * ⚠️ IT CANNOT BE A `var()` THE WAY `stone` IS, because the token it would
   * name does not exist for seven of these eleven. royal.css already remaps
   * four inks for carbon — plat-800, garnet, champagne-700 and canopy — and
   * those four rows below reuse the site's own values verbatim rather than
   * inventing a second version of a colour the site has already decided. The
   * other seven are lifts of the same hue, picked to stay in that register:
   * soft, warm and desaturated, never a neon.
   *
   * Every value clears 6.38:1 or better against BOTH dark grounds — onyx-900
   * for the card, onyx-800 for the pane behind it. Re-measure before editing
   * one.
   */
  inkDark: string;
  image?: { src: string; alt: string; width: number; height: number; caption?: string };
};

export const SECURITY_FEATURES: SecurityFeature[] = [
  {
    key: "surveillance",
    tab: "360° Cameras",
    title: "360° Smart Surveillance",
    body: "Strategically positioned cameras monitor entrances, exits, streets and important common areas around the clock, supported by intelligent monitoring and recording.",
    stone: "var(--color-sapphire)",
    ink: "var(--color-sapphire)", // 7.78:1 on sand
    inkDark: "#8fa8e0", // 8.09:1 on onyx-900 — a soft periwinkle lift of sapphire
    image: {
      src: "/security-art/camera-night-1080.webp",
      alt: "Illustration: a bullet camera mounted on a wall at night, its indicator ring lit red.",
      width: 1080,
      height: 1080,
      caption: "Illustration. Awake at 3am, which is more than can be said for the rest of us.",
    },
  },
  {
    key: "face",
    tab: "Face Access",
    title: "Smart Facial Recognition Access",
    body: "Where enabled and consented to, residents and authorized personnel can use secure facial recognition for fast, contactless entry. Recognized users can be verified automatically and permitted gates opened without keys or access cards.",
    stone: "var(--color-amethyst)",
    ink: "var(--color-amethyst)", // 5.78:1
    inkDark: "#b895d8", // 7.62:1 — lilac, the same lift applied to amethyst
  },
  {
    key: "guests",
    tab: "Guests",
    title: "Pre-Approved Guest & Visitor Recognition",
    body: "Residents can authorize expected guests and visitors in advance. Once their identity and access are approved, the entrance system can recognize them, permit entry according to their authorization and instantly notify the resident that their guest has arrived.",
    note: "Unknown or unauthorized visitors are not automatically admitted and can be directed through the normal security verification process.",
    stone: "var(--color-emerald)",
    ink: "var(--color-emerald)", // 6.09:1
    inkDark: "#7fa8a9", // 7.39:1 — emerald raised into the carbon range
  },
  {
    key: "gates",
    tab: "Gates",
    title: "Smart Gates & Number-Plate Recognition",
    body: "Authorized resident and approved visitor vehicles can be identified at designated entrances, enabling controlled gate access while maintaining an entry and exit record.",
    stone: "var(--color-gilt-700)",
    ink: "#7b5912", // 5.02:1 on sand — gilt-700 itself is 4.20 and too light for a word
    inkDark: "#d4b168", // 9.41:1 — the brass, still clearly brass
  },
  {
    key: "perimeter",
    tab: "Perimeter",
    title: "Smart Perimeter Protection",
    body: "Protected boundaries can incorporate intrusion detection, smart sensors, beam-based perimeter systems and automated alarms to identify unusual access or movement.",
    stone: "var(--color-canopy)",
    ink: "var(--color-canopy)", // 7.76:1
    inkDark: "#86b8ae", // 8.67:1 — royal.css's OWN carbon canopy, reused verbatim
  },
  {
    key: "people",
    tab: "Our People",
    title: "Trained Security Personnel",
    body: "Technology supports people, not replaces them. Trained security teams manage entrances, patrol common areas and respond when attention is required.",
    stone: "var(--color-jamin-red)",
    ink: "var(--color-jamin-red)", // 4.71:1
    inkDark: "#e8887c", // 7.54:1 — royal.css's own carbon jamin-red-deep
    image: {
      src: "/security-art/sentry-626.webp",
      alt: "Illustration: a figure in a dark suit and red tie, with a bullet camera in place of a head.",
      width: 626,
      height: 358,
      caption: "Illustration. Real teams are considerably better company.",
    },
  },
  {
    key: "deliveries",
    tab: "Deliveries",
    title: "Controlled Visitor & Delivery Management",
    body: "Visitors, deliveries and service personnel can be verified, authorized and logged before entering the community.",
    stone: "var(--color-plat-800)",
    ink: "var(--color-plat-800)", // 5.75:1
    inkDark: "#c6b9a6", // 9.97:1 — plat-300, which is what royal.css maps plat-800 to
  },
  {
    key: "alerts",
    tab: "Alerts",
    title: "Instant Intruder & Emergency Alerts",
    body: "Potential security incidents can trigger immediate alerts to designated security personnel and authorized residents.",
    stone: "var(--color-vermilion)",
    ink: "#ad3419", // 5.01:1 — vermilion itself is 3.64, the lightest stone in the set
    inkDark: "#f0a07f", // 8.6:1 — pushed oranger than the red above, so the two alert stones stay tellable apart
  },
  {
    key: "children",
    tab: "Kids Nearby",
    title: "Your Child. Within Reach.",
    body: "Where supported, family safety features can help parents keep track of children within designated community areas and receive relevant safety notifications directly on their phones.",
    stone: "var(--color-jade)",
    ink: "#4c6361", // 5.03:1 — jade itself is 4.05, the stone stones.ts already names
    inkDark: "#a8c4bd", // 10.34:1 — the palest of the three teals, as it is in light
  },
  {
    key: "phone",
    tab: "Your Phone",
    title: "Your Community. On Your Phone.",
    body: "Guest arrivals, visitor requests, security notifications, emergency messages and important community alerts can reach residents directly through the Jamin ecosystem.",
    stone: "var(--color-champagne-700)",
    ink: "var(--color-champagne-700)", // 5.60:1
    inkDark: "#c9a884", // 8.62:1 — champagne-300, royal.css's own remap
  },
  {
    key: "emergency",
    tab: "Emergency",
    title: "Emergency Response Ready",
    body: "SOS assistance, emergency contacts, fire-safety provisions, backup power for critical security systems and defined response procedures add further layers of protection.",
    stone: "var(--color-garnet)",
    ink: "var(--color-garnet)", // 8.91:1
    inkDark: "#c98b84", // 6.87:1 — royal.css's own carbon garnet
  },
];
