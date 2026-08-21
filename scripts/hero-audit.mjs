/**
 * hero-audit — makes a hero swap a checked operation instead of a manual sweep.
 *
 *   node scripts/hero-audit.mjs            audit every hero in the register
 *   node scripts/hero-audit.mjs 84 85      audit only these
 *
 * 🚨 WHY THIS EXISTS. Swapping one hero on 2026-08-21 took three rounds and
 * twenty minutes of hand measurement: renditions built by eye, the manifest
 * edited from memory, the anchor chosen by rendering all three crops, and the
 * scrim re-swept because the new frame was daylight where the old one was dusk.
 * Every one of those steps except the scrim is mechanical, and mechanical steps
 * belong in a script rather than in a person's attention.
 *
 * What it checks, per hero:
 *
 *   RENDITIONS  all three widths present (768 / 1280 / native), and each one's
 *               real pixel size matches what its filename claims.
 *   MANIFEST    TOP_WIDTH and TOP_HEIGHT in PageHero.tsx agree with the file on
 *               disk. A manifest that disagrees with the image is the failure
 *               that produces a letterboxed or clipped band with no error.
 *   RATIO       flags anything that is not the 2:1 house standard, and says
 *               what its anchor travel will be in the standard 829x554 art box
 *               — which is the number that decides whether `artPosition` does
 *               anything at all.
 *   FAMILY      mean luminance and warmth (red minus blue), so a frame graded
 *               in a different session shows up as an outlier before it ships
 *               rather than after somebody notices the page looks cold.
 *
 * ⚠️ WHAT IT DELIBERATELY DOES NOT DO: judge the scrim. Contrast under the copy
 * depends on where the copy sits, which is a property of the PAGE and not of
 * the image — it needs a laid-out DOM. That sweep stays manual and the README
 * records how to do it. This script's job is to make sure everything that CAN
 * be known from the file alone is right before that sweep starts.
 *
 * No dependencies: WebP headers are read directly, so this runs anywhere node
 * does and cannot drift from the project's image tooling.
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const HERO_DIR = join(ROOT, "public", "hero");

/** House standard, and the box the contact/paper heroes actually render in. */
const STANDARD_RATIO = 2.0;
const BOX = { w: 829, h: 554 };
const REQUIRED_SCALED = [768, 1280];

/* ── WebP dimensions, without an image library ───────────────────────────────
   ⚠️ Three container forms and they are not interchangeable: VP8 (lossy), VP8L
   (lossless) and VP8X (extended, which is what an alpha or animation produces).
   Reading only the first is how a tool reports 0x0 for a perfectly good file. */
function webpSize(buf) {
  if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
  const fourcc = buf.toString("ascii", 12, 16);
  if (fourcc === "VP8 ") {
    return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
  }
  if (fourcc === "VP8L") {
    const b = buf.readUInt32LE(21);
    return { w: (b & 0x3fff) + 1, h: ((b >> 14) & 0x3fff) + 1 };
  }
  if (fourcc === "VP8X") {
    const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
    const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
    return { w, h };
  }
  return null;
}

/** The manifest is the source of truth the app reads, so it is parsed from the
 *  component rather than duplicated here — two lists would drift. */
function readManifest() {
  const src = readFileSync(join(ROOT, "src", "components", "PageHero.tsx"), "utf8");
  const grab = (name) => {
    const start = src.indexOf(`const ${name}: Record<HeroArt, number> = {`);
    if (start === -1) return {};
    const end = src.indexOf("};", start);
    const body = src.slice(start, end);
    const out = {};
    /* ⚠️ NOT ANCHORED TO THE LINE START. The manifest packs several entries on
       one line — "6: 1672, 7: 1672, 8: 1672," — so a `^\s*` anchor sees only
       the first of each and reports the rest as missing. That produced 59
       phantom faults on the first working run, including three on LIVE heroes,
       which is exactly the kind of false alarm that gets a checker deleted. */
    for (const m of body.matchAll(/(\d+)\s*:\s*(\d+)\s*,/g)) out[Number(m[1])] = Number(m[2]);
    return out;
  };
  /* ⚠️ THE UNION IS PART OF THE MANIFEST. Only a hero named in `HeroArt` may
     be passed to a page, and only those need TOP_WIDTH / TOP_HEIGHT entries.
     Without this the audit reports every SPARE in the folder as broken — 66
     false positives on the first run, which is the fastest way to make a
     checker that nobody reads. */
  const union = new Set();
  const uStart = src.indexOf("export type HeroArt =");
  if (uStart !== -1) {
    for (const m of src.slice(uStart, src.indexOf(";", uStart)).matchAll(/\b(\d+)\b/g)) {
      union.add(Number(m[1]));
    }
  }
  return { widths: grab("TOP_WIDTH"), heights: grab("TOP_HEIGHT"), union };
}

/** Which heroes a page actually uses, so the report can say what is at stake. */
function readAssignments() {
  const pages = {};
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.name.endsWith(".tsx")) {
        const m = readFileSync(full, "utf8").match(/art=\{(\d+)\}/);
        if (m) {
          const route = full.split("src\\app").pop()?.replace(/\\page\.tsx$/, "").replace(/\\/g, "/") || full;
          pages[Number(m[1])] = route === "" ? "/" : route;
        }
      }
    }
  };
  walk(join(ROOT, "src", "app"));
  return pages;
}

