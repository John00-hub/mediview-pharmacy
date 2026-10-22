import Link from "next/link";
import {
  FileCheck2,
  ShieldAlert,
  Ban,
  Lock,
  ClipboardList,
  MessageCircle,
} from "lucide-react";
import { buildMetadata, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs } from "@/components/ui";
import { waLink, BUSINESS } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "Prescriptions — how it works",
  description:
    "How prescription-only medicines are handled at Mediview Pharmacy: valid prescription requirements, pharmacist verification, privacy, and items that cannot be ordered online.",
  path: "/prescriptions",
});

const FAQS = [
  {
    q: "Which items need a prescription?",
    a: "Products marked “Prescription only” on this website. You can still add them to an enquiry — supply only proceeds after our pharmacist verifies a valid prescription.",
  },
  {
    q: "What makes a prescription valid?",
    a: "Under Nigerian e-pharmacy rules a valid prescription is issued by a practitioner licensed in Nigeria and carries the prescriber's name, registration number and physical address/contact in Nigeria, the patient's details, the date, and the prescriber's signature. Prescriptions remain valid for six months.",
  },
  {
    q: "Can I order controlled medicines online?",
    a: "No. Controlled medicines (for example tramadol or codeine-containing preparations) cannot be sold through any Nigerian online pharmacy. Please visit us in store, where our pharmacist can assist you.",
  },
  {
    q: "How is my prescription kept private?",
    a: "Prescription documents are stored in private, encrypted storage. Only staff with the pharmacist role can open them, through short-lived signed links, and every access is logged. Our privacy notice explains this in full.",
  },
  {
    q: "Can prescriptions from an online consultation be used?",
    a: "Nigerian regulations now permit dispensing against prescriptions issued through online consultations, provided the prescription itself is valid and issued by a practitioner licensed in Nigeria. Our pharmacist makes the final determination for every request.",
  },
];

export default function PrescriptionsPage() {
  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Prescriptions" }]} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <p className="eyebrow">Prescription medicines</p>
          <h1 className="mt-2 text-[30px] leading-tight font-bold text-brand-950 sm:text-[38px]">
            Every prescription checked by a pharmacist — no shortcuts
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
            Prescription-only medicines (POMs) are not ordinary shopping. Nigerian pharmacy
            regulation requires them to be supplied against a valid prescription, under pharmacist
            supervision. This is how the process works with Mediview Pharmacy.
          </p>

          <ol className="mt-8 space-y-px overflow-hidden rounded-md border border-line bg-line">
            {[
              {
                icon: ClipboardList,
                t: "1 · Add the medicine to your enquiry",
                d: "Prescription items show a red “Prescription only” badge. Add them like anything else — the basket will ask whether you have a valid prescription.",
              },
              {
                icon: FileCheck2,
                t: "2 · Share your prescription",
                d: "Have it ready when we contact you, or attach it in production flow (private, encrypted, pharmacist-eyes-only). In this demonstration, attach a clearly synthetic sample only — never a real patient document.",
              },
              {
                icon: ShieldAlert,
                t: "3 · Pharmacist verification",
                d: "The responsible pharmacist checks prescriber details, patient details, medicine, strength, quantity and validity date. The enquiry cannot be quoted until this step is recorded.",
              },
              {
                icon: MessageCircle,
                t: "4 · Quote & fulfilment",
                d: "Once verified, we confirm price and availability, then arrange pickup at Wuse 2 or delivery — quantity limited to what the prescription authorises.",
              },
            ].map((s) => (
              <li key={s.t} className="flex gap-4 bg-card p-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-brand-100 text-brand-800">
                  <s.icon size={19} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-display text-[15.5px] font-semibold text-ink">{s.t}</h2>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-soft">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-rx/25 bg-rx-soft p-5">
              <Ban size={20} className="text-rx" aria-hidden="true" />
              <h2 className="mt-3 font-display text-[15px] font-semibold text-rx">Not available online</h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-rx/90">
                Controlled medicines and dangerous drugs are excluded from online sale in Nigeria.
                They never appear in this catalogue. Please visit the pharmacy in person.
              </p>
            </div>
            <div className="rounded-md border border-line bg-surface/60 p-5">
              <Lock size={20} className="text-brand-700" aria-hidden="true" />
              <h2 className="mt-3 font-display text-[15px] font-semibold text-ink">Private by design</h2>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
                Health data is sensitive under the Nigeria Data Protection Act. Prescription files
                live in private storage, are accessible only to pharmacist roles via short-lived
                signed links, and every access is logged. See our{" "}
                <Link href="/privacy" className="underline underline-offset-4">privacy notice</Link>.
              </p>
            </div>
          </div>

          <p className="mt-8 text-[13px] leading-relaxed text-ink-faint">
            Classification of individual medicines as prescription-only is the responsibility of
            Mediview Pharmacy’s Superintendent Pharmacist. This page describes process, and offers
            no medical advice; always follow your prescriber’s instructions.
          </p>
        </div>

        {/* FAQ rail */}
        <aside aria-labelledby="faq-rx" className="lg:sticky lg:top-28 lg:self-start">
          <h2 id="faq-rx" className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
            Common questions
          </h2>
          <div className="mt-4 divide-y divide-line overflow-hidden rounded-md border border-line bg-card">
            {FAQS.map((f) => (
              <details key={f.q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none font-display text-[14.5px] font-semibold text-ink marker:content-none">
                  <span className="flex items-start justify-between gap-3">
                    {f.q}
                    <span aria-hidden="true" className="mt-0.5 text-brand-700 transition-transform group-open:rotate-45">＋</span>
                  </span>
                </summary>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="card mt-4 p-5">
            <h2 className="font-display text-[15px] font-semibold text-ink">Talk to the pharmacist</h2>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
              Unsure whether your medicine needs a prescription? Ask before you order.
            </p>
            <div className="mt-4 grid gap-2">
              <a href={waLink("Hello, I have a question about prescription medicines.")} target="_blank" rel="noopener noreferrer" className="btn-primary">
                <MessageCircle size={16} aria-hidden="true" /> WhatsApp us
              </a>
              <a href={BUSINESS.phoneHref} className="btn-secondary">Call {BUSINESS.phone}</a>
            </div>
          </div>
        </aside>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }}
      />
      <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Prescriptions", path: "/prescriptions" }])} />
    </div>
  );
}
