"use client";

import { useState } from "react";
import { MessageCircle, Mail } from "lucide-react";
import { contactFormSchema } from "@/lib/validation";
import { BUSINESS, waLink } from "@/lib/brand";

/**
 * Contact composer — honest by design: the demo does not fake a mail backend.
 * The message is composed here and dispatched through the pharmacy's real
 * channels (WhatsApp deep link / email client), exactly as the live site's
 * WhatsApp-first behaviour suggests works best for this business.
 */
export function ContactComposer() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });

  function validate(): boolean {
    const res = contactFormSchema.safeParse(form);
    if (res.success) {
      setErrors({});
      return true;
    }
    const next: Record<string, string> = {};
    for (const issue of res.error.issues) {
      const key = String(issue.path[0] ?? "message");
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);
    return false;
  }

  const composed = `Hello Mediview Pharmacy,%0A%0A${encodeURIComponent(
    form.message
  )}%0A%0A— ${encodeURIComponent(form.name)}${form.phone ? ` (${encodeURIComponent(form.phone)})` : ""}`;

  return (
    <form
      className="card p-5 sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        validate();
      }}
      noValidate
    >
      <h2 className="font-display text-[17px] font-semibold text-ink">Send a message</h2>
      <p className="mt-1 text-[13.5px] text-ink-soft">
        Write your message and send it through WhatsApp or email — the channels the pharmacy
        actually monitors. (This demo doesn’t fake a mail server.)
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="c-name">Your name *</label>
          <input id="c-name" className="field" value={form.name} maxLength={120}
            onChange={(e) => setForm({ ...form, name: e.target.value })} aria-invalid={Boolean(errors.name)} />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>
        <div>
          <label className="field-label" htmlFor="c-phone">Phone (optional)</label>
          <input id="c-phone" className="field" inputMode="tel" value={form.phone} maxLength={20}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <div>
          <label className="field-label" htmlFor="c-email">Email (optional)</label>
          <input id="c-email" type="email" className="field" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} aria-invalid={Boolean(errors.email)} />
          {errors.email && <p className="field-error">{errors.email}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="field-label" htmlFor="c-message">Message *</label>
          <textarea id="c-message" rows={5} className="field" maxLength={2000} value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })} aria-invalid={Boolean(errors.message)}
            placeholder="How can the pharmacy help?" />
          {errors.message && <p className="field-error">{errors.message}</p>}
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <a
          href={waLink().replace(/(\?text=).*/, `$1${composed}`)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          onClick={(e) => { if (!validate()) e.preventDefault(); }}
        >
          <MessageCircle size={16} aria-hidden="true" /> Send via WhatsApp
        </a>
        <a
          href={`mailto:${BUSINESS.email}?subject=${encodeURIComponent("Website enquiry")}&body=${decodeURIComponent(composed)}`}
          className="btn-secondary"
          onClick={(e) => { if (!validate()) e.preventDefault(); }}
        >
          <Mail size={16} aria-hidden="true" /> Send via Email
        </a>
      </div>
      <p className="mt-4 text-[12.5px] text-ink-faint">
        For medicine prices and availability, the <a href="/shop" className="underline underline-offset-4">enquiry basket</a>{" "}
        is faster — it sends structured line items instead of free text.
      </p>
    </form>
  );
}