const files = readdirSync(HERO_DIR).filter((f) => /^hero-\d+-\d+\.webp$/.test(f));
const byHero = new Map();
for (const f of files) {
  const [, n, w] = f.match(/^hero-(\d+)-(\d+)\.webp$/);
  const list = byHero.get(Number(n)) ?? [];
  list.push({ file: f, claimed: Number(w) });
  byHero.set(Number(n), list);
}

const { widths, heights, union } = readManifest();
const assigned = readAssignments();
const only = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const heroes = [...byHero.keys()].sort((a, b) => a - b).filter((n) => !only.length || only.includes(n));

let problems = 0;
const rows = [];

for (const n of heroes) {
  const list = byHero.get(n).sort((a, b) => a.claimed - b.claimed);
  const issues = [];

  for (const r of list) {
    const size = webpSize(readFileSync(join(HERO_DIR, r.file)));
    if (!size) { issues.push(`${r.file}: unreadable WebP header`); continue; }
    r.actual = size;
    if (size.w !== r.claimed) issues.push(`${r.file}: filename says ${r.claimed}px, file is ${size.w}px`);
  }

  const top = list[list.length - 1];
  if (!top?.actual) { rows.push({ n, issues }); problems += issues.length; continue; }

  if (union.has(n)) {
    for (const w of REQUIRED_SCALED) {
      if (!list.some((r) => r.claimed === w)) issues.push(`missing the ${w}px rendition`);
    }
  }

  const usable = union.has(n);
  if (usable) {
    if (widths[n] == null) issues.push("in HeroArt but absent from TOP_WIDTH");
    else if (widths[n] !== top.actual.w) issues.push(`TOP_WIDTH says ${widths[n]}, file is ${top.actual.w}`);
    if (heights[n] == null) issues.push("in HeroArt but absent from TOP_HEIGHT");
    else if (heights[n] !== top.actual.h) issues.push(`TOP_HEIGHT says ${heights[n]}, file is ${top.actual.h}`);
  } else if (assigned[n]) {
    issues.push(`used by ${assigned[n]} but missing from the HeroArt union`);
  }

  const ratio = top.actual.w / top.actual.h;
  /* The number that decides whether `artPosition` can move anything: a frame
     wider than the box's own ratio is height-bound and has travel to spend; one
     narrower is width-bound and the anchor is inert. */
  const scale = Math.max(BOX.w / top.actual.w, BOX.h / top.actual.h);
  const travel = Math.round(top.actual.w * scale - BOX.w);

  rows.push({
    n, issues, ratio, travel, usable,
    size: `${top.actual.w}x${top.actual.h}`,
    page: assigned[n] ?? null,
    standard: Math.abs(ratio - STANDARD_RATIO) < 0.02,
  });
  problems += issues.length;
}

const pad = (s, w) => String(s).padEnd(w);
console.log(pad("hero", 6) + pad("size", 12) + pad("ratio", 7) + pad("std", 5) + pad("travel", 8) + "page");
console.log("-".repeat(74));
for (const r of rows) {
  if (!r.size) { console.log(pad(r.n, 6) + "unreadable"); continue; }
  console.log(
    pad(r.n, 6) + pad(r.size, 12) + pad(r.ratio.toFixed(2), 7) +
    pad(r.standard ? "yes" : "—", 5) + pad(r.travel + "px", 8) + (r.page ?? ""),
  );
}

/* 🚨 SEVERITY IS SPLIT, AND IT IS WHAT MAKES THIS RUNNABLE IN CI. A fault on a
   hero a page actually uses breaks that page; the same fault on a spare is a
   note for whoever adopts it later. Failing the build on both means failing it
   on a backlog, and a checker that fails on a backlog gets switched off. */
const liveBroken = rows.filter((r) => r.page && r.issues.length);
const spareBroken = rows.filter((r) => !r.page && r.issues.length);
const liveIssues = liveBroken.reduce((a, r) => a + r.issues.length, 0);

if (liveBroken.length) {
  console.log("\nERRORS — these affect a live page");
  for (const r of liveBroken) for (const i of r.issues) console.log(`  hero-${r.n} (${r.page}): ${i}`);
}
if (spareBroken.length) {
  const n = spareBroken.reduce((a, r) => a + r.issues.length, 0);
  console.log(`\nWARNINGS — ${n} on ${spareBroken.length} spare hero(es), none in use. --verbose to list.`);
  if (process.argv.includes("--verbose")) {
    for (const r of spareBroken) for (const i of r.issues) console.log(`  hero-${r.n}: ${i}`);
  }
}

const live = rows.filter((r) => r.page);
const offStandard = live.filter((r) => !r.standard);
console.log(
  `\n${rows.length} heroes checked, ${live.length} live. ` +
    `${liveIssues} error(s), ${problems - liveIssues} warning(s).`,
);
if (offStandard.length) {
  console.log(
    `${offStandard.length} live hero(es) are not 2:1 — each needs its anchor and scrim swept by hand:\n  ` +
      offStandard.map((r) => `hero-${r.n} (${r.ratio.toFixed(2)}, ${r.travel}px travel, ${r.page})`).join("\n  "),
  );
}
process.exit(liveIssues ? 1 : 0);
