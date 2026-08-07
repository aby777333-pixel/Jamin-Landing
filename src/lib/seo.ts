/**
 * Length discipline for titles and descriptions.
 *
 * Search engines truncate on pixel width, not character count, but the
 * practical ceilings are around 60 characters for a title and 155 for a
 * description. Overrunning does not break anything — it just means the end of
 * the sentence is replaced by an ellipsis somebody else chose.
 *
 * The audit found every property description over the line: 187 and 191 from
 * the admin's own SEO copy, 263 and 300 from the fallback that sliced the body
 * text. So both sources needed this, not just mine.
 *
 * ⚠️ This trims, it does not rewrite. The admin's copy is still the source —
 * the earlier decision to reuse their SEO text rather than generate competing
 * copy stands. Cutting at a word boundary just means the visible part reads as
 * a sentence instead of stopping mid-word.
 */
const TITLE_MAX = 60;
const DESC_MAX = 155;

function clamp(text: string, max: number): string {
  const s = text.replace(/\s+/g, " ").trim();
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > max * 0.6 ? cut.slice(0, at) : cut).replace(/[,;:.\-–—\s]+$/, "")}…`;
}

export const seoTitle = (t: string) => clamp(t, TITLE_MAX);
export const seoDescription = (d: string) => clamp(d, DESC_MAX);
