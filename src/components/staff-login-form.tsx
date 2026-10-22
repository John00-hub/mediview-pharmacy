"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { Loader2, Lock, ShieldCheck, ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { staffLoginAction } from "@/app/staff/actions";

const DEMO_ACCOUNTS = [
  { role: "Admin", email: "admin@demo.mediview", password: "demo-admin-2026", desc: "Full access incl. pharmacist verification" },
  { role: "Pharmacist", email: "pharmacist@demo.mediview", password: "demo-pharmacist-2026", desc: "Verification, quotes, statuses" },
  { role: "Sales", email: "sales@demo.mediview", password: "demo-sales-2026", desc: "Queue & quotes — cannot verify prescriptions" },
];


export function StaffLoginForm({ defaultNext }: { defaultNext: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await staffLoginAction({
        email: String(fd.get("email") ?? ""),
        password: String(fd.get("password") ?? ""),
      });
      if (res.ok) {
        router.push(params.get("next") || defaultNext);
        router.refresh();
      } else {
        setError(res.error ?? "Login failed.");
        setFieldErrors(res.fieldErrors ?? {});
      }
    });
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-6 inline-flex items-center gap-2 text-[13.5px] text-ink-soft hover:text-brand-800">
          <ArrowLeft size={15} aria-hidden="true" /> Back to storefront
        </Link>
        <div className="card p-6 sm:p-8">
          <div className="flex justify-center">
            <Logo compact />
          </div>
          <h1 className="mt-5 text-center font-display text-[20px] font-bold text-brand-950">Staff sign-in</h1>
          <p className="mt-1.5 text-center text-[13.5px] text-ink-soft">
            Pharmacy operations dashboard — demonstration environment
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label className="field-label" htmlFor="email">Work email</label>
              <input id="email" name="email" type="email" className="field" autoComplete="username" required aria-invalid={Boolean(fieldErrors.email)} />
              {fieldErrors.email && <p className="field-error">{fieldErrors.email}</p>}
            </div>
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="field" autoComplete="current-password" required aria-invalid={Boolean(fieldErrors.password)} />
              {fieldErrors.password && <p className="field-error">{fieldErrors.password}</p>}
            </div>
            {error && (
              <p role="alert" className="rounded-sm border border-rx/30 bg-rx-soft px-3.5 py-2.5 text-[13.5px] text-rx">
                {error}
              </p>
            )}
            <button type="submit" className="btn-primary w-full" disabled={pending}>
              {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
              {pending ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-6 rounded-sm border border-line bg-surface/70 p-4">
            <p className="flex items-center gap-1.5 font-display text-[12px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              <ShieldCheck size={13} aria-hidden="true" /> Demo accounts (click to fill)
            </p>
            <ul className="mt-2.5 space-y-1.5">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.email}>
                  <button
                    type="button"
                    className="w-full rounded-xs border border-line-strong bg-card px-3 py-2 text-left text-[12.5px] transition-colors hover:border-brand-500"
                    onClick={() => {
                      const form = document.querySelector<HTMLFormElement>("form");
                      if (!form) return;
                      (form.elements.namedItem("email") as HTMLInputElement).value = a.email;
                      (form.elements.namedItem("password") as HTMLInputElement).value = a.password;
                    }}
                  >
                    <strong className="font-display text-brand-900">{a.role}</strong> — {a.email}
                    <span className="block text-ink-faint">{a.desc}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11.5px] leading-relaxed text-ink-faint">
              Demo authentication only. Production uses Supabase Auth with MFA for staff and
              database-level role enforcement; these credentials exist nowhere else and grant
              access only to synthetic demo data.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


export function StaffLoginSuspense({ defaultNext }: { defaultNext: string }) {
  return (
    <Suspense fallback={<div className="skeleton mx-auto mt-24 h-96 w-full max-w-md" />}>
      <StaffLoginForm defaultNext={defaultNext} />
    </Suspense>
  );
}
