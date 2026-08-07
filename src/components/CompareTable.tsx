"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState, ButtonLink } from "./ui";
import { setQuery, useQueryString } from "@/lib/url-state";
import {
  approvalBadges,
  coverImage,
  formatArea,
  formatPrice,
  isSellable,
  locationLine,
  phaseLabel,
  propertyHref,
  typeLabel,
  type Property,
} from "@/lib/properties";

const MAX = 3;

/** Every row the table can show. `same` collapses a row when the projects
 *  agree on it, which is what stops this becoming an unreadable spreadsheet. */
type Row = { label: string; value: (p: Property) => string };

const ROWS: Row[] = [
  { label: "Location", value: (p) => locationLine(p) || "—" },
  { label: "District", value: (p) => p.district ?? "—" },
  { label: "Stage", value: (p) => phaseLabel(p) ?? "—" },
  { label: "Type", value: (p) => typeLabel(p) || "—" },
  { label: "Availability", value: (p) => (isSellable(p) ? "Selling" : p.status === "sold" ? "Sold out" : (p.status ?? "—")) },
  { label: "Price", value: (p) => formatPrice(p) },
  { label: "Total extent", value: (p) => formatArea(p) ?? "—" },
  {
    label: "Plots",
    value: (p) =>
      p.plots_total == null
        ? "—"
        : p.plots_available != null
          ? `${p.plots_available} of ${p.plots_total} available`
          : String(p.plots_total),
  },
  { label: "Approvals", value: (p) => approvalBadges(p).join(", ") || "—" },
  { label: "RERA", value: (p) => p.rera_number ?? "—" },
  { label: "Amenities", value: (p) => (p.amenities ?? []).join(", ") || "—" },
  { label: "Brochure", value: (p) => (p.brochure_url ? "Available" : "—") },
  { label: "Master plan", value: (p) => (p.master_plan_url ? "Available" : "—") },
  { label: "Map pin", value: (p) => (p.lat != null && p.lng != null ? "Recorded" : "—") },
];

export function CompareTable({ all }: { all: Property[] }) {
  // Same rule as the listing: the URL is the state, read through an external
  // store so the page keeps its static prerender. See lib/url-state.ts.
  const search = useQueryString();
  const ids = useMemo(
    () => (new URLSearchParams(search).get("ids") ?? "").split(",").filter(Boolean).slice(0, MAX),
    [search],
  );
  const [showSame, setShowSame] = useState(false);

  function write(next: string[]) {
    const s = new URLSearchParams();
    if (next.length) s.set("ids", next.join(","));
    setQuery(s);
  }

  const chosen = useMemo(
    () => ids.map((id) => all.find((p) => p.id === id)).filter(Boolean) as Property[],
    [ids, all],
  );

  const rows = useMemo(() => {
    if (chosen.length < 2) return [];
    return ROWS.map((r) => {
      const values = chosen.map((p) => r.value(p));
      const same = values.every((v) => v === values[0]);
      return { ...r, values, same };
    });
  }, [chosen]);

  const differing = rows.filter((r) => !r.same);
  const matching = rows.filter((r) => r.same);
  const visible = showSame ? [...differing, ...matching] : differing;

  if (chosen.length < 2) {
    return (
      <div className="mt-phi5 space-y-phi4">
        <EmptyState
          title={chosen.length === 0 ? "Pick two developments" : "Pick one more"}
          body="Choose two or three below, or start from the properties page where every card has a Compare control."
          action={
            <ButtonLink href="/properties" variant="secondary">
              Browse properties
            </ButtonLink>
          }
        />
        <Picker all={all} chosenIds={ids} onChange={write} />
      </div>
    );
  }

  /**
   * Each column needs a readable minimum or the values turn into one word per
   * line — at 375px three columns computed to 67px each, which both looked
   * broken and pushed the page's scroll width out. The table therefore scrolls
   * inside its own container (§106: wide content scrolls itself, never the
   * page) and the header and rows share one template so the columns stay
   * aligned while it does.
   */
  const template = `minmax(6rem,9rem) repeat(${chosen.length}, minmax(11rem,1fr))`;

  return (
    <div className="mt-phi5">
      <div className="-mx-5 overflow-x-auto px-5 lg:mx-0 lg:px-0">
      {/* headers */}
      <div className="grid gap-phi3" style={{ gridTemplateColumns: template }}>
        <div />
        {chosen.map((p) => {
          const cover = coverImage(p);
          return (
            <div key={p.id}>
              <div className="relative aspect-[1.618/1] overflow-hidden rounded-card border border-line bg-canvas-sunken">
                {cover ? (
                  <Image
                    src={cover}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 30vw"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <Link
                href={propertyHref(p)}
                className="mt-phi2 block text-lg text-ink hover:text-jamin-red-deep"
              >
                {p.title}
              </Link>
              <button
                type="button"
                onClick={() => write(ids.filter((x) => x !== p.id))}
                className="mt-1 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-faint hover:text-jamin-red-deep"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      {/* rows */}
      <dl className="mt-phi4 divide-y divide-line border-y border-line">
        {visible.map((r) => (
          <div key={r.label} className="grid gap-phi3 py-phi2" style={{ gridTemplateColumns: template }}>
            <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">{r.label}</dt>
            {r.values.map((v, i) => (
              <dd key={i} className={`text-base ${r.same ? "text-ink-muted" : "text-ink"}`}>
                {v}
              </dd>
            ))}
          </div>
        ))}
      </dl>
      </div>

      <div className="mt-phi3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-tiny text-ink-muted">
          {differing.length} row{differing.length === 1 ? "" : "s"} differ
          {matching.length ? ` · ${matching.length} identical row${matching.length === 1 ? "" : "s"} hidden` : ""}
        </p>
        {matching.length > 0 && (
          <button
            type="button"
            onClick={() => setShowSame((v) => !v)}
            className="text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep"
          >
            {showSame ? "Hide identical rows" : "Show identical rows"}
          </button>
        )}
      </div>

      <p className="mt-phi3 text-tiny leading-relaxed text-ink-faint">
        Prices are not published for these plots — the sales desk confirms the current rate for a
        specific plot. Nothing on this page is an estimate.
      </p>

      <div className="mt-phi4 border-t border-line pt-phi3">
        <Picker all={all} chosenIds={ids} onChange={write} />
      </div>
    </div>
  );
}

function Picker({
  all,
  chosenIds,
  onChange,
}: {
  all: Property[];
  chosenIds: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <h2 className="text-tiny font-semibold uppercase tracking-[0.18em] text-ink">
        Choose developments
      </h2>
      <div className="mt-phi2 flex flex-wrap gap-2">
        {all.map((p) => {
          const on = chosenIds.includes(p.id);
          const full = chosenIds.length >= MAX && !on;
          return (
            <button
              key={p.id}
              type="button"
              disabled={full}
              aria-pressed={on}
              onClick={() =>
                onChange(on ? chosenIds.filter((x) => x !== p.id) : [...chosenIds, p.id].slice(0, MAX))
              }
              title={full ? `Compare up to ${MAX} at once` : undefined}
              className={`rounded-full border px-4 py-2 text-tiny font-medium transition-colors disabled:opacity-40 ${
                on
                  ? "border-ink bg-ink text-canvas"
                  : "border-line bg-canvas text-ink-soft hover:border-ink-faint hover:text-ink"
              }`}
            >
              {p.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
