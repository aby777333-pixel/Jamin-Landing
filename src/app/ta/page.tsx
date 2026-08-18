import type { Metadata } from "next";
import Link from "next/link";
import { Container, SectionLabel } from "@/components/ui";
import { getDeskContact, telHref, waHref } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "ஜமீன் ப்ராப்பர்ட்டீஸ் — தமிழில்",
  description:
    "தமிழ்நாட்டில் DTCP அங்கீகாரம் பெற்ற வீட்டுமனைகள் — ஈரோடு, சேலம், திருப்பூர், கோயம்புத்தூர். அனுமதி எண், சர்வே எண், மனை அட்டவணை — எல்லாம் வெளியிடப்படுகிறது.",
  alternates: { canonical: "/ta" },
};

/**
 * தமிழில் (do-all round #2, 2026-08-18) — the Tamil landing.
 *
 * 🚨 HAND-WRITTEN COPY, and every sentence restates something the English
 * site already asserts — the approval number published per project, the
 * no-published-rate rule, the desk-confirmed visit, the four stages. A
 * Tamil page that says MORE than the English one would be a second source
 * of truth in a language the console cannot edit. Keep them in lockstep.
 *
 * ⚠️ ONE page, not an i18n layer: the catalogue, plans and console-authored
 * content stay English. This is the doorway — who we are, how it works,
 * what to check, how to reach the desk — for the reader who thinks in
 * Tamil, which in Salem and Erode is most readers.
 *
 * ⚠️ `lang="ta"` on the article so screen readers switch voices; Inter has
 * no Tamil glyphs, so the system's Tamil face renders the text (the same
 * deliberate fallback Prose's <pre> makes for the platform mono).
 */
const STAGES: { title: string; body: string }[] = [
  {
    title: "நிலமும் உரிமையும்",
    body: "உரிமை ஆவணச் சங்கிலி தொடர்ச்சியாகவும், வில்லங்கம் இல்லாமலும் இருந்தால் மட்டுமே நிலம் வாங்குகிறோம்.",
  },
  {
    title: "அங்கீகரிக்கப்பட்ட வரைபடம்",
    body: "திட்டம் நகர ஊரமைப்பு இயக்ககத்திற்கு (DTCP) செல்கிறது. மனை எல்லைகள், சாலை அகலம், திறந்தவெளி — எல்லாம் அந்த அனுமதியில் நிர்ணயம்.",
  },
  {
    title: "தரையில் உருவாக்கம்",
    body: "அனுமதிக்கப்பட்ட அகலத்தில் சாலைகள், தண்ணீர் இணைப்பு, வடிகால் — வரைபடப்படி அமைக்கப்படுகிறது.",
  },
  {
    title: "உங்கள் பெயரில் பதிவு",
    body: "மனையையும் ஆவணங்களையும் நீங்களே பார்த்த பின், சார்பதிவாளர் அலுவலகத்தில் கிரயம் உங்கள் பெயரில் பதிவாகிறது.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "DTCP அங்கீகாரம் என்றால் என்ன?",
    a: "தமிழ்நாடு நகர ஊரமைப்பு இயக்ககம் வரைபடத்தை அங்கீகரித்தது என்று பொருள். ஒவ்வொரு ஜமீன் திட்டப் பக்கத்திலும் அனுமதி எண் வெளியிடப்படுகிறது — நீங்களே சரிபார்க்கலாம்.",
  },
  {
    q: "விலை ஏன் இணையதளத்தில் இல்லை?",
    a: "ஜமீன் எந்த விலையையும் இணையதளத்தில் வெளியிடுவதில்லை. முன்பதிவு நேரத்தில் விற்பனைக் குழு விலையை உறுதிசெய்கிறது.",
  },
  {
    q: "மனை பார்வை எப்படி நடக்கும்?",
    a: "இணையதளத்திலோ ஆப்பிலோ உங்களுக்கு வசதியான நாளைத் தேர்வு செய்யுங்கள். குழு நாளையும் நேரத்தையும் உறுதிசெய்து, தளத்திலேயே உங்களைச் சந்திக்கும்.",
  },
  {
    q: "வாங்கும் முன் எதை சரிபார்க்க வேண்டும்?",
    a: "அங்கீகரிக்கப்பட்ட வரைபடம், உரிமை ஆவணங்கள், சர்வே எண்களுக்கான வில்லங்கச் சான்று (EC), பட்டா நிலை. ஜமீன் திட்டப் பக்கங்களில் அனுமதி எண்ணும் மனை அட்டவணையும் முன்பே வெளியிடப்படுகின்றன.",
  },
  {
    q: "வங்கிக் கடனில் வாங்கலாமா?",
    a: "அங்கீகரிக்கப்பட்ட மனைப்பிரிவுகளுக்கு வங்கிகள் கடன் வழங்குவது உண்டு. ஜமீன் கடன் வழங்குவதில்லை — முடிவும் விதிமுறைகளும் வங்கியுடையவை.",
  },
  {
    q: "ஜமீன் எங்கெல்லாம் உள்ளது?",
    a: "ஈரோடு, சேலம், திருப்பூர், கோயம்புத்தூர் மாவட்டங்களில் — ஒவ்வொரு திட்டமும் அதன் சொந்தப் பக்கத்துடன்.",
  },
];

