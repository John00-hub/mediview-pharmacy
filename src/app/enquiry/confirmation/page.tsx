import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, PackageSearch, MessageCircle, Clock } from "lucide-react";
import { db } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { StatusPill } from "@/components/ui";
import { waLink, BUSINESS } from "@/lib/brand";
import type { Enquiry } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Enquiry received",
  description: "Your Mediview Pharmacy enquiry has been received. Track it with your reference number.",
  path: "/enquiry/confirmation",
  noIndex: true,
});

async function findByRef(ref: string): Promise<Enquiry | null> {
  const all = await db().listEnquiries();
  return all.find((e) => e.refCode.toLowerCase() === ref.toLowerCase()) ?? null;
}

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  if (!ref) redirect("/track");
  const enquiry = await findByRef(ref);
  if (!enquiry) redirect("/track");

  return (
    <div className="container-page py-10 lg:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="card overflow-hidden">
          <div className="flex flex-col items-center border-b border-line bg-ok-soft px-6 py-10 text-center">
            <CheckCircle2 size={44} className="text-ok" aria-hidden="true" />
            <h1 className="mt-4 text-[26px] font-bold text-brand-950">Enquiry received</h1>
            <p className="mt-2 text-[15px] text-ink-soft">
              Thank you, {enquiry.customerName.split(" ")[0]}. Your reference number is
            </p>
            <p className="mt-2 rounded-sm border border-brand-300 bg-card px-4 py-2 font-display text-xl font-bold tracking-[0.08em] text-brand-900">
              {enquiry.refCode}
            </p>
            <p className="mt-3 text-[13px] text-ink-faint">
              Save this number — you’ll need it (with your phone number) to track the enquiry.
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
                Current status
              </h2>
              <StatusPill status={enquiry.status} />
            </div>

            <ul className="mt-4 divide-y divide-line rounded-sm border border-line">
              {enquiry.items.map((it) => (
                <li key={it.productId} className="flex items-start justify-between gap-3 px-4 py-2.5 text-[14px]">
                  <span>
                    <span className="font-semibold">{it.quantity}×</span> {it.productName}
                    {it.hasPrescription && (
                      <span className="ml-2 rounded-xs bg-rx-soft px-1.5 py-0.5 text-[11px] font-semibold text-rx uppercase">Rx declared</span>
                    )}
                  </span>
                  <span className="shrink-0 font-display text-[11.5px] font-semibold tracking-wide text-enquiry uppercase">Price on enquiry</span>
                </li>
              ))}
            </ul>

            <h2 className="mt-7 font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              What happens next
            </h2>
            <ol className="mt-3 space-y-2.5 text-[14.5px] leading-relaxed text-ink-soft">
              <li className="flex gap-2.5">
                <Clock size={16} className="mt-1 shrink-0 text-brand-700" aria-hidden="true" />
                Our team reviews your items{enquiry.status === "AWAITING_PHARMACIST" ? " — prescription lines go to the pharmacist first" : ""}.
              </li>
              <li className="flex gap-2.5">
                <PackageSearch size={16} className="mt-1 shrink-0 text-brand-700" aria-hidden="true" />
                We confirm availability and prepare current prices for every line.
              </li>
              <li className="flex gap-2.5">
                <MessageCircle size={16} className="mt-1 shrink-0 text-brand-700" aria-hidden="true" />
                Your quote reaches you on your preferred channel ({enquiry.contactPreference.replace("_", " ").toLowerCase()}). Nothing is charged on this website.
              </li>
            </ol>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/track" className="btn-primary">Track this enquiry</Link>
              <a
                href={waLink(`Hello Mediview Pharmacy, following up on enquiry ${enquiry.refCode}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <MessageCircle size={16} aria-hidden="true" /> WhatsApp about {enquiry.refCode}
              </a>
              <Link href="/" className="btn-ghost">Back home</Link>
            </div>

            <p className="mt-6 rounded-sm bg-enquiry-soft px-4 py-3 text-[12.5px] leading-relaxed text-enquiry">
              Demonstration notice: this enquiry lives only in the demo environment — nothing was
              sent to the real pharmacy at {BUSINESS.address.line1}. In production, the same flow
              notifies the pharmacy’s staff dashboard instantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
