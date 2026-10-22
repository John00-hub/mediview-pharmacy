"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Package, FolderTree, FileText, Users, Inbox, LogOut, Store, Menu, X } from "lucide-react";
import type { StaffUser } from "@/lib/types";
import { staffLogoutAction } from "@/app/staff/actions";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/content", label: "Website content", icon: FileText },
  { href: "/admin/staff", label: "Staff & roles", icon: Users },
  { href: "/staff/enquiries", label: "Enquiries", icon: Inbox },
];

export function AdminChrome({ user, children }: { user: StaffUser; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const linkCls = (href: string, exact?: boolean) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return `flex items-center gap-2.5 rounded-sm px-3 py-2 text-[13.5px] transition-colors ${
      active ? "bg-brand-700 font-semibold text-white" : "text-ink-soft hover:bg-brand-50 hover:text-brand-900"
    }`;
  };

  return (
    <div className="min-h-[70vh] bg-surface/50">
      <div className="border-b border-line bg-brand-950 text-brand-100">
        <div className="container-page flex items-center gap-4 py-2.5">
          <Link href="/admin" className="shrink-0 rounded-sm bg-paper p-1.5">
            <Logo compact />
          </Link>
          <p className="hidden font-display text-[13px] font-bold tracking-[0.16em] text-brand-200 uppercase sm:block">
            Administration
          </p>
          <button
            type="button"
            className="ml-auto text-brand-100 lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle admin menu"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <span className="badge bg-brand-900 text-white">ADMIN · {user.name}</span>
            <Link href="/" className="flex items-center gap-1 text-[13px] text-brand-200 hover:text-white">
              <Store size={14} aria-hidden="true" /> Storefront
            </Link>
            <form action={staffLogoutAction}>
              <button type="submit" className="flex items-center gap-1 rounded-sm border border-brand-700 px-2.5 py-1 text-[12.5px] hover:bg-brand-900">
                <LogOut size={13} aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </div>
        {open && (
          <div className="border-t border-brand-900 px-4 py-3 lg:hidden">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="block rounded-sm px-3 py-2 text-[14px] hover:bg-brand-900" onClick={() => setOpen(false)}>
                {n.label}
              </Link>
            ))}
            <form action={staffLogoutAction} className="mt-2 border-t border-brand-900 pt-3">
              <button type="submit" className="flex items-center gap-1.5 px-3 text-[13.5px]">
                <LogOut size={14} aria-hidden="true" /> Sign out ({user.name})
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="container-page grid gap-6 py-6 lg:grid-cols-[220px_1fr] lg:py-8">
        <aside aria-label="Admin sections" className="hidden lg:block">
          <nav className="card sticky top-6 p-2.5">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className={linkCls(n.href, "exact" in n ? n.exact : false)}>
                <n.icon size={16} aria-hidden="true" /> {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
