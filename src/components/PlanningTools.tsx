"use client";

import { useMemo, useState } from "react";

/**
 * FEATURE 3 — PLAN YOUR PROPERTY INVESTMENT.
 *
 * The four tools the app already carries, built for the web: EMI, loan
 * eligibility, purchase cost and rental yield.
 *
 * ⚠️ THEY ARE REAL CALCULATORS, NOT FOUR CARDS LINKING TO THE APP. The brief
 * asks for "four clean visual cards", and cards are what the homepage gets —
 * but a card has to lead somewhere. Every app link on this site was withdrawn
 * until the Play Store listing exists, and a card that opens a page saying
 * "coming soon" is the dead end the nav was rebuilt from facets to avoid.
 *
 * ⚠️ NOTHING HERE ASSERTS A JAMIN PRICE. Every figure is the visitor's own
 * input. That is not a limitation, it is the site's standing rule — no plot has
 * a published rate, and a calculator pre-filled with one would be inventing the
 * only number the whole site refuses to invent.
 *
 * ⚠️ THE STATUTORY RATES ARE EDITABLE DEFAULTS, AND THEY ARE THE ONE CLAIM IN
 * THIS FILE. Stamp duty and registration fees are set by the state, they change,
 * and they vary with how a document is drawn. So they are inputs the visitor can
 * correct rather than constants, and the panel says in plain words that they
 * must be confirmed. Hard-coding them silently would put a number on the page
 * that nobody at Jamin has stood behind.
 */

const inr = (n: number) =>
  Number.isFinite(n) && n > 0
    ? "₹" + Math.round(n).toLocaleString("en-IN", { maximumFractionDigits: 0 })
    : "—";

/** ₹1,25,00,000 → "1.25 crore". The figure people actually say out loud. */
function words(n: number) {
  if (!Number.isFinite(n) || n <= 0) return "";
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} crore`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} lakh`;
  return "";
}

/** The standard amortised instalment. Guards the zero-rate case, where the
 *  formula divides by zero and the answer is simply principal ÷ months. */
function emiOf(principal: number, annualRate: number, months: number) {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const f = Math.pow(1 + r, months);
  return (principal * r * f) / (f - 1);
}

