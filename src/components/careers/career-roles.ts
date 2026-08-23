/**
 * THE ELEVEN ROLE FAMILIES — the owner's careers copy, as data (2026-08-23).
 *
 * Every word of `tagline`, `blurb`, `points` and `looking` is his. The page
 * writes nothing about a job that he did not write.
 *
 * 🚨 `key` IS A DATABASE VALUE, NOT A LABEL. `website_career_apply` (migration
 * 0093) whitelists exactly these eleven strings server-side and rejects
 * anything else, and the admin desk filters on them. Renaming one here without
 * changing the migration breaks every apply button on that tab — silently, with
 * a polite "Please choose a role to apply for." Add a role in BOTH places or in
 * neither.
 *
 * ⚠️ `label` is sent alongside the key and stored beside it, so the desk can
 * still read what somebody applied for after a family is renamed or retired.
 * That is why the column is not derived from the key.
 *
 * ── THE THREE COLOURS, AND WHY THERE ARE THREE ─────────────────────────────
 * Identical in structure to `components/security/security-features.ts`, and for
 * the same measured reasons:
 *
 *   `stone`   the FILL — the glass tint, the active chip, the rule. Carries no
 *             ratio of its own; measured against WHITE, because white is the
 *             only thing ever set on it. Worst is vermilion at 4.64.
 *   `ink`     the WORD on sand. Three stones are too light to be read at a
 *             heading size on the canvas — gilt-700 is 4.20:1, jade 4.05 and
 *             vermilion 3.64 — so those three take a darkened cousin. The
 *             other eight are the stone itself.
 *   `inkDark` the WORD on carbon, where ALL of them fail: sapphire measures
 *             1.93:1 on the dark card and garnet 1.69. `.rj-sec-title` in
 *             royal.css swaps to this under `[data-mode="dark"]`.
 *
 * Every value below is carried over from the security page's own sweep rather
 * than re-derived, so the two pages cannot drift into two different blues.
 */
export type CareerRole = {
  key: string;
  /**
   * The chip.
   *
   * ⚠️ SHORT IS A MEASUREMENT. Eleven chips share one wrapping strip and each
   * carries an emoji, so they are wider than /security's. The first cut
   * ("Business Development", "Customer Relationships", "Site & Projects")
   * wrapped to SEVEN rows at 375px — a screenful of navigation before the
   * reader reached a single role. Trimming those three to their nouns brought
   * it down. Re-measure the row count at 375 before lengthening one.
   *
   * It costs nothing: `label` carries the full name, the panel restates it, and
   * `label` — not this — is what is stored against the application.
   */
  tab: string;
  /** Sent to the RPC and stored; the words above the button they pressed. */
  label: string;
  icon: string;
  /** His `###` line. */
  tagline: string;
  blurb: string[];
  /** "What you'll do" / "Responsibilities" / "Ideal for" / "We're interested in". */
  pointsLabel: string;
  points: string[];
  /** "We're looking for", where he wrote one. */
  looking?: string;
  /** The `→` button at the foot of his section. */
  cta: string;
  stone: string;
  /**
   * 🚨 THE PAINT, AND IT IS A LITERAL HEX WHERE EVERYTHING ELSE HERE IS A
   * `var()`. THAT IS THE BUG FIX, NOT AN OVERSIGHT.
   *
   * `royal.css` re-points four colour tokens under `[data-mode="dark"]` so they
   * stay legible as INK on carbon: canopy → #86b8ae, plat-800 → plat-300,
   * champagne-700 → champagne-300, garnet → #c98b84. Every one of those is a
   * pale pastel, which is exactly right for a word on a dark ground and exactly
   * wrong underneath one. Painting a chip with `var(--color-canopy)` and
   * setting white on it therefore measured 9.91:1 in light mode and 2.21:1 in
   * dark — white type on a mint wash.
   *
   * Measured on the four, dark mode, white label: canopy 2.21, garnet 2.80,
   * champagne-700 2.23, plat-800 1.93. All four shipped that way on /security
   * for part of a day; the first sweep only sampled the one chip that happened
   * to be selected (sapphire, which is not remapped) and passed.
   *
   * So the FILL is pinned to the light value and cannot follow a remap. `ink`
   * and `inkDark` still do the mode switching, which is where mode switching
   * belongs — on the word, never on the ground beneath it.
   *
   * ⚠️ DO NOT "TIDY" THIS BACK INTO A TOKEN. A token that is correct as ink and
   * a colour that is correct as a fill are two different facts about the same
   * hue, and this file needs both.
   */
  fill: string;
  ink: string;
  inkDark: string;
};

