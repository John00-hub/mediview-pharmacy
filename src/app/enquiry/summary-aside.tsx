"use client";

import Link from "next/link";
import { useBasket } from "@/components/basket-provider";

export function EnquirySummaryAside() {
  const { lines, hydrated } = useBasket();
  if (!hydrated) return <div className="skeleton h-64 w-full" aria-hidden="true" />;

  return (
    <aside className="card lg:sticky lg:top-28" aria-label="Enquiry summary">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
          Enquiry summary
        </h2>
      </div>
      {lines.length === 0 ? (
        <p className="px-5 py-6 text-[14px] text-ink-soft">
          Your basket is empty. <Link href="/shop" className="text-brand-700 underline underline-offset-4">Browse products</Link>.
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {lines.map((l) => (
            <li key={l.productId} className="flex items-start justify-between gap-3 px-5 py-3">
              <span className="text-[13.5px] leading-snug text-ink">
                <span className="font-semibold">{l.quantity}×</span> {l.name}
                {l.rxClass === "POM" && (
                  <span className="mt-0.5 block text-[11.5px] font-semibold tracking-wide text-rx uppercase">
                    Rx — pharmacist verification
                  </span>
                )}
                {l.note && <span className="mt-0.5 block text-[12px] text-ink-faint italic">“{l.note}”</span>}
              </span>
              <span className="shrink-0 font-display text-[11.5px] font-semibold tracking-wide text-enquiry uppercase">
                On enquiry
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t border-line bg-surface/60 px-5 py-4 text-[12.5px] leading-relaxed text-ink-soft">
        After submitting you’ll receive a reference number to{" "}
        <Link href="/track" className="text-brand-700 underline underline-offset-4">track your enquiry</Link>.
        Quotes are prepared by our team — no payment is collected on this website.
      </div>
    </aside>
  );
}
