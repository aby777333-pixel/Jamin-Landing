import Link from "next/link";
import type { ReactNode } from "react";
import { ZoomableImage } from "@/components/cadastral/ZoomableImage";

/**
 * A deliberately small Markdown renderer.
 *
 * Two reasons it is hand-written rather than a library:
 *
 *  1. It never produces raw HTML. Everything below builds React elements, so
 *     there is no `dangerouslySetInnerHTML` anywhere in the article path and no
 *     markup an author could paste that would execute. Article bodies are
 *     super-admin-only today, but the blast radius of a compromised admin
 *     account should not include every reader's browser.
 *  2. Headings need stable ids for the table of contents, and the TOC needs the
 *     same slugs — generating both from one function is how they stay in step.
 *
 * Supported: ## / ### headings, paragraphs, - and 1. lists, > quotes, ---,
 * **bold**, *italic*, `code`, [links](…), a standalone ![image](…), GFM pipe
 * TABLES, and a standalone link to a document, which becomes a download card.
 * Anything else renders as plain text, which is the safe failure.
 *
 * ⚠️ Tables were added 2026-08-09 because an author had already tried to write
 * one and, finding it unsupported, flattened it into em-dashed prose —
 * "Move in — ❌ No, you must build first — ✅ Usually immediate…" — which is
 * unreadable as a comparison and worthless to a screen reader, since nothing
 * ties a value to its column. A renderer that silently degrades a table is
 * worse than one that refuses it, because the damage lands on the reader
 * rather than the author.
 *
 * Images, links and downloads all go through `safeHref`, so an author cannot
 * introduce a `javascript:` or `data:` URL through the body — the same reason
 * this file builds React elements rather than HTML.
 */

/**
 * Extensions that get the download-card treatment when a link stands alone on
 * its own line. Deliberately a closed list of document types: anything else is
 * a normal inline link, so a stray URL on its own line does not turn into a
 * card that implies "downloadable file" when it is a web page.
 */
