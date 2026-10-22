import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { BUSINESS } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "Frequently asked questions",
  description:
    "How Mediview Pharmacy's enquiry system works — prices, availability, prescriptions, pickup and delivery, tracking and privacy.",
  path: "/faq",
});

const SECTIONS: { title: string; faqs: { q: string; a: React.ReactNode }[] }[] = [
  {
    title: "Prices & ordering",
    faqs: [
      {
        q: "Why don't products show prices?",
        a: <>Medicine prices change frequently. Instead of publishing figures that may be wrong by the time you read them, we confirm the <strong>current price with every enquiry</strong> — the same way our counter does. You’ll never see ₦0.00 placeholders or stale numbers here.</>,
      },
      {
        q: "How do I order?",
        a: <>Browse or search the catalogue, add items to your <Link href="/basket" className="link-under">enquiry basket</Link> with quantities and notes, then submit the short enquiry form. You’ll get a reference number immediately and a quote on your preferred channel.</>,
      },
      {
        q: "Is my card charged on this website?",
        a: "No. This website prepares quotes — payment and fulfilment are arranged directly with the pharmacy after you accept a quote. That also means no surprise charges, ever.",
      },
      {
        q: "What if an item is out of stock?",
        a: "We'll tell you in your quote, and where appropriate our pharmacist can suggest a suitable alternative for your prescriber's approval. We never silently substitute medicines.",
      },
    ],
  },
  {
    title: "Prescriptions",
    faqs: [
      {
        q: "Which products need a prescription?",
        a: <>Anything badged <strong>“Prescription only”</strong>. Full details on our <Link href="/prescriptions" className="link-under">prescriptions page</Link>.</>,
      },
      {
        q: "Can I order controlled medicines like tramadol or codeine preparations online?",
        a: "No — Nigerian e-pharmacy regulations prohibit online sale of controlled medicines. Please visit us in store.",
      },
    ],
  },
  {
    title: "Pickup & delivery",
    faqs: [
      {
        q: "Where do I pick up?",
        a: <>{BUSINESS.address.line1}, {BUSINESS.address.line2} — {BUSINESS.address.landmarks.toLowerCase()}.</>,
      },
      {
        q: "Do you deliver?",
        a: "Choose delivery when submitting an enquiry; coverage, timing and any delivery fee are confirmed with your quote rather than guessed here.",
      },
    ],
  },
  {
    title: "Tracking & privacy",
    faqs: [
      {
        q: "How do I track my enquiry?",
        a: <>Use the reference number (like MVP-2026-0001) plus your phone number on the <Link href="/track" className="link-under">tracking page</Link>. Both are required so nobody else can view your enquiry.</>,
      },
      {
        q: "What happens to my details?",
        a: <>Used solely to serve your enquiry, in line with the Nigeria Data Protection Act — see the <Link href="/privacy" className="link-under">privacy notice</Link>.</>,
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "FAQ" }]} />
      <h1 className="text-[28px] font-bold text-brand-950 sm:text-[34px]">Frequently asked questions</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">
        Everything about the enquiry system — honest answers, including what this website
        deliberately does not do.
      </p>
      <div className="mt-8 max-w-3xl space-y-10">
        {SECTIONS.map((sec) => (
          <section key={sec.title} aria-labelledby={`faq-${sec.title.replace(/\W/g, "")}`}>
            <h2 id={`faq-${sec.title.replace(/\W/g, "")}`} className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              {sec.title}
            </h2>
            <div className="mt-3 divide-y divide-line overflow-hidden rounded-md border border-line bg-card">
              {sec.faqs.map((f) => (
                <details key={f.q} className="group px-5 py-4">
                  <summary className="cursor-pointer list-none font-display text-[15px] font-semibold text-ink">
                    <span className="flex items-start justify-between gap-3">
                      {f.q}
                      <span aria-hidden="true" className="mt-0.5 text-brand-700 transition-transform group-open:rotate-45">＋</span>
                    </span>
                  </summary>
                  <div className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-ink-soft">{f.a}</div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
