"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2, FlaskConical, ShieldAlert, MessageCircle, StickyNote, BadgeCheck } from "lucide-react";
import type { Enquiry, EnquiryStatus, StaffUser } from "@/lib/types";
import { ENQUIRY_STATUS_LABELS } from "@/lib/types";
import { waLink, BUSINESS } from "@/lib/brand";
import {
  updateEnquiryStatusAction,
  addInternalNoteAction,
  pharmacistVerifyAction,
  prepareQuoteAction,
} from "@/app/staff/actions";

const STATUSES: EnquiryStatus[] = [
  "NEW", "UNDER_REVIEW", "AWAITING_PHARMACIST", "QUOTE_PREPARED", "AWAITING_CUSTOMER", "COMPLETED", "CLOSED",
];

const TEMPLATES: { label: string; build: (e: Enquiry) => string }[] = [
  {
    label: "Quote ready",
    build: (e) =>
      `Hello ${e.customerName.split(" ")[0]}, your Mediview Pharmacy enquiry ${e.refCode} has been priced. We'll share the details with you now — thank you for your patience.`,
  },
  {
    label: "Need prescription",
    build: (e) =>
      `Hello ${e.customerName.split(" ")[0]}, regarding enquiry ${e.refCode}: one or more items are prescription-only. Please share a valid prescription (prescriber name, registration number, your details, date and signature) so our pharmacist can verify and we can price your request.`,
  },
  {
    label: "Ready for pickup",
    build: (e) =>
      `Hello ${e.customerName.split(" ")[0]}, enquiry ${e.refCode} is ready for pickup at ${BUSINESS.address.line1}, Wuse 2 (${BUSINESS.address.landmarks.toLowerCase()}). Please bring your prescription for any prescription-only items.`,
  },
];

export function EnquiryOps({ enquiry, user }: { enquiry: Enquiry; user: StaffUser }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState("");
  const canVerify = user.role === "PHARMACIST" || user.role === "ADMIN";

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Action failed.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      {/* Status control */}
      <div className="card p-5">
        <h2 className="font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
          Enquiry status
        </h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              disabled={pending || s === enquiry.status}
              onClick={() => run(() => updateEnquiryStatusAction(enquiry.id, s))}
              className={`rounded-xs border px-3 py-1.5 font-display text-[12.5px] font-semibold transition-colors disabled:cursor-default ${
                s === enquiry.status
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-line-strong bg-card text-ink-soft hover:border-brand-500 disabled:opacity-50"
              }`}
              aria-pressed={s === enquiry.status}
            >
              {ENQUIRY_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-3 flex items-start gap-2 rounded-sm border border-rx/30 bg-rx-soft px-3.5 py-2.5 text-[13px] text-rx">
            <ShieldAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
          </p>
        )}
      </div>

      {/* Pharmacist verification */}
      <div className={`card p-5 ${enquiry.status === "AWAITING_PHARMACIST" ? "border-rx/40" : ""}`}>
        <h2 className="flex items-center gap-2 font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
          <FlaskConical size={14} aria-hidden="true" /> Pharmacist verification
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          {enquiry.pharmacistVerified
            ? "Verification recorded — prescription lines may now be quoted and fulfilled."
            : "Not yet verified. Prescription-only lines must be verified before quoting (quantity limited to what the prescription authorizes)."}
        </p>
        {canVerify ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => run(() => pharmacistVerifyAction(enquiry.id, !enquiry.pharmacistVerified))}
            className={`btn btn-sm mt-3 w-full ${enquiry.pharmacistVerified ? "btn-quiet" : "btn-primary"}`}
          >
            <BadgeCheck size={15} aria-hidden="true" />
            {enquiry.pharmacistVerified ? "Withdraw verification" : "Record pharmacist verification"}
          </button>
        ) : (
          <p className="mt-3 rounded-sm bg-surface px-3.5 py-2.5 text-[12.5px] text-ink-faint">
            Restricted to pharmacist and admin roles. Your sales role can progress everything else —
            this gate mirrors the production permission model (and is enforced server-side).
          </p>
        )}
      </div>

      {/* Quote preparation */}
      <div className="card p-5">
        <h2 className="font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
          Prepare quote
        </h2>
        <label className="mt-2.5 block" htmlFor="quote-note">
          <span className="sr-only">Quote summary</span>
          <textarea
            id="quote-note"
            rows={3}
            className="field"
            placeholder="e.g. All items available; total ₦XX,XXX confirmed by phone. Panadol ActiFast 24-pack offered as substitute for 14-packs."
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            maxLength={500}
          />
        </label>
        <button
          type="button"
          disabled={pending}
          className="btn-primary btn-sm mt-2.5 w-full"
          onClick={() => run(() => prepareQuoteAction(enquiry.id, quote))}
        >
          Mark quote prepared
        </button>
        <p className="mt-2 text-[11.5px] text-ink-faint">
          Demo records the quote note in the activity log; production adds per-line price fields and
          sends the quote through the customer’s preferred channel.
        </p>
      </div>

      {/* Reply templates */}
      <div className="card p-5">
        <h2 className="flex items-center gap-2 font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
          <MessageCircle size={14} aria-hidden="true" /> Reply templates
        </h2>
        <div className="mt-3 grid gap-2">
          {TEMPLATES.map((t) => (
            <a
              key={t.label}
              href={waLink(t.build(enquiry))}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-sm border border-line-strong bg-card px-3.5 py-2.5 text-left text-[13px] transition-colors hover:border-brand-500 hover:bg-brand-50"
            >
              <strong className="font-display text-brand-900">{t.label}</strong>
              <span className="mt-0.5 block truncate text-[12px] text-ink-faint">{t.build(enquiry)}</span>
            </a>
          ))}
        </div>
        <p className="mt-2.5 text-[11.5px] text-ink-faint">
          Opens WhatsApp with a prefilled message including the reference — the demo’s stand-in for
          production notifications (WhatsApp Business API / SMS).
        </p>
      </div>

      {/* Internal notes */}
      <div className="card p-5">
        <h2 className="flex items-center gap-2 font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
          <StickyNote size={14} aria-hidden="true" /> Internal notes (staff only)
        </h2>
        {enquiry.internalNotes.length > 0 && (
          <ul className="mt-3 space-y-2">
            {enquiry.internalNotes.map((n, i) => (
              <li key={i} className="rounded-sm bg-surface px-3.5 py-2.5 text-[13px]">
                <p className="text-ink">{n.text}</p>
                <p className="mt-1 text-[11.5px] text-ink-faint">
                  {n.author} · {new Date(n.at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </li>
            ))}
          </ul>
        )}
        <label className="mt-3 block" htmlFor="note">
          <span className="sr-only">Add internal note</span>
          <textarea id="note" rows={2} className="field" maxLength={2000} placeholder="Add a note for colleagues…" value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
        <button
          type="button"
          disabled={pending || !note.trim()}
          className="btn-secondary btn-sm mt-2.5"
          onClick={() => run(async () => { const r = await addInternalNoteAction(enquiry.id, note); if (r.ok) setNote(""); return r; })}
        >
          {pending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : null} Add note
        </button>
      </div>
    </div>
  );
}