const DOC_EXT = /\.(pdf|docx?|xlsx?|csv|pptx?|zip|dwg|kml|kmz)(\?|#|$)/i;

const DOC_LABEL: Record<string, string> = {
  pdf: "PDF",
  doc: "Word",
  docx: "Word",
  xls: "Spreadsheet",
  xlsx: "Spreadsheet",
  csv: "CSV",
  ppt: "Slides",
  pptx: "Slides",
  zip: "Archive",
  dwg: "CAD drawing",
  kml: "Map data",
  kmz: "Map data",
};

function docKind(href: string): string {
  const m = /\.([a-z0-9]+)(?:\?|#|$)/i.exec(href);
  return DOC_LABEL[(m?.[1] ?? "").toLowerCase()] ?? "File";
}

export function headingSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

export type Heading = { level: 2 | 3; text: string; id: string };

/** The headings, for the table of contents (§143). */
export function extractHeadings(md: string): Heading[] {
  const out: Heading[] = [];
  for (const line of (md ?? "").split("\n")) {
    const m = /^(#{1,4})\s+(.*)$/.exec(line.trim());
    if (!m) continue;
    const text = m[2].trim();
    // Must mirror parse() exactly or the contents list points at ids that the
    // headings never got.
    out.push({ level: m[1].length >= 3 ? 3 : 2, text, id: headingSlug(text) });
  }
  return out;
}

/** Only http(s) and same-site paths. Anything else is rendered as plain text. */
function safeHref(href: string): string | null {
  const h = href.trim();
  if (/^https?:\/\//i.test(h)) return h;
  if (h.startsWith("/")) return h;
  if (h.startsWith("#")) return h;
  return null;
}

const INLINE = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)\s]+\))/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(INLINE).filter((s) => s !== "");
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={key} className="font-semibold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^\*[^*]+\*$/.test(part)) return <em key={key}>{part.slice(1, -1)}</em>;
    if (/^`[^`]+`$/.test(part)) {
      return (
        <code key={key} className="rounded bg-canvas-sunken px-1.5 py-0.5 text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const href = safeHref(link[2]);
      if (!href) return <span key={key}>{link[1]}</span>;
      const cls = "text-jamin-red-deep underline underline-offset-2 hover:opacity-70";
      return href.startsWith("/") ? (
        <Link key={key} href={href} className={cls}>
          {link[1]}
        </Link>
      ) : (
        <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
          {link[1]}
        </a>
      );
    }
    return <span key={key}>{part}</span>;
  });
}

type Block =
  | { t: "h"; level: 2 | 3; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[] }
  | { t: "quote"; text: string }
  | { t: "img"; src: string; alt: string }
  | { t: "doc"; href: string; label: string; kind: string }
  | { t: "table"; head: string[]; rows: string[][] }
  | { t: "pre"; text: string }
  | { t: "hr" };

/**
 * A line that is part of a drawn diagram rather than prose.
 *
 * 🚨 THE READER HAD NO PREFORMATTED BLOCK AT ALL — not for fences, not for
 * anything — so an ASCII diagram fell through to `p`, where `para.join(" ")`
 * welded its rows into one paragraph and the proportional font scattered the
 * box characters across four ragged lines. Reported 2026-08-15 on the
 * building-envelope diagram in the plot-shape guide.
 *
 * ⚠️ Detected by CHARACTER, not by indentation. The usual Markdown rule is
 * "four spaces = code", and it is useless here: the console's converter strips
 * leading whitespace on the way in, so by the time a diagram reaches the
 * database its indentation is already gone. Box-drawing characters survive
 * that, and they never occur in ordinary prose — which is what makes this safe
 * to trigger on without a fence.
 */
const BOX_DRAWING = /[\u2500-\u257f]/;

/**
 * `| a | b |` → ["a", "b"]. Leading and trailing pipes are optional.
 *
 * ⚠️ Splits on UNESCAPED pipes only. A cell can legitimately contain one — a
 * width, an either/or — and the admin console escapes those as `\|` when it
 * converts a pasted table. A naive split would end the cell there and shift
 * every value in the row one column left, which is worse than not rendering
 * the table at all, because it looks correct.
 */
function splitRow(line: string): string[] {
  return line
    .replace(/^\s*\|/, "")
    .replace(/(?<!\\)\|\s*$/, "")
    .split(/(?<!\\)\|/)
    .map((c) => c.replace(/\\\|/g, "|").trim());
}

/** The `|---|:--:|` line that makes the row above it a header. */
function isDivider(line: string): boolean {
  const cells = splitRow(line);
  return cells.length > 0 && cells.every((c) => /^:?-{1,}:?$/.test(c));
}

/**
 * ⚠️ REPAIR PASS FOR CALLOUTS THE PASTE CONVERTER WELDED SHUT.
 *
 * `admin.html`'s `htmlToMarkdown` drops the line break between a callout's
 * title and its body, so a pasted box arrives as one run:
 *
 *   > 🚨 THE WHATSAPP RULEA concession casually promised on WhatsApp …
 *   … difficult to enforce.**Get negotiated concessions properly documented.**
 *
 * Seven of sixteen published articles carry it, 32 occurrences in three shapes.
 * It is fixed HERE rather than in the stored bodies because the converter will
 * keep producing it on the next paste — repairing the data alone would fix
 * today's articles and none of tomorrow's.
 *
 * ⚠️ THE ALL-CAPS SHAPE IS NOT FIXED HERE. "THE WHATSAPP RULEA concession…"
 * is left alone deliberately: the only thing separating it from ordinary prose
 * is that the capital beginning the new sentence happens to be a word, and a
 * regex broad enough to catch "RULEA concession" also splits "DTCP APPROVED
 * and…" into "APPROVE / D and". Those are repaired in the stored bodies
 * instead, where each one can be read before it is changed.
 *
 * ⚠️ EVERY RULE HERE INSERTS A BLANK LINE, so none of them may run over a
 * table row or a fenced code block — a newline inside `| a | b |` stops it
 * being a row and the table falls apart into text. That is why this walks
 * lines rather than the whole document.
 */
const WELD_RULES: [RegExp, string][] = [
  // "…enforce.**Get negotiated…" → the bold starts its own line
  [/([a-z.!?…"'])\*\*([A-Z])/g, "$1\n\n**$2"],
  // "**Title****Body**" → two runs that were never meant to touch
  [/\*\*\*\*/g, "**\n\n**"],
  /* ⚠️ Two UNBOLDED shapes the converter also produces: a finished sentence run
     straight into the next one ("…in writing.Get it in writing") and a lead-in
     run straight into its answer ("ask:What the layout is"). The MISSING SPACE
     is the whole safety argument — ordinary prose always has one, so "…in
     writing. Get" cannot match, and neither can "10:30" or "https://" since
     both want a capital immediately after. Measured against all 19 published
     bodies once the stored text was repaired: zero matches, so these change
     nothing today and only catch the next paste. */
  [/([a-z][.!?]["”']?)([A-Z])/g, "$1\n\n$2"],
  [/(:)([A-Z])/g, "$1\n\n$2"],
];

function healWeldedCallouts(md: string): string {
  let fenced = false;
  return md
    .split("\n")
    .map((line) => {
      if (/^\s*```/.test(line)) {
        fenced = !fenced;
        return line;
      }
      // Code is quoted verbatim, and a table row is structure, not prose.
      // A drawn diagram is neither — and the sentence-splitting rules below
      // would happily insert a paragraph break inside one.
      if (fenced || /^\s*\|/.test(line) || BOX_DRAWING.test(line)) return line;
      return WELD_RULES.reduce((acc, [re, to]) => acc.replace(re, to), line);
    })
    .join("\n");
}


