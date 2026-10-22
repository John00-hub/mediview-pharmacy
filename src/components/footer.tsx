import Link from "next/link";
import { Phone, Mail, MessageCircle, MapPin, ShieldCheck, Clock } from "lucide-react";
import { BUSINESS, waLink, mapsQuery } from "@/lib/brand";
import { Logo } from "./Logo";
import type { Category, SiteContent } from "@/lib/types";

export function Footer({
  categories,
  content,
}: {
  categories: Category[];
  content: SiteContent;
}) {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-line bg-brand-950 text-brand-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        <div>
          <div className="rounded-sm bg-paper p-3 inline-block">
            <Logo />
          </div>
          <address className="mt-5 space-y-2.5 text-sm not-italic text-brand-200">
            <p className="flex gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {BUSINESS.address.line1},<br />
                {BUSINESS.address.line2}
                <br />
                <a
                  className="link-under text-brand-100 decoration-brand-500"
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {BUSINESS.address.landmarks} — get directions
                </a>
              </span>
            </p>
            <p className="flex gap-2.5">
              <Phone size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <a href={BUSINESS.phoneHref} className="link-under text-brand-100 decoration-brand-500">
                {BUSINESS.phone}
              </a>
            </p>
            <p className="flex gap-2.5">
              <Mail size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <a href={`mailto:${BUSINESS.email}`} className="link-under text-brand-100 decoration-brand-500">
                {BUSINESS.email}
              </a>
            </p>
            <p className="flex gap-2.5">
              <MessageCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <a
                href={waLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="link-under text-brand-100 decoration-brand-500"
              >
                WhatsApp {BUSINESS.phone}
              </a>
            </p>
            <p className="flex gap-2.5">
              <Clock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {content.openingHours.confirmed
                  ? content.openingHours.text
                  : "Opening hours — pending confirmation (shown as published once verified)"}
              </span>
            </p>
          </address>
        </div>

        <nav aria-label="Shop categories">
          <h2 className="font-display text-[13px] font-bold tracking-[0.16em] text-white uppercase">Shop</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/shop" className="text-brand-200 hover:text-white">All products</Link>
            </li>
            {categories.slice(0, 9).map((c) => (
              <li key={c.id}>
                <Link href={`/c/${c.slug}`} className="text-brand-200 hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Customer services">
          <h2 className="font-display text-[13px] font-bold tracking-[0.16em] text-white uppercase">Customer services</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {[
              ["/prescriptions", "Prescription information"],
              ["/delivery-pickup", "Delivery & pickup"],
              ["/track", "Track an enquiry"],
              ["/basket", "Your enquiry basket"],
              ["/faq", "FAQ"],
              ["/about", "About Mediview"],
              ["/contact", "Contact us"],
              ["/privacy", "Privacy notice"],
              ["/terms", "Terms of use"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="text-brand-200 hover:text-white">{label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-[13px] font-bold tracking-[0.16em] text-white uppercase">
            Trust & compliance
          </h2>
          <div className="mt-4 space-y-3 text-sm text-brand-200">
            <p className="flex gap-2.5">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-brand-300" aria-hidden="true" />
              {BUSINESS.pcnLicence
                ? `PCN licence ${BUSINESS.pcnLicence}`
                : "PCN e-pharmacy licence display — slot reserved; number shown here once issued under the Electronic Pharmacy Regulations 2026."}
            </p>
            <p>
              Prescription-only medicines are supplied only against a valid prescription, verified by
              the responsible pharmacist. Controlled medicines are not available through this website.
            </p>
            <p>Prices are confirmed at enquiry — we never publish stale or estimated medicine prices.</p>
          </div>
          <Link href="/admin" className="btn btn-sm mt-5 border border-brand-500 text-brand-100 hover:bg-brand-900">
            Admin demo
          </Link>
        </div>
      </div>

      <div className="border-t border-brand-900">
        <div className="container-page flex flex-col gap-2 py-5 text-[12.5px] text-brand-300 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {BUSINESS.name}. Business details as published by {BUSINESS.domain}.
          </p>
          <p>{content.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}
