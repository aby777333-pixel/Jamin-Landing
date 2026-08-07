import Link from "next/link";
import type { ReactNode } from "react";

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
 * **bold**, *italic*, `code` and [links](…). Anything else renders as plain
 * text, which is the safe failure.
 */

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
    const m = /^(#{2,3})\s+(.*)$/.exec(line.trim());
    if (!m) continue;
    const text = m[2].trim();
    out.push({ level: m[1].length === 2 ? 2 : 3, text, id: headingSlug(text) });
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
      const cls = "text-jamin-red underline underline-offset-2 hover:opacity-70";
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
  | { t: "hr" };

function parse(md: string): Block[] {
  const blocks: Block[] = [];
  const lines = (md ?? "").replace(/\r\n/g, "\n").split("\n");
  let para: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

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

  for (const raw of lines) {
    const line = raw.trim();

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
    const h = /^(#{2,3})\s+(.*)$/.exec(line);
    if (h) {
      flushPara();
      flushList();
      blocks.push({ t: "h", level: h[1].length === 2 ? 2 : 3, text: h[2].trim() });
      continue;
    }
    const q = /^>\s?(.*)$/.exec(line);
    if (q) {
      flushPara();
      flushList();
      blocks.push({ t: "quote", text: q[1].trim() });
      continue;
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
  flushPara();
  flushList();
  return blocks;
}

export function Prose({ markdown }: { markdown: string }) {
  const blocks = parse(markdown);

  return (
    <div className="space-y-phi3">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h": {
            const id = headingSlug(b.text);
            return b.level === 2 ? (
              <h2 id={id} key={i} className="scroll-mt-28 pt-phi2 text-2xl text-ink">
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
              <p key={i} className="text-lg leading-relaxed text-ink-soft">
                {inline(b.text, `p${i}`)}
              </p>
            );
          case "ul":
            return (
              <ul key={i} className="space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="flex gap-3 text-lg leading-relaxed text-ink-soft">
                    <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-jamin-gold" />
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
                    <span className="mt-0.5 shrink-0 text-base font-semibold text-jamin-gold tabular-nums">
                      {j + 1}.
                    </span>
                    <span>{inline(it, `ol${i}-${j}`)}</span>
                  </li>
                ))}
              </ol>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="border-l-2 border-jamin-gold pl-phi3 text-lg leading-relaxed text-ink-muted"
              >
                {inline(b.text, `q${i}`)}
              </blockquote>
            );
          case "hr":
            return <hr key={i} className="border-line" />;
        }
      })}
    </div>
  );
}
