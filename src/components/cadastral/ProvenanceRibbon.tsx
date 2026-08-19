import { approvalBadges, type PropertyDetail } from "@/lib/properties";
import { PlanEmboss } from "@/components/cadastral/PlanEmboss";
import { Reveal } from "@/components/Reveal";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";

/**
 * The chain of record: survey → sanction → title → encumbrance → documents,
 * drawn as linked seals rather than listed as prose.
 *
 * This site's entire argument is that its paperwork is checkable — "publish the
 * approval number", "documents on the page". That argument has always been made
 * in sentences and in a chip row. A chain says the thing the sentences say: the
 * links exist, they are in order, and each one is held.
 *
 * 🚨 EVERY LINK IS DROPPED WHEN ITS FIELD IS EMPTY, AND THE ORDER NEVER
 * CLOSES OVER A GAP. A provenance chain with an invented link is not a design
 * flourish, it is a false statement about title. Two fields that LOOK like they
 * belong here are deliberately absent because they are null on every row:
 *   · `patta_khata` — no patta reference is recorded anywhere.
 *   · `rera_number` — likewise, and RERA is a registration claim.
 * Add either and it appears; until then the chain is shorter and true. Same
 * rule `ApprovalStrip` already states for the approval number.
 *
 * ⚠️ Fewer than two links renders NOTHING. A "chain" of one is a chip, and the
 * whole point of the form is the linkage.
 *
 * ⚠️ NO SWEEP ON THE SEALS. `.rj-foil-scroll` would fire every seal at the same
 * scroll position, and royal.css's own note on staggering says a row glinting
 * in sync reads as a page effect rather than as material. The seals are still.
 */
