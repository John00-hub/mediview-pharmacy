import { Phone, Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { db } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { ContactComposer } from "./contact-composer";
import { BUSINESS, waLink, mapsQuery } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Contact & directions",
  description:
    "Contact Mediview Pharmacy — OBEJ Plaza, Plot 969 Aminu Crescent, Wuse 2, Abuja. Call, WhatsApp, email or get directions.",
  path: "/contact",
});

export default async function ContactPage() {
  const content = await db().getContent();
  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Contact" }]} />
      <h1 className="text-[28px] font-bold text-brand-950 sm:text-[34px]">Contact & directions</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,6fr)]">
        <div className="space-y-4">
          <div className="card p-5">
            <h2 className="flex items-center gap-2.5 font-display text-[16px] font-semibold text-ink">
              <MapPin size={18} className="text-brand-700" aria-hidden="true" /> The pharmacy
            </h2>
            <address className="mt-3 space-y-1 text-[15px] not-italic leading-relaxed text-ink-soft">
              <p className="font-semibold text-ink">{BUSINESS.name} — {BUSINESS.tagline}</p>
              <p>{BUSINESS.address.line1}</p>
              <p>{BUSINESS.address.line2}</p>
              <p>{BUSINESS.address.landmarks}</p>
            </address>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary btn-sm mt-4"
            >
              <MapPin size={14} aria-hidden="true" /> Open directions in Google Maps
            </a>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <a href={BUSINESS.phoneHref} className="card p-5 transition-shadow hover:shadow-card">
              <Phone size={18} className="text-brand-700" aria-hidden="true" />
              <h2 className="mt-3 font-display text-[15px] font-semibold text-ink">Call</h2>
              <p className="mt-1 text-[14px] text-ink-soft">{BUSINESS.phone}</p>
            </a>
            <a href={waLink("Hello Mediview Pharmacy…")} target="_blank" rel="noopener noreferrer" className="card p-5 transition-shadow hover:shadow-card">
              <MessageCircle size={18} className="text-brand-700" aria-hidden="true" />
              <h2 className="mt-3 font-display text-[15px] font-semibold text-ink">WhatsApp</h2>
              <p className="mt-1 text-[14px] text-ink-soft">Fastest for price & availability questions</p>
            </a>
            <a href={`mailto:${BUSINESS.email}`} className="card p-5 transition-shadow hover:shadow-card">
              <Mail size={18} className="text-brand-700" aria-hidden="true" />
              <h2 className="mt-3 font-display text-[15px] font-semibold text-ink">Email</h2>
              <p className="mt-1 text-[14px] break-all text-ink-soft">{BUSINESS.email}</p>
            </a>
            <div className="card p-5">
              <Clock size={18} className="text-brand-700" aria-hidden="true" />
              <h2 className="mt-3 font-display text-[15px] font-semibold text-ink">Opening hours</h2>
              <p className="mt-1 text-[14px] text-ink-soft">
                {content.openingHours.confirmed
                  ? content.openingHours.text
                  : "Pending confirmation — please call ahead. (Hours publish here once verified by the pharmacy.)"}
              </p>
            </div>
          </div>
        </div>

        <div>
          <ContactComposer />
        </div>
      </div>
    </div>
  );
}
