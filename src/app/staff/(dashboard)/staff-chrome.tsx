"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Inbox, LogOut, Store, FlaskConical, UserCog, Menu, X } from "lucide-react";
import type { StaffUser } from "@/lib/types";
import { staffLogoutAction } from "../actions";
import { Logo } from "@/components/Logo";

const NAV = [
  { href: "/staff", label: "Overview", icon: LayoutDashboard },
  { href: "/staff/enquiries", label: "Enquiry queue", icon: Inbox },
];

const ADMIN_NAV = [
  { href: "/admin", label: "Admin panel", icon: UserCog },
];

export function StaffChrome({ user, children }: { user: StaffUser; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const roleTone =
    user.role === "ADMIN"
      ? "bg-brand-900 text-white"
      : user.role === "PHARMACIST"
        ? "bg-brand-100 text-brand-900"
        : "bg-surface text-ink-soft";

  return (
    <div className="min-h-[70vh] bg-surface/50">
      <div className="border-b border-line bg-brand-950 text-brand-100">
        <div className="container-page flex items-center gap-4 py-2.5">
          <Link href="/staff" className="shrink-0 rounded-sm bg-paper p-1.5">
            <Logo compact />
          </Link>
          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => {
              const active = n.href === "/staff" ? pathname === "/staff" : pathname.startsWith(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[13.5px] transition-colors ${
                    active ? "bg-brand-800 font-semibold text-white" : "hover:bg-brand-900"
                  }`}
                >
                  <n.icon size={15} aria-hidden="true" /> {n.label}
                </Link>
              );
            })}
            {user.role === "ADMIN" &&
              ADMIN_NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="flex items-center gap-1.5 rounded-sm px-3 py-1.5 text-[13.5px] hover:bg-brand-900"
                >
                  <n.icon size={15} aria-hidden="true" /> {n.label}
                </Link>
              ))}
          </div>
          <button
            type="button"
            className="ml-auto text-brand-100 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle staff menu"
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ml-auto hidden items-center gap-3 md:flex">
            <span className={`badge ${roleTone}`}>
              {user.role === "PHARMACIST" && <FlaskConical size={11} aria-hidden="true" />}
              {user.role}
            </span>
            <span className="text-[13px] text-brand-200">{user.name}</span>
            <Link href="/" className="flex items-center gap-1 text-[13px] text-brand-200 hover:text-white">
              <Store size={14} aria-hidden="true" /> Storefront
            </Link>
            <form action={staffLogoutAction}>
              <button type="submit" className="flex items-center gap-1 rounded-sm border border-brand-700 px-2.5 py-1 text-[12.5px] text-brand-100 hover:bg-brand-900">
                <LogOut size={13} aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </div>
        {open && (
          <div className="border-t border-brand-900 px-4 py-3 md:hidden">
            <div className="grid gap-1">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="rounded-sm px-3 py-2 text-[14px] hover:bg-brand-900" onClick={() => setOpen(false)}>
                  {n.label}
                </Link>
              ))}
              {user.role === "ADMIN" && (
                <Link href="/admin" className="rounded-sm px-3 py-2 text-[14px] hover:bg-brand-900" onClick={() => setOpen(false)}>
                  Admin panel
                </Link>
              )}
              <Link href="/" className="rounded-sm px-3 py-2 text-[14px] hover:bg-brand-900" onClick={() => setOpen(false)}>
                Storefront
              </Link>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-brand-900 pt-3">
              <span className={`badge ${roleTone}`}>{user.role} · {user.name}</span>
              <form action={staffLogoutAction}>
                <button type="submit" className="flex items-center gap-1 rounded-sm border border-brand-700 px-2.5 py-1 text-[12.5px] hover:bg-brand-900">
                  <LogOut size={13} aria-hidden="true" /> Sign out
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      <div className="container-page py-6 lg:py-8">{children}</div>
    </div>
  );
}