/** The inverse: what principal does a given instalment support? */
function principalOf(emi: number, annualRate: number, months: number) {
  if (!(emi > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return emi * months;
  const f = Math.pow(1 + r, months);
  return (emi * (f - 1)) / (r * f);
}

const field =
  "w-full rounded-card border border-line bg-canvas px-phi3 py-2.5 text-base text-ink outline-none focus:border-ink-faint";
const labelCls = "mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint";

function Num({
  id,
  label,
  value,
  onChange,
  suffix,
  step = 1,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  step?: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className={field}
        />
        {suffix ? <span className="shrink-0 text-base text-ink-muted">{suffix}</span> : null}
      </div>
      {hint ? <p className="mt-1 text-tiny text-ink-faint">{hint}</p> : null}
    </div>
  );
}

function Result({ rows, note }: { rows: [string, string, string?][]; note?: string }) {
  return (
    <div className="mt-phi4 rounded-xl border border-line bg-canvas-alt p-phi3">
      <dl>
        {rows.map(([k, v, sub], i) => (
          <div
            key={k}
            className={`flex items-baseline justify-between gap-4 py-2 ${i ? "border-t border-line" : ""}`}
          >
            <dt className={i ? "text-base text-ink-muted" : "text-base text-ink"}>{k}</dt>
            <dd className="text-right">
              <span className={`ledger ${i ? "text-base text-ink" : "text-2xl text-ink"}`}>{v}</span>
              {sub ? <span className="block text-tiny text-ink-faint">{sub}</span> : null}
            </dd>
          </div>
        ))}
      </dl>
      {note ? <p className="mt-phi2 text-tiny leading-relaxed text-ink-faint">{note}</p> : null}
    </div>
  );
}

function Tool({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-line pt-phi5">
      <h2 className="text-2xl text-ink">{title}</h2>
      <p className="mt-phi2 max-w-2xl text-lg leading-relaxed text-ink-muted">{lead}</p>
      <div className="mt-phi4 grid gap-phi4 lg:grid-cols-2">{children}</div>
    </section>
  );
}

export function PlanningTools() {
  /* EMI */
  const [amount, setAmount] = useState(2500000);
  const [rate, setRate] = useState(8.75);
  const [years, setYears] = useState(15);
  const emi = useMemo(() => emiOf(amount, rate, years * 12), [amount, rate, years]);
  const totalPaid = emi * years * 12;

  /* Eligibility */
  const [income, setIncome] = useState(80000);
  const [obligations, setObligations] = useState(0);
  const [foir, setFoir] = useState(50);
  const [eRate, setERate] = useState(8.75);
  const [eYears, setEYears] = useState(20);
  const maxEmi = Math.max(0, (income * foir) / 100 - obligations);
  const eligible = useMemo(
    () => principalOf(maxEmi, eRate, eYears * 12),
    [maxEmi, eRate, eYears],
  );

  /* Purchase cost */
  const [area, setArea] = useState(1200);
  const [psf, setPsf] = useState(2500);
  const [stamp, setStamp] = useState(7);
  const [regFee, setRegFee] = useState(4);
  const [other, setOther] = useState(50000);
  const plotCost = area * psf;
  const stampCost = (plotCost * stamp) / 100;
  const regCost = (plotCost * regFee) / 100;
  const totalCost = plotCost + stampCost + regCost + other;

  /* Rental yield */
  const [invested, setInvested] = useState(4000000);
  const [monthlyRent, setMonthlyRent] = useState(18000);
  const [annualCosts, setAnnualCosts] = useState(24000);
  const grossYield = invested > 0 ? ((monthlyRent * 12) / invested) * 100 : 0;
  const netYield = invested > 0 ? ((monthlyRent * 12 - annualCosts) / invested) * 100 : 0;

  return (
    <div className="space-y-phi6">
      <Tool
        id="emi"
        title="EMI calculator"
        lead="What a loan of this size costs every month, and what it costs in total."
      >
        <div className="space-y-phi3">
          <Num id="t-amount" label="Loan amount" value={amount} onChange={setAmount} step={50000} suffix="₹" />
          <Num id="t-rate" label="Interest rate" value={rate} onChange={setRate} step={0.05} suffix="% p.a." />
          <Num id="t-years" label="Tenure" value={years} onChange={setYears} suffix="years" />
        </div>
        <Result
          rows={[
            ["Monthly instalment", inr(emi)],
            ["Total interest", inr(totalPaid - amount), words(totalPaid - amount)],
            ["Total payable", inr(totalPaid), words(totalPaid)],
          ]}
          note="An estimate on a reducing-balance loan. Your lender's figure will differ with processing fees, insurance and the exact day the loan is disbursed."
        />
      </Tool>

      <Tool
        id="eligibility"
        title="Loan eligibility"
        lead="Roughly how much a lender may advance against your income."
      >
        <div className="space-y-phi3">
          <Num id="t-income" label="Net monthly income" value={income} onChange={setIncome} step={5000} suffix="₹" />
          <Num
            id="t-obligations"
            label="Existing monthly EMIs"
            value={obligations}
            onChange={setObligations}
            step={1000}
            suffix="₹"
          />
          <Num
            id="t-foir"
            label="Share of income allowed for EMIs"
            value={foir}
            onChange={setFoir}
            suffix="%"
            hint="Lenders usually work between 40% and 55%. 50% is a common middle."
          />
          <Num id="t-erate" label="Interest rate" value={eRate} onChange={setERate} step={0.05} suffix="% p.a." />
          <Num id="t-eyears" label="Tenure" value={eYears} onChange={setEYears} suffix="years" />
        </div>
        <Result
          rows={[
            ["Indicative loan amount", inr(eligible), words(eligible)],
            ["Instalment it assumes", inr(maxEmi)],
          ]}
          note="Indicative only, and not an offer of finance. A lender decides on your credit record, employment, the property's own papers and its own policy — Jamin Bazaar does not lend and does not arrange loans."
        />
      </Tool>

      <Tool
        id="cost"
        title="Purchase cost"
        lead="What a plot costs once the statutory charges are added to the rate."
      >
        <div className="space-y-phi3">
          <Num id="t-area" label="Plot area" value={area} onChange={setArea} step={10} suffix="sq ft" />
          <Num id="t-psf" label="Rate" value={psf} onChange={setPsf} step={50} suffix="₹ / sq ft" />
          <Num
            id="t-stamp"
            label="Stamp duty"
            value={stamp}
            onChange={setStamp}
            step={0.5}
            suffix="%"
            hint="Set by the state and revised from time to time. Confirm the current rate before you budget."
          />
          <Num id="t-reg" label="Registration fee" value={regFee} onChange={setRegFee} step={0.5} suffix="%" />
          <Num
            id="t-other"
            label="Documentation and other charges"
            value={other}
            onChange={setOther}
            step={5000}
            suffix="₹"
          />
        </div>
        <Result
          rows={[
            ["Total outlay", inr(totalCost), words(totalCost)],
            ["Plot", inr(plotCost)],
            ["Stamp duty", inr(stampCost)],
            ["Registration", inr(regCost)],
            ["Other charges", inr(other)],
          ]}
          note="Jamin publishes no rate — the figure above is the one you entered. Statutory percentages are defaults you can correct; they change, and they depend on how the document is drawn."
        />
      </Tool>

      <Tool
        id="yield"
        title="Rental yield"
        lead="What a property returns each year against what it cost."
      >
        <div className="space-y-phi3">
          <Num id="t-invested" label="Total invested" value={invested} onChange={setInvested} step={100000} suffix="₹" />
          <Num id="t-rent" label="Monthly rent" value={monthlyRent} onChange={setMonthlyRent} step={1000} suffix="₹" />
          <Num
            id="t-costs"
            label="Annual costs"
            value={annualCosts}
            onChange={setAnnualCosts}
            step={5000}
            suffix="₹"
            hint="Tax, maintenance, insurance, and the months it sits empty."
          />
        </div>
        <Result
          rows={[
            ["Net yield", netYield > 0 ? `${netYield.toFixed(2)}%` : "—"],
            ["Gross yield", grossYield > 0 ? `${grossYield.toFixed(2)}%` : "—"],
            ["Annual rent", inr(monthlyRent * 12)],
          ]}
          note="Yield is a return on rent alone. It says nothing about what the land itself is worth later, which on plotted development is usually the larger half of the answer. Bare plots rarely earn rent at all — this is for a built or leased property."
        />
      </Tool>
    </div>
  );
}
