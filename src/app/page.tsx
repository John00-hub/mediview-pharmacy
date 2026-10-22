import Link from "next/link";
import {
  ArrowRight,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  FileCheck2,
  Coins,
  Ban,
  Lock,
  ClipboardList,
  Search,
  FlaskConical,
} from "lucide-react";
import { db } from "@/lib/data";
import { BUSINESS, waLink, mapsQuery } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { SearchBox } from "@/components/search-box";
import { ProductCard } from "@/components/ui";
import { CATEGORY_ICONS } from "@/components/ProductTile";

export const metadata = buildMetadata({
  title: `${BUSINESS.name} — ${BUSINESS.tagline} | Wuse 2, Abuja`,
  description:
    "Mediview Pharmacy in Wuse 2, Abuja: browse medicines, vitamins, devices and wellness products, request current prices and availability, and have prescriptions verified by our pharmacist.",
  path: "/",
});

export default async function HomePage() {
  const store = db();
  const [categories, content] = await Promise.all([store.listCategories(), store.getContent()]);

  const featured = await (async () => {
    // Admin-curated list wins; otherwise fall back to seed "featured" flags.
    if (content.featuredProductIds.length > 0) {
      const products = await Promise.all(
        content.featuredProductIds.map((id) => store.getProductById(id))
      );
      const found = products.filter((p): p is NonNullable<typeof p> => Boolean(p && p.status === "active"));
      if (found.length >= 4) return found.slice(0, 8);
    }
    const { products } = await store.listProducts({ featuredOnly: true, pageSize: 8 });
    return products;
  })();

  const brands = await store.listBrands();
  const brandName = (id: string | null) => brands.find((b) => b.id === id)?.name ?? null;

  return (
    <>
      {/* ══ 1 · HERO — editorial split, no stock photo theatrics ═══════════ */}
      <section className="border-b border-line bg-gradient-to-b from-brand-50/70 to-paper">
        <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:py-16">
          <div>
            <p className="eyebrow flex items-center gap-2">
              <MapPin size={14} aria-hidden="true" /> Wuse 2 · Abuja · {BUSINESS.address.landmarks.split("—")[0].trim()}
            </p>
            <h1 className="mt-4 text-[34px] leading-[1.08] font-bold text-brand-950 sm:text-[44px] lg:text-[52px]">
              The pharmacy counter,
              <br />
              <span className="text-brand-700">extended to your phone.</span>
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-ink-soft">
              Browse our catalogue of medicines, vitamins, devices and wellness essentials.
              Build an enquiry and our pharmacist confirms current prices, availability and
              any prescription requirements — before you spend a naira.
            </p>

            <div className="mt-7">
              <SearchBox variant="hero" />
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/shop" className="btn-primary">
                Browse the catalogue <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/prescriptions" className="btn-secondary">
                <FileCheck2 size={16} aria-hidden="true" /> How prescriptions work
              </Link>
              <a
                href={waLink("Hello Mediview Pharmacy, I would like to make an enquiry.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-quiet"
              >
                <MessageCircle size={16} aria-hidden="true" /> WhatsApp us
              </a>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-ink-soft">
              <li className="flex items-center gap-1.5">
                <Coins size={14} className="text-brand-700" aria-hidden="true" />
                Prices confirmed at enquiry — never stale
              </li>
              <li className="flex items-center gap-1.5">
                <FlaskConical size={14} className="text-brand-700" aria-hidden="true" />
                Pharmacist-verified prescription supply
              </li>
              <li className="flex items-center gap-1.5">
                <Lock size={14} className="text-brand-700" aria-hidden="true" />
                Your details stay private
              </li>
            </ul>
          </div>

          {/* Right panel: the enquiry promise, composed as structured cards */}
          <div className="relative" aria-hidden="false">
            <div className="card overflow-hidden shadow-lift">
              <div className="border-b border-line bg-brand-900 px-5 py-4 text-white">
                <p className="font-display text-[13px] font-bold tracking-[0.16em] uppercase">
                  How an enquiry works
                </p>
              </div>
              <ol className="divide-y divide-line">
                {[
                  { n: "1", icon: Search, t: "Find your items", d: "Search by brand, generic name or category — Panadol, vitamin C, Omron monitors." },
                  { n: "2", icon: ClipboardList, t: "Submit your enquiry", d: "Add items with quantities and notes. Choose pickup at Wuse 2 or delivery." },
                  { n: "3", icon: FlaskConical, t: "Pharmacist confirms", d: "We verify prescriptions, confirm availability and send current prices on your preferred channel." },
                ].map((s) => (
                  <li key={s.n} className="flex gap-4 px-5 py-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-brand-100 font-display text-sm font-bold text-brand-800">
                      {s.n}
                    </span>
                    <div>
                      <p className="font-display text-[15px] font-semibold text-ink">{s.t}</p>
                      <p className="mt-0.5 text-[13.5px] leading-relaxed text-ink-soft">{s.d}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="border-t border-line bg-surface px-5 py-4">
                <p className="flex items-start gap-2 text-[13px] leading-relaxed text-ink-soft">
                  <Clock size={15} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
                  {content.openingHours.confirmed
                    ? content.openingHours.text
                    : "Opening hours: pending client confirmation — call or WhatsApp us before visiting."}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between rounded-md border border-line bg-card px-4 py-3 shadow-quiet">
              <p className="text-[13px] text-ink-soft">
                Prefer to talk? <span className="font-semibold text-ink">{BUSINESS.phone}</span>
              </p>
              <a href={BUSINESS.phoneHref} className="btn-secondary btn-sm">
                <Phone size={14} aria-hidden="true" /> Call
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 2 · CATEGORY DISCOVERY ════════════════════════════════════════ */}
      <section aria-labelledby="cat-heading" className="container-page py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Browse</p>
            <h2 id="cat-heading" className="mt-2 text-[26px] font-bold text-brand-950 sm:text-[30px]">
              Fifteen aisles, one enquiry basket
            </h2>
          </div>
          <Link href="/shop" className="btn-ghost btn-sm">
            All products <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon as keyof typeof CATEGORY_ICONS];
            return (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="group flex flex-col gap-2 bg-card p-4 transition-colors hover:bg-brand-50 sm:p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-sm border border-line bg-paper text-brand-700 transition-colors group-hover:border-brand-300 group-hover:bg-brand-100">
                  {Icon ? <Icon size={20} strokeWidth={1.6} aria-hidden="true" /> : null}
                </span>
                <span className="font-display text-[13.5px] leading-tight font-semibold text-ink group-hover:text-brand-900">
                  {c.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ══ 3 · CURATED COLLECTION ════════════════════════════════════════ */}
      <section aria-labelledby="featured-heading" className="border-y border-line bg-surface/60">
        <div className="container-page py-14">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Frequently requested</p>
              <h2 id="featured-heading" className="mt-2 text-[26px] font-bold text-brand-950 sm:text-[30px]">
                A curated shelf from our catalogue
              </h2>
              <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">
                Demonstration selection drawn from products publicly listed by Mediview Pharmacy.
                Availability and pricing are confirmed when you enquire.
              </p>
            </div>
            <Link href="/shop" className="btn-ghost btn-sm">
              Shop everything <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} brandName={brandName(p.brandId)} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ 4 · PRESCRIPTION INFORMATION (dark editorial band) ════════════ */}
      <section aria-labelledby="rx-heading" className="bg-brand-950 text-brand-100">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-[1fr_1fr] lg:py-16">
          <div>
            <p className="font-display text-[12px] font-bold tracking-[0.18em] text-brand-300 uppercase">
              Prescription medicines
            </p>
            <h2 id="rx-heading" className="mt-3 text-[28px] leading-tight font-bold text-white sm:text-[32px]">
              Handled the way the counter handles them — by a pharmacist
            </h2>
            <p className="mt-4 max-w-xl text-[15.5px] leading-relaxed text-brand-200">
              Prescription-only items can be added to an enquiry, but they are supplied only
              against a valid prescription from a licensed practitioner, verified by our
              pharmacist before pricing or fulfilment. Controlled medicines cannot be ordered
              through this website under Nigerian e-pharmacy regulations — please visit us
              in store for those.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/prescriptions"
                className="btn border border-brand-500 bg-brand-900 text-white hover:bg-brand-800"
              >
                <FileCheck2 size={16} aria-hidden="true" /> Prescription information
              </Link>
              <a
                href={waLink("Hello, I have a question about a prescription medicine.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn border border-brand-700 text-brand-100 hover:bg-brand-900"
              >
                <MessageCircle size={16} aria-hidden="true" /> Ask a pharmacist on WhatsApp
              </a>
            </div>
          </div>
          <ul className="grid gap-px self-start overflow-hidden rounded-md border border-brand-800 bg-brand-800 sm:grid-cols-2">
            {[
              { icon: FileCheck2, t: "Valid prescription required", d: "Prescriber name, registration number and patient details — we check before supply." },
              { icon: FlaskConical, t: "Pharmacist verification", d: "Every prescription line is reviewed and logged by the responsible pharmacist." },
              { icon: Ban, t: "No controlled medicines online", d: "Items prohibited from online sale are never listed for ordering here." },
              { icon: Lock, t: "Private by design", d: "Prescription documents are stored privately, visible only to pharmacist roles." },
            ].map((f) => (
              <li key={f.t} className="bg-brand-950 p-5">
                <f.icon size={20} className="text-brand-300" aria-hidden="true" />
                <p className="mt-3 font-display text-[14.5px] font-semibold text-white">{f.t}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-brand-200">{f.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ 5 · LOCATION & CONTACT ════════════════════════════════════════ */}
      <section aria-labelledby="loc-heading" className="container-page py-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="eyebrow">Find us</p>
            <h2 id="loc-heading" className="mt-2 text-[26px] font-bold text-brand-950 sm:text-[30px]">
              In the heart of Wuse 2
            </h2>
            <address className="mt-5 space-y-4 text-[15.5px] leading-relaxed text-ink not-italic">
              <p className="flex gap-3">
                <MapPin size={19} className="mt-1 shrink-0 text-brand-700" aria-hidden="true" />
                <span>
                  <strong className="font-display">{BUSINESS.name}</strong>
                  <br />
                  {BUSINESS.address.line1}
                  <br />
                  {BUSINESS.address.line2}
                  <br />
                  <span className="text-ink-soft">{BUSINESS.address.landmarks}</span>
                </span>
              </p>
              <p className="flex gap-3">
                <Phone size={19} className="mt-1 shrink-0 text-brand-700" aria-hidden="true" />
                <a href={BUSINESS.phoneHref} className="link-under">{BUSINESS.phone}</a>
              </p>
              <p className="flex gap-3">
                <MessageCircle size={19} className="mt-1 shrink-0 text-brand-700" aria-hidden="true" />
                <a href={waLink()} target="_blank" rel="noopener noreferrer" className="link-under">
                  WhatsApp {BUSINESS.phone}
                </a>
              </p>
              <p className="flex gap-3">
                <Clock size={19} className="mt-1 shrink-0 text-brand-700" aria-hidden="true" />
                <span className="text-ink-soft">
                  {content.openingHours.confirmed
                    ? content.openingHours.text
                    : "Opening hours to be published once confirmed by the pharmacy."}
                </span>
              </p>
            </address>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <MapPin size={16} aria-hidden="true" /> Open in Google Maps
              </a>
              <Link href="/contact" className="btn-quiet">Contact page</Link>
            </div>
          </div>
          <div className="card overflow-hidden">
            {/* Static, hand-drawn location card — no fabricated storefront imagery */}
            <svg viewBox="0 0 480 360" className="h-full w-full" role="img" aria-label="Stylized map showing Mediview Pharmacy on Aminu Crescent, Wuse 2, Abuja">
              <rect width="480" height="360" fill="#f3f0e9" />
              <g stroke="#cfc7b6" strokeWidth="10" fill="none">
                <path d="M-10 90 H490" />
                <path d="M-10 250 H490" />
                <path d="M120 -10 V370" />
                <path d="M360 -10 V370" />
              </g>
              <g stroke="#e4ded2" strokeWidth="3" fill="none">
                <path d="M240 -10 V370" strokeDasharray="2 10" />
              </g>
              <text x="130" y="80" fill="#7a827b" fontSize="13" fontFamily="Montserrat, sans-serif" fontWeight="600">AMINU CRESCENT</text>
              <text x="255" y="243" fill="#7a827b" fontSize="13" fontFamily="Montserrat, sans-serif" fontWeight="600">ADETOKUNBO ADEMOLA CRES.</text>
              <g transform="translate(200 130)">
                <rect x="-14" y="18" width="88" height="58" rx="3" fill="#e0ece5" stroke="#96bda4" strokeWidth="2" />
                <text x="30" y="42" fill="#4c554e" fontSize="11" fontFamily="Montserrat, sans-serif" textAnchor="middle" fontWeight="600">OBEJ PLAZA</text>
                <text x="30" y="58" fill="#7a827b" fontSize="10" fontFamily="Source Sans 3, sans-serif" textAnchor="middle">Plot 969</text>
                <circle cx="30" cy="0" r="16" fill="#1e5b3f" />
                <path d="M26 -7h8v7h7v8h-7v7h-8v-7h-7v-8h7v-7Z" fill="#faf8f4" />
                <text x="30" y="-26" fill="#143d2b" fontSize="13" fontFamily="Montserrat, sans-serif" fontWeight="700" textAnchor="middle">MEDIVIEW PHARMACY</text>
              </g>
              <g fill="#7a827b" fontSize="11" fontFamily="Source Sans 3, sans-serif">
                <text x="310" y="160">LG Showroom →</text>
                <text x="150" y="205">← Eterna Oil</text>
                <text x="30" y="330">WUSE 2 · ABUJA · FCT</text>
              </g>
            </svg>
          </div>
        </div>
      </section>

      {/* ══ 6 · TRUST & SAFETY — verified facts only ══════════════════════ */}
      <section aria-labelledby="trust-heading" className="border-t border-line bg-surface/60">
        <div className="container-page py-14">
          <p className="eyebrow">Trust & safety</p>
          <h2 id="trust-heading" className="mt-2 max-w-2xl text-[26px] font-bold text-brand-950 sm:text-[30px]">
            Honest prices, verified prescriptions, private data
          </h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Coins,
                t: "Why no prices online?",
                d: "Medicine prices in Nigeria change frequently. Rather than publish figures that could be wrong by the time you read them, we confirm the current price with every enquiry — the same way our counter does.",
              },
              {
                icon: ShieldCheck,
                t: "Pharmacist supervision",
                d: "Prescription requests are reviewed by the responsible pharmacist before pricing or supply, in line with Nigerian pharmacy regulation. We never dispense on guesswork.",
              },
              {
                icon: Lock,
                t: "Data protection",
                d: "Your name, number and any prescription details are used solely to serve your enquiry, in line with the Nigeria Data Protection Act. Read our privacy notice for the full picture.",
              },
            ].map((f) => (
              <div key={f.t} className="card p-6">
                <f.icon size={22} className="text-brand-700" aria-hidden="true" />
                <h3 className="mt-4 font-display text-[16.5px] font-semibold text-ink">{f.t}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-ink-soft">{f.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-[13px] text-ink-faint">
            Business name, address, phone and email above are as published by Mediview Pharmacy.
            Licensing display details will appear once confirmed by the pharmacy (see footer).
          </p>
        </div>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: BUSINESS.name,
          url: BUSINESS.domain,
          potentialAction: {
            "@type": "SearchAction",
            target: `${BUSINESS.domain}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
    </>
  );
}
