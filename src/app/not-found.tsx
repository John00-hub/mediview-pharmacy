import Link from "next/link";
import { Search as SearchIcon, ArrowRight, PackageSearch } from "lucide-react";
import { SearchBox } from "@/components/search-box";

/**
 * Custom 404 — a soft landing with working search and popular destinations,
 * never a dead end (report §6.2 Principle 3).
 */
export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-20 text-center lg:py-28">
      <span className="flex h-14 w-14 items-center justify-center rounded-sm bg-brand-50 text-brand-700">
        <PackageSearch size={26} aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-[30px] font-bold text-brand-950">We couldn’t find that page</h1>
      <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">
        The link may be from an older version of our website. Search the catalogue below, or jump
        straight to a popular destination.
      </p>
      <div className="mt-6 w-full max-w-lg">
        <SearchBox autoFocus />
      </div>
      <nav aria-label="Popular destinations" className="mt-8 flex flex-wrap justify-center gap-2.5">
        {[
          ["/shop", "All products"],
          ["/c/vitamins-supplements", "Vitamins & supplements"],
          ["/c/pain-relief", "Pain relief"],
          ["/prescriptions", "Prescriptions"],
          ["/track", "Track an enquiry"],
          ["/contact", "Contact"],
        ].map(([href, label]) => (
          <Link key={href} href={href} className="btn-quiet btn-sm">
            {label} <ArrowRight size={13} aria-hidden="true" />
          </Link>
        ))}
      </nav>
      <p className="mt-10 flex items-center gap-1.5 text-[13px] text-ink-faint">
        <SearchIcon size={13} aria-hidden="true" /> Still stuck? Call the pharmacy — we’ll point you the right way.
      </p>
    </div>
  );
}
