import Link from "next/link";
import { ArrowRight, Inbox } from "lucide-react";
import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";
import { StatusPill } from "@/components/ui";
import { ENQUIRY_STATUS_LABELS, type EnquiryStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const FILTERS: (EnquiryStatus | "ALL")[] = [
  "ALL", "NEW", "UNDER_REVIEW", "AWAITING_PHARMACIST", "QUOTE_PREPARED", "AWAITING_CUSTOMER", "COMPLETED", "CLOSED",
];

export default async function EnquiryQueue({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  await requireStaff();
  const { status } = await searchParams;
  const active = (FILTERS as string[]).includes(status ?? "") ? (status as EnquiryStatus | "ALL") : "ALL";
  const store = db();
  const enquiries = await store.listEnquiries(active === "ALL" ? undefined : { status: active });
  const counts = await (async () => {
    const all = active === "ALL" ? enquiries : await store.listEnquiries();
    const map: Record<string, number> = { ALL: all.length };
    for (const e of all) map[e.status] = (map[e.status] ?? 0) + 1;
    return map;
  })();

  return (
    <div>
      <h1 className="text-[24px] font-bold text-brand-950">Enquiry queue</h1>
      <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === "ALL" ? "/staff/enquiries" : `/staff/enquiries?status=${f}`}
            role="tab"
            aria-selected={active === f}
            className={`rounded-xs border px-3 py-1.5 font-display text-[12.5px] font-semibold transition-colors ${
              active === f
                ? "border-brand-700 bg-brand-700 text-white"
                : "border-line-strong bg-card text-ink-soft hover:border-brand-500"
            }`}
          >
            {f === "ALL" ? "All" : ENQUIRY_STATUS_LABELS[f as EnquiryStatus]}
            <span className="ml-1.5 text-[11px] opacity-75">{counts[f] ?? 0}</span>
          </Link>
        ))}
      </div>

      {enquiries.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center gap-3 px-6 py-16 text-center">
          <Inbox size={30} className="text-ink-faint" aria-hidden="true" />
          <h2 className="font-display text-lg font-semibold text-ink">No enquiries here</h2>
          <p className="max-w-sm text-[14px] text-ink-soft">
            Submit one from the storefront to see the full customer-to-staff journey.
          </p>
          <Link href="/shop" className="btn-primary btn-sm mt-1">Go to storefront</Link>
        </div>
      ) : (
        <ul className="card mt-6 divide-y divide-line">
          {enquiries.map((e) => {
            const pomCount = e.items.filter((i) => i.hasPrescription).length;
            return (
              <li key={e.id}>
                <Link href={`/staff/enquiries/${e.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-5 py-4 transition-colors hover:bg-brand-50/60">
                  <span className="font-display text-[13.5px] font-bold tracking-wide text-brand-900">{e.refCode}</span>
                  <span className="text-[14.5px] font-medium text-ink">{e.customerName}</span>
                  <span className="text-[13px] text-ink-faint">{e.customerPhone}</span>
                  <span className="text-[12.5px] text-ink-faint">
                    {e.items.length} item(s) · {e.fulfilment === "PICKUP" ? "pickup" : "delivery"} · {e.contactPreference.replace("_", " ").toLowerCase()}
                    {pomCount > 0 && <span className="ml-1.5 font-semibold text-rx">· {pomCount} Rx</span>}
                  </span>
                  <span className="ml-auto flex items-center gap-2.5">
                    <span className="hidden text-[12px] text-ink-faint sm:inline">
                      {new Date(e.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    <StatusPill status={e.status} />
                    <ArrowRight size={14} className="text-ink-faint" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
