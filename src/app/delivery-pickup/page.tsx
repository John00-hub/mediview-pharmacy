import Link from "next/link";
import { Store, Truck, MapPin, MessageCircle } from "lucide-react";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { BUSINESS, waLink, mapsQuery } from "@/lib/brand";

export const metadata = buildMetadata({
  title: "Delivery & pickup",
  description:
    "Pick up your medicines at Mediview Pharmacy, Wuse 2 Abuja, or request delivery with your enquiry. Coverage and timing confirmed with your quote.",
  path: "/delivery-pickup",
});

export default function DeliveryPickupPage() {
  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Delivery & pickup" }]} />
      <h1 className="text-[28px] font-bold text-brand-950 sm:text-[34px]">Delivery & pickup</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">
        Two ways to receive your order. Both start the same way — submit an enquiry and get a
        confirmed quote first.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-brand-100 text-brand-800">
            <Store size={21} aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-[19px] font-bold text-brand-950">Pickup at Wuse 2</h2>
          <address className="mt-3 space-y-1 text-[15px] not-italic leading-relaxed text-ink-soft">
            <p className="font-semibold text-ink">{BUSINESS.name}</p>
            <p>{BUSINESS.address.line1}</p>
            <p>{BUSINESS.address.line2}</p>
            <p>{BUSINESS.address.landmarks}</p>
          </address>
          <ul className="mt-4 space-y-2 text-[14px] text-ink-soft">
            <li>✓ Choose “Pickup” in your enquiry — no address needed.</li>
            <li>✓ We confirm your quote and ready time by WhatsApp, phone or email.</li>
            <li>✓ Bring your prescription for any prescription-only items.</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <a href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery()}`} target="_blank" rel="noopener noreferrer" className="btn-secondary btn-sm">
              <MapPin size={14} aria-hidden="true" /> Get directions
            </a>
            <a href={BUSINESS.phoneHref} className="btn-quiet btn-sm">Call ahead</a>
          </div>
        </div>

        <div className="card p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-sm bg-brand-100 text-brand-800">
            <Truck size={21} aria-hidden="true" />
          </span>
          <h2 className="mt-4 font-display text-[19px] font-bold text-brand-950">Delivery</h2>
          <ul className="mt-3 space-y-2 text-[14px] text-ink-soft">
            <li>✓ Choose “Delivery” in your enquiry and add your address with a landmark.</li>
            <li>✓ Coverage, timing and any delivery fee are confirmed in your quote — we don’t publish guesses.</li>
            <li>✓ Cold-chain items (e.g. insulin) are transported with temperature control; the pharmacist advises on suitability for delivery.</li>
            <li>✓ Prescription items are handed over only against verified prescriptions.</li>
          </ul>
          <p className="mt-4 rounded-sm bg-surface px-4 py-3 text-[13px] leading-relaxed text-ink-soft">
            Delivery operations, zones and fees are confirmed by the pharmacy (pending client
            information — this demo deliberately publishes none). Ask us directly for current
            coverage:
          </p>
          <div className="mt-4 flex flex-wrap gap-2.5">
            <a href={waLink("Hello, I'd like to ask about medicine delivery coverage in Abuja.")} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm">
              <MessageCircle size={14} aria-hidden="true" /> Ask about delivery
            </a>
            <Link href="/shop" className="btn-quiet btn-sm">Start an enquiry</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