/**
 * Re-close a box whose inner padding was destroyed on the way in.
 *
 * 🚨 THIS REPAIRS DAMAGED CONTENT, AND IT IS A DELIBERATE, NARROW CHOICE.
 * The console's converter collapses runs of spaces, so a diagram authored as
 * "|          SETBACK          |" reaches the database as "| SETBACK |". The
 * characters survive; the padding does not. Rendered honestly in monospace that
 * is a box with a ragged right edge - better than the reflowed prose it
 * replaced, and still visibly broken.
 *
 * The repair is bounded to the one case where intent is unambiguous: a line
 * that BEGINS and ENDS with a vertical rule is a row of a box, and a box's
 * right edge is straight. Such lines are padded to the width of the widest line
 * in the block. Nothing else is touched - no centring is guessed, no characters
 * are added or removed, and any line that does not both open and close with a
 * rule is left exactly as written.
 *
 * ⚠️ IT IS NOT A SUBSTITUTE FOR FIXING THE CONVERTER. This restores the frame,
 * not the author's spacing: labels sit left where they were centred. The real
 * fix is upstream in admin.html's htmlToMarkdown, after which the affected
 * articles have to be re-pasted - the same conclusion the lost Markdown
 * markers reached.
 */
function squareUp(lines: string[]): string[] {
  const RULE = /[\u2502\u2503\u2551|]/;
  const isRow = (t: string) => t.length > 1 && RULE.test(t[0]) && RULE.test(t[t.length - 1]);
  const rows = lines.filter((l) => isRow(l.trimEnd()));
  if (rows.length < 2) return lines;
  const width = Math.max(...lines.map((l) => l.trimEnd().length));
  return lines.map((l) => {
    const t = l.trimEnd();
    if (t.length >= width || !isRow(t)) return l;
    return t.slice(0, -1) + " ".repeat(width - t.length) + t[t.length - 1];
  });
}

