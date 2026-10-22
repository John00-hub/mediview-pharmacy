import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, MessageCircle, Truck, Store, FileUp, Check } from "lucide-react";
import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";
import { StatusPill } from "@/components/ui";
import { EnquiryOps } from "./enquiry-ops";
import { waLink } from "@/lib/brand";

export const dynamic = "force-dynamic";

export default async function EnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const { id } = await params;
  const enquiry = await db().getEnquiryById(id);
  if (!enquiry) notFound();

  return (
    <div>
      <Link href="/staff/enquiries" className="inline-flex items-center gap-1.5 text-[13.5px] text-ink-soft hover:text-brand-800">
        <ArrowLeft size={15} aria-hidden="true" /> Back to queue
      </Link>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[24px] font-bold tracking-wide text-brand-950">{enquiry.refCode}</h1>
          <p className="mt-1 text-[13.5px] text-ink-faint">
            Received {new Date(enquiry.createdAt).toLocaleString("en-NG", { dateStyle: "full", timeStyle: "short" })}
          </p>
        </div>
        <StatusPill status={enquiry.status} />
      </div>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="space-y-5">
          {/* Customer */}
          <section className="card p-5" aria-labelledby="cust">
            <h2 id="cust" className="font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              Customer
            </h2>
            <div className="mt-3 grid gap-2.5 text-[14.5px] sm:grid-cols-2">
              <p className="font-semibold text-ink">{enquiry.customerName}</p>
              <p className="flex items-center gap-2 text-ink-soft">
                <Phone size={14} className="text-brand-700" aria-hidden="true" />
                <a href={`tel:${enquiry.customerPhone.replace(/\s/g, "")}`} className="link-under">{enquiry.customerPhone}</a>
              </p>
              {enquiry.customerEmail && (
                <p className="flex items-center gap-2 text-ink-soft">
                  <Mail size={14} className="text-brand-700" aria-hidden="true" />
                  <a href={`mailto:${enquiry.customerEmail}`} className="link-under break-all">{enquiry.customerEmail}</a>
                </p>
              )}
              <p className="flex items-center gap-2 text-ink-soft">
                <MessageCircle size={14} className="text-brand-700" aria-hidden="true" />
                Prefers {enquiry.contactPreference.replace("_", " ").toLowerCase()} ·{" "}
                <a
                  href={waLink(`Hello ${enquiry.customerName.split(" ")[0]}, this is Mediview Pharmacy regarding your enquiry ${enquiry.refCode}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-under text-brand-700"
                >
                  open WhatsApp
                </a>
              </p>
              <p className="flex items-start gap-2 text-ink-soft sm:col-span-2">
                {enquiry.fulfilment === "DELIVERY" ? <Truck size={14} className="mt-1 text-brand-700" aria-hidden="true" /> : <Store size={14} className="mt-1 text-brand-700" aria-hidden="true" />}
                <span>
                  {enquiry.fulfilment === "DELIVERY" ? "Delivery" : "Pickup at Wuse 2"}
                  {enquiry.deliveryAddress && <span className="block text-[13.5px]">{enquiry.deliveryAddress}</span>}
                </span>
              </p>
              {enquiry.additionalInfo && (
                <p className="rounded-sm bg-surface px-3.5 py-2.5 text-[13.5px] text-ink-soft sm:col-span-2">
                  <strong className="font-display text-ink">Customer note:</strong> {enquiry.additionalInfo}
                </p>
              )}
            </div>
          </section>

          {/* Items */}
          <section className="card overflow-hidden" aria-labelledby="items">
            <h2 id="items" className="border-b border-line px-5 py-4 font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              Requested items ({enquiry.items.length})
            </h2>
            <ul className="divide-y divide-line">
              {enquiry.items.map((it, idx) => (
                <li key={`${it.productId}-${idx}`} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[14.5px] font-medium text-ink">
                      <span className="font-display font-bold text-brand-900">{it.quantity}×</span>{" "}
                      <span title="Recorded at submission — name snapshot">{it.productName}</span>
                    </p>
                    {it.hasPrescription && (
                      <span className="badge-rx">
                        <FileUp size={11} aria-hidden="true" /> Rx declared{it.prescriptionFileName ? ` · ${it.prescriptionFileName}` : ""}
                      </span>
                    )}
                  </div>
                  {it.note && <p className="mt-1 text-[13px] text-ink-faint italic">“{it.note}”</p>}
                  {it.prescriptionFileName && (
                    <p className="mt-1.5 text-[12px] text-enquiry">
                      Demo: file name recorded only — no document transmitted or stored.
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {/* Activity */}
          <section className="card p-5" aria-labelledby="activity">
            <h2 id="activity" className="font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              Activity history (audit log)
            </h2>
            <ol className="mt-3">
              {enquiry.events.map((ev, i) => (
                <li key={ev.id} className="relative flex gap-3.5 pb-4 last:pb-0">
                  {i < enquiry.events.length - 1 && (
                    <span aria-hidden="true" className="absolute top-5 left-[8.5px] h-full w-px bg-line" />
                  )}
                  <span className="relative mt-1 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 border-brand-700 bg-brand-700 text-white">
                    <Check size={10} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[13.5px] text-ink">{ev.detail}</span>
                    <span className="block text-[11.5px] text-ink-faint">
                      {new Date(ev.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })} · {ev.actor} · {ev.type.replace(/_/g, " ").toLowerCase()}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="lg:sticky lg:top-6">
          <EnquiryOps enquiry={enquiry} user={user} />
        </div>
      </div>
    </div>
  );
}