export default async function TamilPage() {
  const desk = await getDeskContact();
  const tel = telHref(desk.mobile);
  const wa = waHref(desk.whatsapp, "வணக்கம் — மனை விவரங்கள் வேண்டும்.");

  return (
    <article lang="ta">
      <section className="relative overflow-hidden border-b border-line bg-canvas-alt">
        <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <Container className="relative py-phi6">
          <div className="max-w-2xl">
            <SectionLabel>தமிழில்</SectionLabel>
            <h1 className="mt-phi3 text-balance text-4xl text-ink">
              நிலம் வாங்குவதில், பேச்சை விட ஆவணமே முக்கியம்.
            </h1>
            <p className="mt-phi3 text-pretty text-lg leading-relaxed text-ink-soft">
              ஜமீன் ப்ராப்பர்ட்டீஸ் — தமிழ்நாட்டில் DTCP அங்கீகாரம் பெற்ற மனைப்பிரிவுகளில்
              வீட்டுமனைகள். ஒவ்வொரு திட்டத்திலும் அனுமதி எண், சர்வே எண்கள், பரப்பு விவரம்,
              மனை-வாரி அட்டவணை — எல்லாம் இணையதளத்திலேயே வெளியிடப்படுகின்றன. நீங்கள் வருவதற்கு
              முன்பே சரிபார்க்கலாம்.
            </p>
            <div className="mt-phi4 flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="rounded-full bg-jamin-red px-7 py-3 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all hover:bg-jamin-red-deep"
              >
                மனைகளைப் பார்க்க
              </Link>
              <Link
                href="/contact"
                className="rounded-full border border-jamin-gold bg-canvas/70 px-7 py-3 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition-all hover:border-jamin-gold-ink"
              >
                தள பார்வை பதிவு
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-phi5">
        <h2 className="text-3xl text-ink">வாங்கும் முறை — நான்கு படிகள்</h2>
        <ol className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((s, i) => (
            <li key={s.title} className="rounded-card border border-line bg-canvas-alt p-phi3">
              <span className="ledger text-tiny font-semibold text-jamin-red-deep">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-2 text-xl text-ink">{s.title}</h3>
              <p className="mt-phi2 text-base leading-relaxed text-ink-muted">{s.body}</p>
            </li>
          ))}
        </ol>

        <h2 className="mt-phi6 text-3xl text-ink">அடிக்கடி கேட்கப்படும் கேள்விகள்</h2>
        <dl className="mt-phi3 max-w-3xl">
          {FAQS.map((f) => (
            <div key={f.q} className="border-t border-line py-phi3 first:border-t-0">
              <dt className="text-xl text-ink">{f.q}</dt>
              <dd className="mt-phi2 text-base leading-relaxed text-ink-soft">{f.a}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-phi6 rounded-card border border-line bg-canvas-alt p-phi4">
          <h2 className="text-2xl text-ink">எங்களுடன் பேசுங்கள்</h2>
          <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
            அழையுங்கள் அல்லது வாட்ஸ்அப்பில் எழுதுங்கள் — வேலை நேரத்தில் பதில் தருகிறோம்.
          </p>
          <div className="mt-phi3 flex flex-wrap gap-2">
            {tel && (
              <a
                href={tel}
                className="rounded-full border border-jamin-red-deep/40 bg-jamin-red-soft px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep"
              >
                அழைக்க
              </a>
            )}
            {wa && (
              <a
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-canopy/40 bg-canopy-soft px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-canopy"
              >
                வாட்ஸ்அப்
              </a>
            )}
          </div>
          <p className="mt-phi3 text-tiny leading-relaxed text-ink-faint">
            விலைகள் இணையதளத்தில் வெளியிடப்படுவதில்லை; முன்பதிவு நேரத்தில் விற்பனைக் குழு
            உறுதிசெய்கிறது. இந்தப் பக்கம் அறிமுகம் மட்டுமே — திட்ட விவரங்கள் ஆங்கிலப்
            பக்கங்களில்.
          </p>
        </div>
      </Container>
    </article>
  );
}
