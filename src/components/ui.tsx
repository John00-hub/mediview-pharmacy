import Link from "next/link";
import { ChevronRight, ChevronLeft, Snowflake, ShieldAlert } from "lucide-react";
import type { EnquiryStatus, Product, RxClass } from "@/lib/types";
import { ENQUIRY_STATUS_LABELS } from "@/lib/types";
import { ProductTile } from "./ProductTile";

/* ── announcement / demo ribbon ──────────────────────────────────────────── */

export function AnnouncementBar({ text, enabled }: { text: string; enabled: boolean }) {
  if (!enabled || !text) return null;
  return (
    <div className="bg-enquiry-soft text-enquiry">
      <p className="container-page py-1.5 text-center text-[12.5px] font-medium">{text}</p>
    </div>
  );
}

/* ── badges ───────────────────────────────────────────────────────────────── */

export function RxBadge({ rxClass, compact = false }: { rxClass: RxClass; compact?: boolean }) {
  if (rxClass === "POM")
    return (
      <span className="badge-rx" title="Prescription-only medicine — pharmacist verification required">
        <ShieldAlert size={12} aria-hidden="true" /> {compact ? "Rx" : "Prescription only"}
      </span>
    );
  if (rxClass === "POM_OTC_WAIVER")
    return <span className="badge-enquiry">Pharmacist-guided</span>;
  if (rxClass === "DEVICE") return <span className="badge-neutral">Device</span>;
  return null;
}

export function ColdChainBadge() {
  return (
    <span className="badge bg-blue-50 text-blue-800" title="Temperature-controlled storage and transport">
      <Snowflake size={12} aria-hidden="true" /> Cold chain
    </span>
  );
}

const STATUS_TONE: Record<EnquiryStatus, string> = {
  NEW: "bg-surface text-ink",
  UNDER_REVIEW: "bg-enquiry-soft text-enquiry",
  AWAITING_PHARMACIST: "bg-rx-soft text-rx",
  QUOTE_PREPARED: "bg-ok-soft text-ok",
  AWAITING_CUSTOMER: "bg-blue-50 text-blue-800",
  COMPLETED: "bg-brand-100 text-brand-900",
  CLOSED: "bg-surface text-ink-faint",
};

export function StatusPill({ status }: { status: EnquiryStatus }) {
  return (
    <span className={`badge ${STATUS_TONE[status]}`}>{ENQUIRY_STATUS_LABELS[status]}</span>
  );
}

/* ── breadcrumbs ──────────────────────────────────────────────────────────── */

export function Breadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] text-ink-faint">
        {items.map((it, i) => (
          <li key={it.name + i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={13} aria-hidden="true" />}
            {it.href ? (
              <Link href={it.href} className="hover:text-brand-800 hover:underline underline-offset-4">
                {it.name}
              </Link>
            ) : (
              <span aria-current="page" className="text-ink-soft">{it.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── product card ─────────────────────────────────────────────────────────── */

export function ProductCard({ product, brandName }: { product: Product; brandName?: string | null }) {
  return (
    <article className="card group flex h-full flex-col overflow-hidden transition-shadow duration-200 hover:shadow-lift">
      <Link href={`/p/${product.slug}`} className="flex flex-1 flex-col" tabIndex={-1} aria-hidden="true">
        <ProductTile
          name={product.name}
          form={product.doseForm}
          brand={brandName}
          className="aspect-4/5 w-full border-0"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <RxBadge rxClass={product.rxClass} compact />
          {product.coldChain && <ColdChainBadge />}
        </div>
        <h3 className="font-display text-[14.5px] leading-snug font-semibold text-ink">
          <Link href={`/p/${product.slug}`} className="hover:text-brand-800 hover:underline underline-offset-4">
            {product.name}
          </Link>
        </h3>
        <p className="text-[12.5px] text-ink-faint">
          {[brandName, product.strength, product.packSize].filter(Boolean).join(" · ")}
        </p>
        <p className="mt-auto pt-2 font-display text-[12px] font-semibold tracking-wide text-enquiry uppercase">
          Price on enquiry
        </p>
      </div>
    </article>
  );
}


/* ── pagination ───────────────────────────────────────────────────────────── */

export function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;
  const build = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) if (v && k !== "page") params.set(k, v);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
  );
  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-center gap-1.5">
      {page > 1 && (
        <Link href={build(page - 1)} className="btn-quiet btn-sm" aria-label="Previous page">
          <ChevronLeft size={15} /> Prev
        </Link>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-ink-faint">…</span>}
          {p === page ? (
            <span aria-current="page" className="btn btn-sm bg-brand-700 text-white">
              {p}
            </span>
          ) : (
            <Link href={build(p)} className="btn-quiet btn-sm">
              {p}
            </Link>
          )}
        </span>
      ))}
      {page < totalPages && (
        <Link href={build(page + 1)} className="btn-quiet btn-sm" aria-label="Next page">
          Next <ChevronRight size={15} />
        </Link>
      )}
    </nav>
  );
}

/* ── skeletons / empty states ─────────────────────────────────────────────── */

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      <div className="skeleton aspect-4/5 w-full rounded-none" />
      <div className="space-y-2 p-3.5">
        <div className="skeleton h-3 w-2/3" />
        <div className="skeleton h-3 w-1/2" />
      </div>
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4" role="status" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
