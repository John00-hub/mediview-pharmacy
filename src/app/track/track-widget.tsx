"use client";

import { useState, useTransition } from "react";
import { Loader2, PackageSearch, Check } from "lucide-react";
import { trackEnquiryAction } from "@/app/enquiry/actions";
import type { Enquiry } from "@/lib/types";
import { ENQUIRY_STATUS_CUSTOMER_HINT } from "@/lib/types";
import { StatusPill } from "@/components/ui";

export function TrackWidget() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<Enquiry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await trackEnquiryAction({
        refCode: String(fd.get("refCode") ?? ""),
        phone: String(fd.get("phone") ?? ""),
      });
      if (res.ok) {
        setResult(res.data.enquiry);
        setFieldErrors({});
      } else {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
      }
    });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="card max-w-xl p-5 sm:p-6" noValidate>
        <h2 className="font-display text-[17px] font-semibold text-ink">Find your enquiry</h2>
        <p className="mt-1 text-[13.5px] text-ink-soft">
          For your privacy, tracking requires the reference number <em>and</em> the phone number
          used on the enquiry.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="refCode">Reference number *</label>
            <input
              id="refCode"
              name="refCode"
              className="field font-display tracking-wide uppercase"
              placeholder="MVP-2026-0001"
              required
              aria-invalid={Boolean(fieldErrors.refCode)}
            />
            {fieldErrors.refCode && <p className="field-error">{fieldErrors.refCode}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="phone">Phone number *</label>
            <input
              id="phone"
              name="phone"
              className="field"
              inputMode="tel"
              autoComplete="tel"
              required
              aria-invalid={Boolean(fieldErrors.phone)}
            />
            {fieldErrors.phone && <p className="field-error">{fieldErrors.phone}</p>}
          </div>
        </div>
        {error && (
          <p role="alert" className="mt-3 rounded-sm border border-rx/30 bg-rx-soft px-3.5 py-2.5 text-[13.5px] text-rx">
            {error}
          </p>
        )}
        <button type="submit" className="btn-primary mt-5" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <PackageSearch size={16} aria-hidden="true" />}
          {pending ? "Looking up…" : "Track enquiry"}
        </button>
      </form>

      {result && (
        <section aria-labelledby="result-heading" className="card max-w-2xl overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface/60 px-5 py-4">
            <div>
              <h3 id="result-heading" className="font-display text-[17px] font-bold text-brand-950">
                {result.refCode}
              </h3>
              <p className="text-[13px] text-ink-faint">
                Submitted {new Date(result.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            </div>
            <StatusPill status={result.status} />
          </div>

          <div className="px-5 py-5">
            <p className="rounded-sm border border-brand-200 bg-brand-50 px-4 py-3 text-[14px] text-brand-900">
              <strong>Next step:</strong> {ENQUIRY_STATUS_CUSTOMER_HINT[result.status]}
            </p>

            <h4 className="mt-6 font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              Status timeline
            </h4>
            <ol className="mt-3 space-y-0">
              {result.events.map((ev, i) => (
                <li key={ev.id} className="relative flex gap-3.5 pb-5 last:pb-0">
                  {i < result.events.length - 1 && (
                    <span aria-hidden="true" className="absolute top-5 left-[8.5px] h-full w-px bg-line" />
                  )}
                  <span className={`relative mt-1 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                    ev.type === "SUBMITTED" || ev.type === "PHARMACIST_REVIEW"
                      ? "border-brand-700 bg-brand-700 text-white"
                      : "border-line-strong bg-card text-brand-700"
                  }`}>
                    <Check size={10} strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block text-[14px] font-medium text-ink">{ev.detail}</span>
                    <span className="block text-[12px] text-ink-faint">
                      {new Date(ev.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })} · {ev.actor}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <h4 className="mt-6 font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              Items in this enquiry
            </h4>
            <ul className="mt-2 divide-y divide-line rounded-sm border border-line">
              {result.items.map((it) => (
                <li key={it.productId} className="flex justify-between gap-3 px-4 py-2.5 text-[14px]">
                  <span><span className="font-semibold">{it.quantity}×</span> {it.productName}</span>
                  <span className="shrink-0 font-display text-[11.5px] font-semibold tracking-wide text-enquiry uppercase">
                    Price on enquiry
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
