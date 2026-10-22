"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, Search, ClipboardList, MessageCircle } from "lucide-react";
import { useBasket } from "./basket-provider";
import { waLink } from "@/lib/brand";

const ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/shop", label: "Shop", icon: LayoutGrid },
  { href: "/search", label: "Search", icon: Search },
  { href: "/basket", label: "Basket", icon: ClipboardList, badge: true },
];

export function StickyMobileBar() {
  const { count, hydrated } = useBasket();
  const pathname = usePathname();
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-paper/97 backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITEMS.map(({ href, label, icon: Icon, badge }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium ${
              active ? "text-brand-800" : "text-ink-soft"
            }`}
          >
            <Icon size={19} strokeWidth={active ? 2.2 : 1.8} aria-hidden="true" />
            {label}
            {badge && hydrated && count > 0 && (
              <span className="absolute top-1.5 right-1/2 translate-x-4.5 rounded-xs bg-rx px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
        );
      })}
      <a
        href={waLink("Hello Mediview Pharmacy…")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-14 flex-col items-center justify-center gap-0.5 bg-brand-700 py-1.5 text-[11px] font-semibold text-white"
      >
        <MessageCircle size={19} aria-hidden="true" />
        WhatsApp
      </a>
    </nav>
  );
}
