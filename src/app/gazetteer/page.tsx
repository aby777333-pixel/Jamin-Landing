import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { CallbackBand } from "@/components/CallbackBand";
import { getProperties, locationLine, propertyHref, type Property } from "@/lib/properties";
import { districtSlug } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Gazetteer",
  description:
    "Every district, taluk, town, village and locality where Jamin Properties holds land in Tamil Nadu, listed A to Z with the projects that sit in each.",
  alternates: { canonical: "/gazetteer" },
};

/**
 * The gazetteer: every place name this site knows, A to Z.
 *
 * A survey office ships one with its sheets, and it is the index a reader
 * reaches for when they know the PLACE and not the project — which is how
 * anybody looking for land in their own taluk actually searches. The site had
 * district pages and property pages and nothing between them, so "Sulur" and
 * "Poolavari" appeared nowhere a reader could find them.
 *
 * ⚠️ EVERY ENTRY IS A RECORDED FIELD, and the kind is the column it came from —
 * district, taluk, town, village, locality. Nothing is derived, geocoded or
 * inferred: a gazetteer that guesses which taluk a village sits in is a
 * reference work making up references, and this is a site whose argument is
 * that its records are checkable.
 *
 * ⚠️ Names are shown EXACTLY as recorded, including the variants — the same
 * place is entered as "Udumalaipet" (town) and "Udumalaipettai" (locality).
 * Silently normalising them would be editing the record to look tidier, and
 * whichever spelling a reader has on their own document is the one they will
 * search for. Both are here; both lead to the same project.
 */

type Entry = { name: string; kind: string; properties: Property[] };

const KINDS: { key: keyof Property; label: string }[] = [
  { key: "district", label: "District" },
  { key: "taluk", label: "Taluk" },
  { key: "city", label: "Town" },
  { key: "village", label: "Village" },
  { key: "locality", label: "Locality" },
];

function collect(items: Property[]): Entry[] {
  const map = new Map<string, Entry>();

  for (const p of items) {
    for (const { key, label } of KINDS) {
      const raw = p[key];
      if (typeof raw !== "string" || !raw.trim()) continue;
      /* A locality is often recorded as a list — "Shastri Nagar, Railway
         Colony" is two places in one cell. A gazetteer indexes places, so it
         splits them; every other field is a single name and splitting it would
         be wrong, which is why this is scoped to locality alone. */
      const names = key === "locality" ? raw.split(",") : [raw];
      for (const n of names) {
        const name = n.trim();
        if (!name) continue;
        const id = `${name.toLowerCase()}|${label}`;
        const hit = map.get(id);
        if (hit) {
          if (!hit.properties.some((x) => x.id === p.id)) hit.properties.push(p);
        } else {
          map.set(id, { name, kind: label, properties: [p] });
        }
      }
    }
  }

  return [...map.values()].sort((a, b) =>
    a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  );
}

export default async function GazetteerPage() {
  const all = await getProperties();
  const entries = collect(all);

  /* Grouped by initial. `localeCompare` above already ordered them, so the
     groups come out in order without a second sort. */
  const groups = new Map<string, Entry[]>();
  for (const e of entries) {
    const letter = e.name[0].toUpperCase();
    groups.set(letter, [...(groups.get(letter) ?? []), e]);
  }
  const letters = [...groups.keys()];

  return (
    <>
      <PageHero
        art={13}
        tone="paper"
        eyebrow="Index of places"
        title="Gazetteer"
        lead="Every district, taluk, town, village and locality on record, with the projects that sit in each. Names appear exactly as they are written on the documents."
      />

      <Container className="py-phi5">
        {/* The letter rail. Anchors only — no JS, and it degrades to a plain
            list of links if the smooth-scroll never runs. */}
        {letters.length > 1 && (
          <nav aria-label="Jump to letter" className="flex flex-wrap gap-1.5">
            {letters.map((l) => (
              <a
                key={l}
                href={`#letter-${l}`}
                className="ledger rj-deboss flex h-8 w-8 items-center justify-center rounded-md border border-line bg-canvas-alt text-tiny text-ink-muted transition-colors hover:text-champagne-700"
              >
                {l}
              </a>
            ))}
          </nav>
        )}

        <div className="mt-phi5 space-y-phi5">
          {letters.map((letter) => (
            <section key={letter} aria-labelledby={`letter-${letter}`}>
              <h2
                id={`letter-${letter}`}
                className="scroll-mt-[calc(var(--header-h)+1rem)] border-b border-line pb-2 text-2xl font-light text-ink"
              >
                {letter}
              </h2>
              <dl className="mt-phi3 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
                {(groups.get(letter) ?? []).map((e) => (
                  <div key={`${e.name}-${e.kind}`} className="min-w-0">
                    <dt className="flex items-baseline gap-2">
                      <span className="text-base text-ink">{e.name}</span>
                      <span className="ledger-label shrink-0 text-ink-faint">{e.kind}</span>
                    </dt>
                    <dd className="mt-1 space-y-0.5">
                      {/* A district has its own page; everything else leads to
                          the project that records it. Linking a taluk to a
                          district page it merely sits inside would be the kind
                          of inference this file refuses to make. */}
                      {e.kind === "District" && (
                        <Link
                          href={`/locations/${districtSlug(e.name)}`}
                          className="rj-underline block text-tiny text-ink-muted transition-colors hover:text-champagne-700"
                        >
                          All projects in {e.name}
                        </Link>
                      )}
                      {e.properties.map((p) => (
                        <Link
                          key={p.id}
                          href={propertyHref(p)}
                          className="rj-underline block truncate text-tiny text-ink-muted transition-colors hover:text-champagne-700"
                        >
                          {p.project_name ?? p.title}
                          <span className="text-ink-faint"> · {locationLine(p)}</span>
                        </Link>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </Container>

      <CallbackBand />
    </>
  );
}