export const CAREER_ROLES: CareerRole[] = [
  {
    key: "promoter",
    tab: "Promoters",
    label: "Jamin Promoters",
    icon: "🤝",
    tagline: "Know people? Know property? Let's talk.",
    blurb: [
      "Become part of the Jamin promoter network and introduce genuine buyers to Jamin Bazaar properties.",
    ],
    pointsLabel: "What you'll do",
    points: [
      "Connect prospective buyers with Jamin projects",
      "Generate and follow up qualified leads",
      "Arrange property and site visits",
      "Explain projects, locations and opportunities",
      "Build your own buyer network",
      "Work closely with the Jamin team",
      "Earn commissions on successful business",
    ],
    looking:
      "Good communication. Local connections. Energy. Integrity. Follow-up. Experience helps. Hunger helps more.",
    cta: "Become a Jamin Promoter",
    stone: "var(--color-emerald)",
    fill: "#3d5758", // emerald
    ink: "var(--color-emerald)", // 6.09:1 on sand
    inkDark: "#7fa8a9", // 7.39:1 on onyx-900
  },
  {
    key: "broker",
    tab: "Brokers",
    label: "Real Estate Brokers & Channel Partners",
    icon: "🏡",
    tagline: "Bring your network. We'll bring the opportunities.",
    blurb: [
      "Already working in property?",
      "Partner with Jamin Bazaar and gain access to selected projects, sales support, project information and opportunities to grow your business.",
    ],
    pointsLabel: "Ideal for",
    points: [
      "Independent property brokers",
      "Real-estate agencies",
      "Channel partners",
      "Property consultants",
      "Local market specialists",
    ],
    looking: "Good property deserves a good network.",
    cta: "Partner With Jamin",
    stone: "var(--color-sapphire)",
    fill: "#1b3e8c", // sapphire
    ink: "var(--color-sapphire)", // 7.78:1
    inkDark: "#8fa8e0", // 8.09:1
  },
  {
    key: "bizdev",
    tab: "Business Dev",
    label: "Business Development Executives / Managers",
    icon: "🚀",
    tagline: "If you can open doors, we'll give you somewhere to go.",
    blurb: [
      "Help identify new markets, partnerships, land opportunities and revenue channels for Jamin Bazaar.",
    ],
    pointsLabel: "What you'll do",
    points: [
      "Develop new business opportunities",
      "Build relationships with landowners, investors and partners",
      "Develop broker and promoter networks",
      "Identify potential projects and markets",
      "Negotiate and manage partnerships",
      "Support regional expansion",
      "Work towards business and revenue targets",
    ],
    looking:
      "Strong communicators and negotiators with commercial instinct, local-market understanding and the drive to turn conversations into business.",
    cta: "Build With Us",
    stone: "var(--color-vermilion)",
    fill: "#d3401f", // vermilion
    ink: "#ad3419", // 5.01:1 — vermilion itself is 3.64 and too light for a word
    inkDark: "#f0a07f", // 8.6:1
  },
  {
    key: "crm",
    tab: "Relationships",
    label: "Customer Relationship Managers",
    icon: "❤️",
    tagline: "Property is the transaction. Trust is the business.",
    blurb: ["Be the person our customers know they can call."],
    pointsLabel: "What you'll do",
    points: [
      "Handle buyer enquiries and follow-ups",
      "Guide customers through property options",
      "Coordinate site visits",
      "Maintain long-term customer relationships",
      "Assist buyers throughout the purchase journey",
      "Coordinate between customers, promoters and internal teams",
      "Maintain CRM records and lead pipelines",
    ],
    looking:
      "Warm communicators who listen well, follow through and know how to make customers feel looked after. Multilingual ability and real-estate or customer-service experience are an advantage.",
    cta: "Meet Your Next Customer",
    stone: "var(--color-jamin-red)",
    fill: "#c90202", // jamin-red
    ink: "var(--color-jamin-red)", // 4.71:1
    inkDark: "#e8887c", // 7.54:1
  },
  {
    key: "sales",
    tab: "Sales",
    label: "Property Sales Executives",
    icon: "📈",
    tagline: "Don't just show property. Sell the possibility.",
    blurb: [
      "Take buyers from their first enquiry to their first walk across the land they may one day own.",
    ],
    pointsLabel: "What you'll do",
    points: [
      "Handle incoming and generated leads",
      "Understand buyer requirements",
      "Present suitable Jamin properties",
      "Conduct site visits",
      "Negotiate and follow up",
      "Work towards sales targets",
      "Coordinate booking and documentation processes",
    ],
    looking:
      "Real-estate sales experience is preferred, but confidence, communication and persistence matter enormously.",
    cta: "Start Selling",
    stone: "var(--color-gilt-700)",
    fill: "#8a6414", // gilt-700
    ink: "#7b5912", // 5.02:1 — gilt-700 itself is 4.20
    inkDark: "#d4b168", // 9.41:1
  },
  {
    key: "site",
    tab: "Site Teams",
    label: "Site & Project Coordinators",
    icon: "🌱",
    tagline: "Where plans leave the screen and meet the ground.",
    blurb: ["Help keep Jamin developments organised, progressing and ready for customers."],
    pointsLabel: "Responsibilities may include",
    points: [
      "Site coordination",
      "Contractor and vendor follow-up",
      "Development progress monitoring",
      "Site readiness",
      "Customer visit coordination",
      "Documentation and reporting",
      "Liaison between site and office teams",
    ],
    looking:
      "Experience in real estate, construction, civil works or project coordination is preferred.",
    cta: "Join the Ground Team",
    stone: "var(--color-canopy)",
    fill: "#2f4749", // canopy  ⚠ REMAPPED in carbon
    ink: "var(--color-canopy)", // 7.76:1
    inkDark: "#86b8ae", // 8.67:1
  },
  {
    key: "security",
    tab: "Security",
    label: "Security Personnel & Supervisors",
    icon: "🛡️",
    tagline: "People sleep better when someone good is watching.",
    blurb: ["Help protect Jamin communities, residents, visitors and properties."],
    pointsLabel: "Responsibilities",
    points: [
      "Entrance and exit management",
      "Visitor verification",
      "CCTV and security-system monitoring",
      "Regular premises patrols",
      "Emergency response",
      "Incident reporting",
      "Supporting resident and visitor safety",
      "Coordinating with smart access and security systems where deployed",
    ],
    looking:
      "We value alertness, discipline, courtesy and responsibility. Previous security experience is preferred for applicable positions.",
    cta: "Stand With Jamin",
    /* ⚠️ THE SAME GARNET /security WEARS, deliberately. lib/stones.ts's rule is
       that the tab you came in on and the blocks you land among agree; this is
       the one role family that has a whole page of its own, and the two are
       cross-linked. A different red here would make one subject read as two. */
    stone: "var(--color-garnet)",
    fill: "#7a0404", // garnet ⚠ REMAPPED in carbon
    ink: "var(--color-garnet)", // 8.91:1
    inkDark: "#c98b84", // 6.87:1
  },
  {
    key: "marketing",
    tab: "Marketing",
    label: "Digital Marketing & Social Media",
    icon: "📣",
    tagline: "Make people stop scrolling and start looking.",
    blurb: ["Help turn properties into stories people want to explore."],
    pointsLabel: "We're interested in",
    points: [
      "Digital marketers",
      "Performance marketers",
      "Social-media specialists",
      "Content creators",
      "Videographers & photographers",
      "SEO professionals",
      "Content writers",
    ],
    looking: "If you understand property + people + the internet, we'd like to hear from you.",
    cta: "Make Some Noise",
    stone: "var(--color-amethyst)",
    fill: "#6b3fa0", // amethyst
    ink: "var(--color-amethyst)", // 5.78:1
    inkDark: "#b895d8", // 7.62:1
  },
  {
    key: "design",
    tab: "Design",
    label: "Graphic & Creative Designers",
    icon: "🎨",
    tagline: "If you have opinions about fonts, you'll fit right in.",
    blurb: [
      "Create campaigns, property creatives, brochures, digital experiences and brand communication that make Jamin unmistakably Jamin.",
    ],
    pointsLabel: "We're looking for",
    points: [
      "Strong visual taste",
      "Original thinking",
      "A portfolio that speaks before you do",
    ],
    cta: "Show Us Your Work",
    stone: "var(--color-jade)",
    fill: "#587270", // jade
    ink: "#4c6361", // 5.03:1 — jade itself is 4.05
    inkDark: "#a8c4bd", // 10.34:1
  },
  {
    key: "tech",
    tab: "Technology",
    label: "Technology & Product",
    icon: "💻",
    tagline: "Real estate has plenty of land. We still need a good stack.",
    blurb: [
      "Jamin Bazaar is also a technology platform connecting buyers, sellers, promoters and property opportunities.",
    ],
    pointsLabel: "Opportunities may include",
    points: [
      "Full Stack Developers",
      "Frontend Developers",
      "Backend Developers",
      "Mobile App Developers",
      "UI/UX Designers",
      "QA & Testing",
      "Product & Technical Support",
    ],
    looking: "Help us build the technology behind the property experience.",
    cta: "Build Jamin",
    stone: "var(--color-plat-800)",
    fill: "#5d5548", // plat-800 ⚠ REMAPPED in carbon
    ink: "var(--color-plat-800)", // 5.75:1
    inkDark: "#c6b9a6", // 9.97:1
  },
  {
    key: "open",
    tab: "Something Else",
    label: "Open Application",
    icon: "✨",
    tagline: "Good. Maybe we haven't invented it yet.",
    blurb: [
      "If you believe you can bring something valuable to Jamin Bazaar, don't wait for us to write the perfect job description.",
      "Tell us what you're good at. Tell us what you can build, sell, improve, protect, create or grow.",
      "We'll listen.",
    ],
    pointsLabel: "Tell us",
    points: [
      "What you are good at",
      "What you have built, sold or run before",
      "Where you are, and where you can work",
      "What you would want to do here",
    ],
    cta: "Introduce Yourself",
    stone: "var(--color-champagne-700)",
    fill: "#6c533b", // champagne-700 ⚠ REMAPPED in carbon
    ink: "var(--color-champagne-700)", // 5.60:1
    inkDark: "#c9a884", // 8.62:1
  },
];

/** ⚠️ Must stay in step with the whitelist inside `website_career_apply`. */
export const CAREER_ROLE_KEYS = CAREER_ROLES.map((r) => r.key);
