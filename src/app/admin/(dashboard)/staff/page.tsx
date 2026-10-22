import { FlaskConical, ShieldCheck, UserCog, Tag } from "lucide-react";
import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";

export const dynamic = "force-dynamic";

const PERMISSIONS: { action: string; ADMIN: boolean; PHARMACIST: boolean; SALES: boolean }[] = [
  { action: "View enquiry queue & customers", ADMIN: true, PHARMACIST: true, SALES: true },
  { action: "Change enquiry status", ADMIN: true, PHARMACIST: true, SALES: true },
  { action: "Add internal notes", ADMIN: true, PHARMACIST: true, SALES: true },
  { action: "Prepare quotes (non-POM)", ADMIN: true, PHARMACIST: true, SALES: true },
  { action: "Record prescription verification", ADMIN: true, PHARMACIST: true, SALES: false },
  { action: "Advance POM enquiries before verification", ADMIN: true, PHARMACIST: true, SALES: false },
  { action: "View prescription documents (production)", ADMIN: true, PHARMACIST: true, SALES: false },
  { action: "Manage products, categories & content", ADMIN: true, PHARMACIST: false, SALES: false },
  { action: "Manage staff & roles (production: Supabase Auth)", ADMIN: true, PHARMACIST: false, SALES: false },
];

export default async function AdminStaffPage() {
  await requireStaff(["ADMIN"]);
  const staff = await db().listStaff();
  const icon = (role: string) =>
    role === "ADMIN" ? UserCog : role === "PHARMACIST" ? FlaskConical : Tag;

  return (
    <div>
      <h1 className="text-[22px] font-bold text-brand-950">Staff & roles</h1>
      <p className="mt-1 max-w-2xl text-[14px] text-ink-soft">
        Role separation is enforced <strong>server-side</strong> (and by database RLS in production) —
        never by hiding buttons alone. Sales staff physically cannot record pharmacist verification.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {staff.map((s) => {
          const Icon = icon(s.role);
          return (
            <div key={s.id} className="card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-100 text-brand-800">
                <Icon size={18} aria-hidden="true" />
              </span>
              <h2 className="mt-3 font-display text-[15.5px] font-semibold text-ink">{s.name}</h2>
              <p className="text-[13px] text-ink-faint">{s.email}</p>
              <p className="mt-2"><span className="badge-neutral">{s.role}</span></p>
            </div>
          );
        })}
      </div>

      <div className="card mt-8 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-[13.5px]">
          <caption className="border-b border-line px-5 py-3.5 text-left font-display text-[13px] font-bold tracking-[0.14em] text-ink-faint uppercase">
            Permission matrix (enforced in server actions + RLS)
          </caption>
          <thead>
            <tr className="border-b border-line bg-surface/60 font-display text-[11.5px] tracking-[0.12em] text-ink-faint uppercase">
              <th className="px-5 py-3">Action</th>
              <th className="px-4 py-3 text-center">Admin</th>
              <th className="px-4 py-3 text-center">Pharmacist</th>
              <th className="px-4 py-3 text-center">Sales</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {PERMISSIONS.map((p) => (
              <tr key={p.action}>
                <td className="px-5 py-3 text-ink">{p.action}</td>
                {(["ADMIN", "PHARMACIST", "SALES"] as const).map((role) => (
                  <td key={role} className="px-4 py-3 text-center">
                    {p[role] ? (
                      <span className="inline-flex text-ok" title="Permitted"><ShieldCheck size={16} aria-hidden="true" /><span className="sr-only">Permitted</span></span>
                    ) : (
                      <span className="inline-flex text-rx" title="Blocked server-side">✕<span className="sr-only">Blocked</span></span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-faint">
        Production note: staff accounts are provisioned through Supabase Auth (email + MFA) with a
        <code className="mx-1 rounded-xs bg-surface px-1">staff_users</code> row carrying the role
        claim; the demo’s signed-cookie sessions are replaced wholesale — see
        <code className="mx-1 rounded-xs bg-surface px-1">supabase/README.md</code>.
      </p>
    </div>
  );
}
