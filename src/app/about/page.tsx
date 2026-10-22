import Link from "next/link";
import { MapPin, Phone, Mail, MessageCircle } from "lucide-react";
import { db } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui";
import { BUSINESS, waLink } from "@/lib/brand";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "About Mediview Pharmacy",
  description:
    "Mediview Pharmacy — Wellness & Lifestyle, OBEJ Plaza, Plot 969 Aminu Crescent, Wuse 2, Abuja. About our pharmacy and this modernization demonstration.",
  path: "/about",
});

export default async function AboutPage() {
  const content = await db().getContent();
  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "About" }]} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <article>
          <p className="eyebrow">About</p>
          <h1 className="mt-2 text-[30px] leading-tight font-bold text-brand-950 sm:text-[38px]">
            {content.about.headline}
          </h1>
          {content.about.pendingClientCopy && (
            <p className="mt-3 inline-block rounded-xs bg-enquiry-soft px-3 py-1.5 text-[12.5px] font-semibold text-enquiry">
              Draft copy — final wording, history and pharmacist details to be supplied and verified by the client
            </p>
          )}
          {content.about.body.split("\n\n").map((para, i) => (
            <p key={i} className="mt-5 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
              {para}
            </p>
          ))}
          <h2 className="mt-10 font-display text-[19px] font-bold text-brand-950">Why prices are “on enquiry”</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            Medicine prices in Nigeria move with supply conditions. Publishing a price we cannot
            honour helps nobody, so this website does what our counter does: confirm the current
            price and availability at the moment you ask. It keeps every quote honest.
          </p>
          <h2 className="mt-8 font-display text-[19px] font-bold text-brand-950">About this demonstration</h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
            This platform was designed and built by Midex Edits as a modernization demonstration
            for Mediview Pharmacy. Product listings are drawn from items publicly shown on the
            pharmacy’s existing website, normalized for clarity; controlled medicines are excluded;
            no enquiry is transmitted to the real pharmacy; and no real patient data is collected.
            Licensing and regulatory display details appear once confirmed by the pharmacy.
          </p>
        </article>

        <aside className="card h-fit p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
            Visit · Call · Write
          </h2>
          <address className="mt-4 space-y-3.5 text-[14.5px] not-italic text-ink">
            <p className="flex gap-3">
              <MapPin size={17} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
              <span>{BUSINESS.address.line1}<br />{BUSINESS.address.line2}<br />
                <span className="text-ink-soft">{BUSINESS.address.landmarks}</span></span>
            </p>
            <p className="flex gap-3">
              <Phone size={17} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
              <a href={BUSINESS.phoneHref} className="link-under">{BUSINESS.phone}</a>
            </p>
            <p className="flex gap-3">
              <MessageCircle size={17} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="link-under">WhatsApp</a>
            </p>
            <p className="flex gap-3">
              <Mail size={17} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
              <a href={`mailto:${BUSINESS.email}`} className="link-under">{BUSINESS.email}</a>
            </p>
          </address>
          <Link href="/contact" className="btn-primary mt-5 w-full">Contact & directions</Link>
        </aside>
      </div>
    </div>
  );
}
