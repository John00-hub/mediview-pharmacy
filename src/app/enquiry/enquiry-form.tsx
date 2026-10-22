"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { Loader2, Send, Lock, ShieldAlert } from "lucide-react";
import { useBasket } from "@/components/basket-provider";
import { submitEnquiryAction } from "./actions";

type Errors = Record<string, string>;

/** Enquiry details form — the commercial core (directive §8). */
export function EnquiryForm() {
  const router = useRouter();
  const { lines, hydrated, clear } = useBasket();
  const [pending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [fulfilment, setFulfilment] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [contactPreference, setContactPreference] = useState<"WHATSAPP" | "PHONE_CALL" | "EMAIL">("WHATSAPP");

  if (!hydrated) {
    return <div className="skeleton h-96 w-full" role="status" aria-label="Loading form" />;
  }

  if (lines.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
        <h2 className="font-display text-lg font-semibold text-ink">Your basket is empty</h2>
        <p className="max-w-sm text-[14.5px] text-ink-soft">
          Add the products you need first — then this form collects your contact and
          pickup/delivery preference.
        </p>
        <Link href="/shop" className="btn-primary mt-1">Browse products</Link>
      </div>
    );
  }

  const pomLines = lines.filter((l) => l.rxClass === "POM");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      customerName: String(fd.get("customerName") ?? ""),
      customerPhone: String(fd.get("customerPhone") ?? ""),
      customerEmail: String(fd.get("customerEmail") ?? ""),
      contactPreference,
      fulfilment,
      deliveryAddress: String(fd.get("deliveryAddress") ?? ""),
      additionalInfo: String(fd.get("additionalInfo") ?? ""),
      privacyAcknowledged: fd.get("privacyAcknowledged") === "on",
      items: lines.map((l) => ({
        productId: l.productId,
        quantity: l.quantity,
        note: l.note || undefined,
        hasPrescription: l.hasPrescription,
        prescriptionFileName: l.prescriptionFileName || undefined,
      })),
    };
    setErrors({});
    setFormError(null);
    startTransition(async () => {
      const result = await submitEnquiryAction(payload);
      if (result.ok) {
        clear();
        router.push(`/enquiry/confirmation?ref=${encodeURIComponent(result.data.refCode)}`);
      } else {
        setFormError(result.error);
        setErrors(result.fieldErrors ?? {});
      }
    });
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card divide-y divide-line">
      <div className="p-5 sm:p-6">
        <h2 className="font-display text-[17px] font-semibold text-ink">Your details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="customerName">Full name *</label>
            <input id="customerName" name="customerName" className="field" autoComplete="name" required minLength={2} maxLength={120} aria-invalid={Boolean(errors.customerName)} />
            {errors.customerName && <p className="field-error">{errors.customerName}</p>}
          </div>
          <div>
            <label className="field-label" htmlFor="customerPhone">Contact number *</label>
            <input id="customerPhone" name="customerPhone" className="field" autoComplete="tel" inputMode="tel" placeholder="0703 000 0000 or +234…" required aria-invalid={Boolean(errors.customerPhone)} />
            {errors.customerPhone && <p className="field-error">{errors.customerPhone}</p>}
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="customerEmail">Email (optional)</label>
            <input id="customerEmail" name="customerEmail" type="email" className="field" autoComplete="email" aria-invalid={Boolean(errors.customerEmail)} />
            {errors.customerEmail && <p className="field-error">{errors.customerEmail}</p>}
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="field-label">Preferred contact method *</legend>
            <div className="flex flex-wrap gap-2">
              {([["WHATSAPP", "WhatsApp"], ["PHONE_CALL", "Phone call"], ["EMAIL", "Email"]] as const).map(([v, label]) => (
                <label key={v} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border px-4 text-[14px] transition-colors ${contactPreference === v ? "border-brand-700 bg-brand-50 font-semibold text-brand-900" : "border-line-strong bg-card text-ink-soft hover:border-brand-500"}`}>
                  <input type="radio" name="contactPreferenceUI" className="sr-only" checked={contactPreference === v} onChange={() => setContactPreference(v)} />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="font-display text-[17px] font-semibold text-ink">Pickup or delivery</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {([["PICKUP", "Pickup at Wuse 2", "Collect from OBEJ Plaza, Plot 969 Aminu Crescent once your quote is confirmed."], ["DELIVERY", "Delivery", "We confirm coverage and timing with your quote."]] as const).map(([v, t, d]) => (
            <label key={v} className={`cursor-pointer rounded-md border p-4 transition-colors ${fulfilment === v ? "border-brand-700 bg-brand-50" : "border-line-strong bg-card hover:border-brand-500"}`}>
              <input type="radio" name="fulfilmentUI" className="sr-only" checked={fulfilment === v} onChange={() => setFulfilment(v)} />
              <span className="font-display text-[15px] font-semibold text-ink">{t}</span>
              <span className="mt-1 block text-[13px] leading-relaxed text-ink-soft">{d}</span>
            </label>
          ))}
        </div>
        {fulfilment === "DELIVERY" && (
          <div className="mt-4">
            <label className="field-label" htmlFor="deliveryAddress">Delivery address *</label>
            <textarea id="deliveryAddress" name="deliveryAddress" rows={2} className="field" maxLength={500} placeholder="Street, area, city — and any landmark that helps our rider" aria-invalid={Boolean(errors.deliveryAddress)} />
            {errors.deliveryAddress && <p className="field-error">{errors.deliveryAddress}</p>}
          </div>
        )}
        <div className="mt-4">
          <label className="field-label" htmlFor="additionalInfo">Anything else we should know? (optional)</label>
          <textarea id="additionalInfo" name="additionalInfo" rows={3} className="field" maxLength={1000} placeholder="e.g. call before coming, need alternatives if something is out of stock…" />
        </div>
      </div>

      {pomLines.length > 0 && (
        <div className="flex items-start gap-3 bg-rx-soft p-5 text-[13.5px] leading-relaxed text-rx sm:p-6">
          <ShieldAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            <strong>{pomLines.length} prescription-only {pomLines.length === 1 ? "item" : "items"} in this enquiry.</strong>{" "}
            These will be routed to our pharmacist for verification before pricing. If you declared a
            prescription, have it ready — supply only proceeds against a valid prescription.{" "}
            <Link href="/prescriptions" className="underline underline-offset-4">How prescriptions work</Link>.
          </p>
        </div>
      )}

      <div className="space-y-4 p-5 sm:p-6">
        <label className="flex items-start gap-3 text-[13.5px] leading-relaxed text-ink-soft">
          <input type="checkbox" name="privacyAcknowledged" className="mt-0.5 h-4.5 w-4.5 shrink-0 accent-brand-700" required aria-invalid={Boolean(errors.privacyAcknowledged)} />
          <span>
            I agree that Mediview Pharmacy may contact me about this enquiry and process my details
            for that purpose, in line with the <Link href="/privacy" className="text-brand-700 underline underline-offset-4">privacy notice</Link>. *
          </span>
        </label>
        {errors.privacyAcknowledged && <p className="field-error">{errors.privacyAcknowledged}</p>}
        {formError && (
          <p role="alert" className="rounded-sm border border-rx/30 bg-rx-soft px-3.5 py-2.5 text-[13.5px] text-rx">
            {formError}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" className="btn-primary" disabled={pending}>
            {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Send size={16} aria-hidden="true" />}
            {pending ? "Submitting…" : "Submit enquiry & request prices"}
          </button>
          <Link href="/basket" className="btn-ghost btn-sm">Back to basket</Link>
          <p className="flex items-center gap-1.5 text-[12.5px] text-ink-faint">
            <Lock size={13} aria-hidden="true" /> Demo — no data leaves this environment.
          </p>
        </div>
      </div>
    </form>
  );
}
