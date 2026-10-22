"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Phone,
  MessageCircle,
  ClipboardList,
  Menu,
  X,
  ChevronDown,
  MapPin,
  PackageSearch,
} from "lucide-react";
import { BUSINESS, waLink } from "@/lib/brand";
import { useBasket } from "./basket-provider";
import { SearchBox } from "./search-box";
import { Logo } from "./Logo";
import type { Category } from "@/lib/types";

const NAV_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/prescriptions", label: "Prescriptions" },
  { href: "/delivery-pickup", label: "Delivery & Pickup" },
  { href: "/track", label: "Track Enquiry" },
  { href: "/contact", label: "Contact" },
];

export function Header({ categories }: { categories: Category[] }) {
  const { count, hydrated, toast } = useBasket();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMobileOpen(false);
    setCatsOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm">
        {/* utility strip */}
        <div className="hidden border-b border-line bg-brand-900 text-brand-100 md:block">
          <div className="container-page flex h-9 items-center justify-between text-[12.5px]">
            <p className="flex items-center gap-1.5">
              <MapPin size={13} aria-hidden="true" />
              {BUSINESS.address.line1}, {BUSINESS.address.line2} — {BUSINESS.address.landmarks}
            </p>
            <div className="flex items-center gap-5">
              <a href={BUSINESS.phoneHref} className="flex items-center gap-1.5 hover:text-white">
                <Phone size={13} aria-hidden="true" /> {BUSINESS.phone}
              </a>
              <a
                href={waLink("Hello Mediview Pharmacy, I would like to ask about…")}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-white"
              >
                <MessageCircle size={13} aria-hidden="true" /> WhatsApp us
              </a>
              <Link href="/staff" className="hover:text-white">
                Staff login
              </Link>
            </div>
          </div>
        </div>

        {/* main row */}
        <div className="container-page flex items-center gap-4 py-3">
          <button
            type="button"
            className="btn-ghost -ml-2 px-2 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
            aria-expanded={mobileOpen}
          >
            <Menu size={22} />
          </button>

          <Link href="/" aria-label={`${BUSINESS.name} — home`} className="shrink-0">
            <Logo />
          </Link>

          <div className="hidden flex-1 justify-center px-4 md:flex">
            <SearchBox />
          </div>

          <div className="ml-auto flex items-center gap-1.5 md:gap-3">
            <a href={BUSINESS.phoneHref} className="btn-ghost btn-sm md:hidden" aria-label="Call the pharmacy">
              <Phone size={18} />
            </a>
            <Link
              href="/track"
              className="btn-ghost btn-sm hidden lg:inline-flex"
            >
              <PackageSearch size={16} aria-hidden="true" /> Track
            </Link>
            <Link href="/basket" className="btn-primary btn-sm relative">
              <ClipboardList size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Enquiry Basket</span>
              <span
                aria-label={`${hydrated ? count : 0} items in enquiry basket`}
                className="ml-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-xs bg-brand-950/40 px-1 font-display text-[11px] font-bold text-white"
              >
                {hydrated ? count : "–"}
              </span>
            </Link>
          </div>
        </div>

        {/* nav row (desktop) */}
        <nav aria-label="Main" className="hidden border-t border-line lg:block">
          <div className="container-page flex items-center gap-1 text-sm">
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-2.5 font-display font-semibold text-brand-900 hover:bg-brand-50"
                onClick={() => setCatsOpen((v) => !v)}
                aria-expanded={catsOpen}
                aria-haspopup="true"
              >
                Shop by Category <ChevronDown size={15} aria-hidden="true" />
              </button>
              {catsOpen && (
                <div className="absolute left-0 top-full z-50 mt-0.5 grid w-[560px] grid-cols-2 gap-x-2 rounded-md border border-line bg-card p-3 shadow-lift">
                  {categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/c/${c.slug}`}
                      className="rounded-sm px-3 py-2 text-[13.5px] text-ink hover:bg-brand-50 hover:text-brand-900"
                    >
                      {c.name}
                    </Link>
                  ))}
                  <Link
                    href="/shop"
                    className="col-span-2 mt-1 rounded-sm border-t border-line px-3 pt-2.5 text-[13.5px] font-display font-semibold text-brand-800 hover:bg-brand-50"
                  >
                    Browse all products →
                  </Link>
                </div>
              )}
            </div>
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2.5 transition-colors hover:text-brand-800 ${
                  pathname.startsWith(l.href) && l.href !== "/"
                    ? "font-display font-semibold text-brand-800"
                    : "text-ink-soft"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a
              href={waLink("Hello Mediview Pharmacy, I would like to ask about…")}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 px-3 py-2.5 text-ink-soft hover:text-brand-800"
            >
              <MessageCircle size={15} aria-hidden="true" /> WhatsApp
            </a>
          </div>
        </nav>

        {/* mobile search */}
        <div className="border-t border-line px-4 py-2.5 md:hidden">
          <SearchBox />
        </div>
      </header>

      {/* add-to-basket toast */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 top-20 z-50 flex justify-center px-4">
        {toast && (
          <p className="pointer-events-auto rounded-md border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm font-medium text-brand-900 shadow-lift">
            ✓ {toast} ·{" "}
            <Link href="/basket" className="underline underline-offset-4">
              View basket
            </Link>
          </p>
        )}
      </div>

      {/* mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col bg-paper shadow-lift">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <Logo compact />
              <button
                type="button"
                className="btn-ghost btn-sm px-2"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <p className="eyebrow mb-2">Categories</p>
              <div className="grid grid-cols-1 gap-0.5">
                {categories.map((c) => (
                  <Link
                    key={c.id}
                    href={`/c/${c.slug}`}
                    className="rounded-sm border-b border-line/60 py-2.5 text-[15px] text-ink"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
              <p className="eyebrow mt-5 mb-2">Services</p>
              <div className="grid gap-0.5">
                {NAV_LINKS.map((l) => (
                  <Link key={l.href} href={l.href} className="rounded-sm py-2.5 text-[15px] text-ink">
                    {l.label}
                  </Link>
                ))}
                <Link href="/about" className="rounded-sm py-2.5 text-[15px] text-ink">About us</Link>
                <Link href="/faq" className="rounded-sm py-2.5 text-[15px] text-ink">FAQ</Link>
              </div>
              <div className="mt-6 grid gap-2">
                <a href={BUSINESS.phoneHref} className="btn-secondary">
                  <Phone size={16} aria-hidden="true" /> Call {BUSINESS.phone}
                </a>
                <a
                  href={waLink("Hello Mediview Pharmacy, I would like to ask about…")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  <MessageCircle size={16} aria-hidden="true" /> Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
