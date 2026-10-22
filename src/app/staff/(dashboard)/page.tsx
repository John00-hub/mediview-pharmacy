import Link from "next/link";
import { Inbox, FlaskConical, BadgeCheck, Clock3, ArrowRight } from "lucide-react";
import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";
import { StatusPill } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function StaffOverview() {
  const user = await requireStaff();
  const store = db();
  const [all, { products }, categories] = await Promise.all([
    store.listEnquiries(),
    store.listProducts({ pageSize: 1000 }),
    store.listCategories(),
  ]);

  const awaiting = all.filter((e) => e.status === "AWAITING_PHARMACIST");
  const open_ = all.filter((e) => !["COMPLETED", "CLOSED"].includes(e.status));
  const today = all.filter((e) => e.createdAt.slice(0, 10) === new Date().toISOString().slice(0, 10));

  const stats = [
    { label: "Open enquiries", value: open_.length, icon: Inbox, href: "/staff/enquiries", alert: false },
    { label: "Awaiting pharmacist", value: awaiting.length, icon: FlaskConical, href: "/staff/enquiries?status=AWAITING_PHARMACIST", alert: awaiting.length > 0 },
    { label: "Received today", value: today.length, icon: Clock3, href: "/staff/enquiries", alert: false },
    { label: "Active products", value: products.filter((p) => p.status === "active").length, icon: BadgeCheck, href: "/admin/products", alert: false },
  ];

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-bold text-brand-950">Good day, {user.name.split(" ")[0]}</h1>
          <p className="mt-1 text-[14px] text-ink-soft">
            Signed in as <strong>{user.role}</strong>
            {user.role === "SALES" && " — prescription verification actions are reserved for pharmacist roles."}
            {user.role === "PHARMACIST" && " — you can record prescription verifications."}
            {user.role === "ADMIN" && " — full demonstration access, including the admin panel."}
          </p>
        </div>
        <Link href="/staff/enquiries" className="btn-primary btn-sm">
          Open enquiry queue <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`card p-5 transition-shadow hover:shadow-card ${s.alert ? "border-rx/40" : ""}`}
          >
            <s.icon size={19} className={s.alert ? "text-rx" : "text-brand-700"} aria-hidden="true" />
            <p className="mt-3 font-display text-[28px] font-bold leading-none text-brand-950">{s.value}</p>
            <p className="mt-1.5 text-[13px] text-ink-soft">{s.label}</p>
          </Link>
        ))}
      </div>

      <section aria-labelledby="recent" className="mt-10">
        <h2 id="recent" className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
          Latest enquiries
        </h2>
        {all.length === 0 ? (
          <div className="card mt-4 px-6 py-10 text-center">
            <p className="text-[14.5px] text-ink-soft">
              No enquiries yet. Open the <Link href="/shop" className="text-brand-700 underline underline-offset-4">storefront</Link>,
              build a basket and submit an enquiry to see the full journey here.
            </p>
          </div>
        ) : (
          <ul className="card mt-4 divide-y divide-line">
            {all.slice(0, 6).map((e) => (
              <li key={e.id}>
                <Link href={`/staff/enquiries/${e.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 transition-colors hover:bg-brand-50/60">
                  <span className="font-display text-[13.5px] font-bold tracking-wide text-brand-900">{e.refCode}</span>
                  <span className="text-[14px] text-ink">{e.customerName}</span>
                  <span className="text-[12.5px] text-ink-faint">{e.items.length} item(s) · {e.fulfilment.toLowerCase()}</span>
                  <span className="ml-auto flex items-center gap-2">
                    <StatusPill status={e.status} />
                    <ArrowRight size={14} className="text-ink-faint" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="ctx" className="mt-10 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <h2 id="ctx" className="font-display text-[15px] font-semibold text-ink">Catalogue context</h2>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
            {products.length} demo products across {categories.length} categories. All priced
            “on enquiry” — quotes are prepared per enquiry, never published.{" "}
            {user.role === "ADMIN" ? (
              <Link href="/admin/products" className="text-brand-700 underline underline-offset-4">Manage products →</Link>
            ) : null}
          </p>
        </div>
        <div className="card p-5">
          <h2 className="font-display text-[15px] font-semibold text-ink">Compliance reminders</h2>
          <ul className="mt-2 space-y-1.5 text-[13.5px] leading-relaxed text-ink-soft">
            <li>• POM lines require recorded pharmacist verification before quoting.</li>
            <li>• Controlled medicines are excluded from online sale entirely.</li>
            <li>• Customer health data is need-to-know: notes stay internal.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