function parse(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = healWeldedCallouts(md ?? "").replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  /* A run of diagram lines is gathered verbatim — no joining, no welding, no
     inline markdown. `pre` is the only block whose text is its own content. */
  let pre: string[] | null = null;
  const flushPre = () => {
    if (pre) {
      /* Trailing blank lines inside a diagram are padding, not structure. */
      while (pre.length && !pre[pre.length - 1].trim()) pre.pop();
      if (pre.length) blocks.push({ t: "pre", text: squareUp(pre).join("\n") });
      pre = null;
    }
  };

  const flushPara = () => {
    if (para.length) {
      blocks.push({ t: "p", text: para.join(" ").trim() });
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push(list.ordered ? { t: "ol", items: list.items } : { t: "ul", items: list.items });
      list = null;
    }
  };

  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li];
    const line = raw.trim();

    /* ⚠️ THE DIAGRAM TEST COMES FIRST, before the blank-line rule, because a
       drawn box legitimately contains blank-looking rows and losing them
       collapses the figure. While a run is open every line is taken verbatim —
       `raw`, not `line`, so what indentation survived the console is kept. */
    if (pre) {
      if (BOX_DRAWING.test(raw) || (raw.trim() && pre.length)) {
        pre.push(raw);
        continue;
      }
      flushPre();
    } else if (BOX_DRAWING.test(raw)) {
      flushPara();
      flushList();
      pre = [raw];
      continue;
    }

    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (/^---+$/.test(line)) {
      flushPara();
      flushList();
      blocks.push({ t: "hr" });
      continue;
    }
    // An image on its own line becomes a block, which is how the admin console
    // appends one. Checked before the link rule below, since `![a](b)` also
    // matches a link once the leading `!` is ignored.
    const img = /^!\[([^\]]*)\]\((\S+)\)$/.exec(line);
    if (img) {
      const src = safeHref(img[2]);
      if (src) {
        flushPara();
        flushList();
        blocks.push({ t: "img", src, alt: img[1].trim() });
        continue;
      }
    }
    // `#` is accepted and rendered as an h2. A pasted document usually opens
    // with its own title as H1, and the page already renders the article title
    // as the one h1 — emitting a second would break the outline a screen reader
    // navigates by. Demoting is better than dropping it to plain text.
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      flushList();
      blocks.push({ t: "h", level: h[1].length >= 3 ? 3 : 2, text: h[2].trim() });
      continue;
    }
    const q = /^>\s?(.*)$/.exec(line);
    if (q) {
      flushPara();
      flushList();
      blocks.push({ t: "quote", text: q[1].trim() });
      continue;
    }
    // A GFM pipe table: a row, then a `|---|` divider, then body rows. Requires
    // the divider, so a sentence that merely contains a pipe is left alone.
    if (line.includes("|") && li + 1 < lines.length && isDivider(lines[li + 1].trim())) {
      const head = splitRow(line);
      const rows: string[][] = [];
      let j = li + 2;
      for (; j < lines.length; j++) {
        const r = lines[j].trim();
        if (!r || !r.includes("|")) break;
        const cells = splitRow(r);
        // Ragged rows are padded rather than dropped. A missing trailing cell is
        // the commonest thing a hand-written table gets wrong, and losing the
        // row loses the comparison the table exists to make.
        while (cells.length < head.length) cells.push("");
        rows.push(cells.slice(0, head.length));
      }
      flushPara();
      flushList();
      blocks.push({ t: "table", head, rows });
      li = j - 1;
      continue;
    }

    // A document link alone on its line becomes a download card. Checked before
    // the list rules so an author can put one between two paragraphs.
    const doc = /^\[([^\]]+)\]\((\S+)\)$/.exec(line);
    if (doc && DOC_EXT.test(doc[2])) {
      const href = safeHref(doc[2]);
      if (href) {
        flushPara();
        flushList();
        blocks.push({ t: "doc", href, label: doc[1].trim(), kind: docKind(href) });
        continue;
      }
    }

    const ul = /^[-*]\s+(.*)$/.exec(line);
    const ol = /^\d+[.)]\s+(.*)$/.exec(line);
    if (ul || ol) {
      flushPara();
      const ordered = !!ol;
      const item = (ul ?? ol)![1].trim();
      if (list && list.ordered !== ordered) flushList();
      if (!list) list = { ordered, items: [] };
      list.items.push(item);
      continue;
    }

    flushList();
    para.push(line);
  }
  flushPre();
  flushPara();
  flushList();
  return blocks;
}