export function ProvenanceRibbon({ p }: { p: PropertyDetail }) {
  const approvals = approvalBadges(p);

  const links: { icon: "grid" | "stamp" | "deed" | "ledger" | "list"; term: string; value: string }[] =
    [];

  if (p.survey_number?.trim()) {
    links.push({ icon: "grid", term: "Survey", value: p.survey_number.trim() });
  }
  /* 🚨 THE APPROVAL NUMBER EXISTS AFTER ALL, and `ApprovalStrip`'s own comment
     says it does not — "`approvals` is a set of boolean flags, not a number".
     That was true of the COLUMN and false of the data: `legal.dtcp_approval_no`
     carries "320/2025". Publishing the approval number is the promise the whole
     site is built on, so where it is recorded the chain states it rather than
     saying "approved" and making the reader take that on trust.
     ⚠️ Still never improvised. No number recorded → the flag's wording, exactly
     as before. */
  /* ⚠️ TWO PLACES CARRY AN APPROVAL NUMBER AND NEITHER IS COMPLETE ON ITS OWN.
     Erode records it in `legal.dtcp_approval_no` ("320/2025"); Edappadi records
     it in the traced sheet as `plot_plan.approvalNo` ("LP/EDP/2026/0148") and
     has no `legal` blob at all. Reading only the first published one project's
     number and silently withheld the other's — on the site whose promise is
     that it publishes the approval number. Checked in that order because
     `legal` is the admin-authored field and the plan's copy is transcribed
     from the drawing. */
  const approvalNo =
    p.legal?.dtcp_approval_no?.trim() || p.plot_plan?.approvalNo?.trim();
  if (approvals.length) {
    links.push({
      icon: "stamp",
      term: "Sanction",
      value: approvalNo ? `${approvals.join(" · ")} ${approvalNo}` : `${approvals.join(" · ")} approved`,
    });
  }
  if (p.title_status?.trim()) {
    links.push({ icon: "deed", term: "Title", value: p.title_status.trim() });
  }
  if (p.encumbrance_status?.trim()) {
    links.push({ icon: "ledger", term: "Encumbrance", value: p.encumbrance_status.trim() });
  }
  const docs = Array.isArray(p.documents) ? p.documents.length : 0;
  if (docs > 0) {
    links.push({
      icon: "list",
      term: "On file",
      value: `${docs} document${docs === 1 ? "" : "s"}`,
    });
  }

  if (links.length < 2) return null;

  return (
    /* Aesthetics item 13: the traced plan pressed into the paper behind
       the chain — a blind stamp drawn from the REAL geometry. `isolate` +
       `-z-10` per the homepage-stamp rule. Renders nothing when the
       project carries no traced boundary. */
    <section aria-labelledby="provenance-heading" className="relative isolate mt-phi5 overflow-hidden">
      {p.plot_plan && (
        <PlanEmboss
          plan={p.plot_plan}
          className="pointer-events-none absolute -right-8 -top-4 -z-10 h-[130%] w-2/5 opacity-70"
        />
      )}
      <h2 id="provenance-heading" className="ledger-label text-ink-muted">
        Chain of record
      </h2>
      {/* 🚨 A RECORD CARD OF ROWS, NOT A FIVE-COLUMN CHAIN (report 7,
          2026-08-19: "redesign the Chain of Record section into a structured
          record card… use consistent icon → label → value rows… increase
          spacing and readability… make key values more prominent… remove
          excessive empty space").

          The chain was five equal columns from `lg`, and that shape is what
          created the empty space the report objects to: the columns are sized
          by the LONGEST value — a survey number like "789/3B2E2A1A3C" — so
          every other column carried a two-word value in a track built for
          thirteen characters, and the value sat under its label at `text-tiny`,
          smaller than the body text around it. Five short facts were occupying
          a full-width band and reading as a diagram rather than as a record.

          Rows fix both at once. One line per fact, the icon in a fixed track so
          every label starts on the same x, the label in a fixed track from `sm`
          so every value does too, and the value promoted from `text-tiny` to
          `text-base` — it is the thing a buyer came to read.

          ⚠️ THE CONNECTING RULE IS GONE, and it should be. It existed to say
          "these link", which is what a horizontal chain has to assert visually;
          a ruled register says it by construction, the way every other ledger
          on this site does. The `<ol>` still carries the sequence for a screen
          reader, which is where the ordering claim actually belongs.

          ⚠️ The final link keeps its teal seal — the chain's payoff, and the
          one resolved fact in the list. Card, rule and seal all stay inside the
          existing beige/red register; no new colour was introduced. */}
      <Reveal className="rj-stagger">
      <div className="mt-phi3 overflow-hidden rounded-card border border-line bg-canvas-alt shadow-lift">
        <ol className="divide-y divide-line">
          {links.map((l, i) => (
            <li
              key={l.term}
              className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-phi2 gap-y-1 px-phi3 py-phi2 sm:grid-cols-[2.25rem_9rem_minmax(0,1fr)] sm:items-center"
            >
              {/* The FINAL link resolves in teal — the chain's payoff, the same
                  once-per-surface move the record strip and the calculators
                  make (anti-beige item 4). */}
              <span
                className={`rj-foil-seal flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  i === links.length - 1 ? "text-white" : "text-champagne-900"
                }`}
                style={
                  i === links.length - 1
                    ? {
                        background: "var(--color-emerald-deep)",
                        boxShadow: "inset 0 0 0 2px var(--color-jamin-gold-light)",
                      }
                    : undefined
                }
              >
                <SurveyIcon name={l.icon} size="h-4 w-4" />
              </span>
              <div className="ledger-label text-ink-muted">{l.term}</div>
              {/* `break-words`: a survey number like "789/3B2E2A1A3C" has no
                  spaces and would otherwise set the column's minimum width and
                  push the page sideways — the `min-w-0` trap this repo has paid
                  for twice already.
                  ⚠️ `col-start-2` below `sm`: the label and the value stack in
                  the SECOND column so both clear the seal, rather than the
                  value sliding back under the icon. */}
              <div className="ledger col-start-2 break-words text-base text-ink sm:col-start-3">
                {l.value}
              </div>
            </li>
          ))}
        </ol>
      </div>
      </Reveal>
    </section>
  );
}
