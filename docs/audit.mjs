/**
 * Static audit of every public page: SEO metadata, heading order, image alt
 * text, structured-data validity, and internal-link health.
 */
const BASE = process.argv[2] || "http://localhost:8099";

const PUBLIC_PAGES = [
  "/", "/properties", "/projects", "/projects/ongoing", "/projects/future",
  "/projects/completed", "/journal", "/about", "/contact",
  "/property/jamin-garden-shastri-nagar-erode",
  "/property/jamin-new-project-jul-2026",
  "/property/jamin-garden-varapatty",
  "/property/c0e9c29e-8865-45ba-b852-1ab993fb1664",
  /* ⚠️ ADDED 2026-08-15 AFTER THIS LIST WENT STALE AND HID A REAL BUG. Six route
     families shipped without ever being added here — /tools, /downloads,
     /vault, /gazetteer, the district pages and every Journal article — so a
     clean audit run meant "the pages I remembered are fine", not "the site is
     fine". Add a route here the day it ships. */
  "/tools", "/downloads", "/vault", "/gazetteer",
  /* Added with their routes (2026-08-18, the do-all rounds). */
  "/faq", "/visit-checklist", "/ta",
  "/locations/erode", "/locations/salem", "/locations/tiruppur", "/locations/coimbatore",
  /* A sample of Journal articles. The whole set is 39 and grows weekly, so the
     audit takes a representative few rather than crawling the lot — the
     canonical check below is the one that mattered, and it only needs to see
     the shape the console produces. */
  "/journal/does-plot-shape-affect-property-value-in-india-complete-buyers-guide",
  "/journal/is-cheap-land-really-cheap-in-india-hidden-costs-every-buyer-must-know",
  "/journal/how-to-buy-land-in-india-safely-12-costly-mistakes-to-avoid-2026",
];
const PRIVATE_PAGES = ["/account", "/account/sign-in", "/account/partner", "/compare"];

const get = async (p) => {
  const r = await fetch(BASE + p);
  return { status: r.status, html: await r.text() };
};

const one = (html, re) => { const m = html.match(re); return m ? m[1] : null; };
const all = (html, re) => [...html.matchAll(re)].map((m) => m[1]);

const issues = [];
const note = (page, msg) => issues.push(`${page}  ${msg}`);

/* Results are cached: many pages legitimately share a canonical host, and an
   audit should not fetch the same URL forty times. */
const canonSeen = new Map();
const checkCanonical = async (page, href) => {
  const url = href.startsWith("http") ? href : BASE + href;
  if (!canonSeen.has(url)) {
    try {
      const r = await fetch(url, { redirect: "follow" });
      canonSeen.set(url, r.status);
    } catch {
      canonSeen.set(url, 0);
    }
  }
  const st = canonSeen.get(url);
  if (st !== 200) note(page, `CANONICAL DOES NOT RESOLVE (${st || "unreachable"}) -> ${url}`);
};

for (const page of PUBLIC_PAGES) {
  const { status, html } = await get(page);
  if (status !== 200) { note(page, `HTTP ${status}`); continue; }

  const title = one(html, /<title>([^<]*)<\/title>/);
  const desc = one(html, /<meta name="description" content="([^"]*)"/);
  const canon = one(html, /<link rel="canonical" href="([^"]*)"/);
  const robots = one(html, /<meta name="robots" content="([^"]*)"/);
  const og = one(html, /<meta property="og:title" content="([^"]*)"/);

  if (!title) note(page, "MISSING <title>");
  else if (title.length > 70) note(page, `title ${title.length} chars`);
  if (!desc) note(page, "MISSING meta description");
  else if (desc.length > 165) note(page, `meta description ${desc.length} chars`);
  if (!canon) note(page, "MISSING canonical");
  /* 🚨 A CANONICAL THAT EXISTS IS NOT A CANONICAL THAT WORKS. This checked only
     for presence, and 27 of 39 articles quietly declared themselves canonical
     at a /blog/ URL this site has never served — telling crawlers the real
     article was not the authoritative copy. Nothing on the page looked wrong
     and the audit passed for weeks. Fetch it. */
  else await checkCanonical(page, canon);
  if (robots && /noindex/.test(robots)) note(page, `PUBLIC PAGE IS NOINDEX (${robots})`);
  if (!og) note(page, "missing og:title");

  // headings
  const h1 = all(html, /<h1[^>]*>([\s\S]*?)<\/h1>/g);
  if (h1.length === 0) note(page, "no <h1>");
  if (h1.length > 1) note(page, `${h1.length} <h1> elements`);

  // heading order
  const levels = [...html.matchAll(/<h([1-6])[^>]*>/g)].map((m) => Number(m[1]));
  for (let i = 1; i < levels.length; i++) {
    if (levels[i] - levels[i - 1] > 1) {
      note(page, `heading jumps h${levels[i - 1]} -> h${levels[i]}`);
      break;
    }
  }

  // images without alt
  const imgs = [...html.matchAll(/<img\b[^>]*>/g)].map((m) => m[0]);
  const noAlt = imgs.filter((t) => !/\salt=/.test(t));
  if (noAlt.length) note(page, `${noAlt.length}/${imgs.length} <img> without alt`);

  // structured data validity
  for (const raw of all(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(raw);
      if (!j["@type"]) note(page, "ld+json without @type");
    } catch {
      note(page, "INVALID ld+json");
    }
  }

  // lang
  if (!/<html[^>]+lang=/.test(html)) note(page, "no lang on <html>");
}

for (const page of PRIVATE_PAGES) {
  const { status, html } = await get(page);
  const robots = one(html, /<meta name="robots" content="([^"]*)"/);
  if (status !== 200) note(page, `HTTP ${status}`);
  else if (!robots || !/noindex/.test(robots)) note(page, `PRIVATE PAGE NOT NOINDEX (${robots})`);
}

// internal link health across the public set
const seen = new Set();
for (const page of PUBLIC_PAGES) {
  const { html } = await get(page);
  for (const href of all(html, /href="(\/[^"#?]*)"/g)) seen.add(href);
}
for (const href of [...seen]) {
  const r = await fetch(BASE + href, { method: "HEAD" });
  if (r.status >= 400) note("LINK", `${href} -> ${r.status}`);
}

console.log(issues.length ? "ISSUES FOUND:\n" + issues.join("\n") : "No issues found.");
console.log(`\nchecked ${PUBLIC_PAGES.length} public + ${PRIVATE_PAGES.length} private pages, ${seen.size} internal links`);