export function Prose({ markdown }: { markdown: string }) {
  const blocks = parse(markdown);

  /** The first paragraph of the piece, so it can be set as the standfirst. Only
   *  when it genuinely opens the article — a paragraph that follows a heading
   *  is body copy, not an opening. */
  const leadIndex = blocks.findIndex((b) => b.t === "p");
  const isLead = (i: number) => i === leadIndex && blocks.slice(0, i).every((b) => b.t === "p");

  return (
    <div className="cd-article space-y-phi3">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h": {
            const id = headingSlug(b.text);
            return b.level === 2 ? (
              /* `cd-h2` drives the CSS section counter — see cadastral.css. The
                 number is generated, so it renumbers itself when a heading is
                 added or moved and cannot drift out of step with the page. */
              <h2 id={id} key={i} className="cd-h2 scroll-mt-28 pt-phi3 text-2xl text-ink">
                {inline(b.text, `h${i}`)}
              </h2>
            ) : (
              <h3 id={id} key={i} className="scroll-mt-28 pt-phi2 text-xl text-ink">
                {inline(b.text, `h${i}`)}
              </h3>
            );
          }
          case "p":
            return (
              <p
                key={i}
                className={
                  isLead(i) ? "cd-lead" : "text-lg leading-relaxed text-ink-soft"
                }
              >
                {inline(b.text, `p${i}`)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-lg leading-relaxed text-ink-soft">
                    {/* A gold lozenge rather than a dot — the mark a surveyor
                        sets rather than the bullet a word processor offers.
                        Still an element and not a `::marker`, because it has to
                        stay aligned with the first line of a wrapped item. */}
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] bg-jamin-gold" />
                    <span>{inline(it, `ul${i}-${j}`)}</span>
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-lg leading-relaxed text-ink-soft">
                    <span className="mt-0.5 shrink-0 text-base font-semibold text-jamin-gold-ink tabular-nums">
                      {j + 1}.
                    </span>
                    <span>{inline(it, `ol${i}-${j}`)}</span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote key={i} className="cd-quote my-phi3 text-xl leading-relaxed text-ink">
                {inline(b.text, `q${i}`)}
              </blockquote>
            );
          case "img":
            // Every image in an article body is zoomable, for the same reason
            // the cover is: a plan, a rate table or a checklist pasted into a
            // guide is unreadable at column width. Applies to whatever is
            // uploaded next without anyone remembering to opt in.
            return (
              <ZoomableImage
                key={i}
                src={b.src}
                alt={b.alt}
                sizes="(max-width: 768px) 100vw, 720px"
              />
            );
          case "table":
            return (
              /* ⚠️ The scroller is the point, not a nicety. A three-column
                 comparison cannot fit a 375px screen, and the alternatives are
                 both worse: shrink the type until it is unreadable, or let the
                 table push the page wider and break every other section's
                 layout. It scrolls inside its own box so nothing outside it
                 moves. `tabular-nums` keeps figures in columns. */
              <div key={i} className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
                <table className="w-full min-w-[34rem] border-collapse text-left tabular-nums">
                  {b.head.length > 0 && (
                    <thead>
                      <tr>
                        {b.head.map((c, j) => (
                          <th
                            key={j}
                            scope="col"
                            className="border-b border-jamin-gold/45 py-phi2 pr-phi3 text-micro font-semibold uppercase tracking-brand text-jamin-gold-ink last:pr-0"
                          >
                            {inline(c, `th${i}-${j}`)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r} className="align-top">
                        {row.map((c, j) => (
                          /* The first cell of each row is the row's own header —
                             that is what lets a screen reader read "Move in,
                             Plot, no you must build first" instead of three
                             unattached values. It is the whole reason the
                             flattened prose version had to go. */
                          <td
                            key={j}
                            {...(j === 0 ? { scope: "row" as const } : {})}
                            className={`border-b border-line py-phi2 pr-phi3 leading-relaxed last:pr-0 ${
                              j === 0 ? "font-semibold text-ink" : "text-ink-soft"
                            }`}
                          >
                            {inline(c, `td${i}-${r}-${j}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "doc":
            return (
              <a
                key={i}
                href={b.href}
                download
                className="group flex items-center gap-phi2 rounded-card border border-line bg-canvas-alt p-phi2 no-underline transition-colors duration-300 hover:border-jamin-gold/60"
              >
                <span
                  aria-hidden="true"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-jamin-gold-soft text-jamin-gold-ink"
                >
                  ▤
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-base font-semibold text-ink group-hover:text-jamin-red-deep">
                    {b.label}
                  </span>
                  {/* The kind is spelled out rather than left to the icon: a
                      reader deciding whether to tap a link on mobile data wants
                      to know it is a PDF before it starts downloading. */}
                  <span className="block text-tiny text-ink-muted">{b.kind} · download</span>
                </span>
              </a>
            );
          case "pre":
            return (
              /* ⚠️ `overflow-x-auto` ON THE WRAPPER, not on the <pre>. A diagram
                 is wider than the measure by definition, and this repo's rule is
                 that wide content scrolls inside its own box — the page body
                 must never scroll sideways.
                 ⚠️ NO inline markdown here. `pre` is the one block whose text is
                 its own content: running the emphasis pass over it would eat a
                 `*` in a drawing and re-flow what the whole block exists to
                 preserve. */
              <div key={i} className="-mx-phi2 overflow-x-auto px-phi2">
                {/* ⚠️ `font-mono` SURVIVES THE INTER-ONLY TYPE PATCH, and it is
                    the one deliberate carve-out (the patch's own §7 makes the
                    same shape of exception for script coverage). These blocks
                    hold BOX-DRAWING site diagrams whose columns align by
                    character grid — `| SETBACK |` frames that proportional
                    metrics physically cannot square, however the features are
                    set. It is the PLATFORM mono stack: no font file ships, no
                    request is made, the one-webfont rule holds. */}
                <pre className="w-fit min-w-full rounded-card border border-line bg-canvas-sunken p-phi3 font-mono text-tiny leading-snug text-ink-soft">
                  {b.text}
                </pre>
              </div>
            );
          case "hr":
            return <hr key={i} className="border-line" />;
        }
      })}
    </div>
  );
}
