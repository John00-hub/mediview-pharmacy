import Link from "next/link";
import { Package, FolderTree, FileText, Users, Inbox, ArrowRight } from "lucide-react";
import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";

export const dynamic = "force-dynamic";

export default async function AdminOverview() {
  await requireStaff(["ADMIN"]);
  const store = db();
  const [{ products }, categories, enquiries, content] = await Promise.all([
    store.listProducts({ pageSize: 1000, includeArchived: true }),
    store.listCategories(),
    store.listEnquiries(),
    store.getContent(),
  ]);

  const cards = [
    {
      href: "/admin/products",
      icon: Package,
      title: "Product management",
      stat: `${products.filter((p) => p.status === "active").length} active · ${products.filter((p) => p.status === "archived").length} archived`,
      desc: "Add, edit and archive products; assign categories; manage classification and visibility.",
    },
    {
      href: "/admin/categories",
      icon: FolderTree,
      title: "Category management",
      stat: `${categories.length} categories`,
      desc: "Create, edit and reorder the storefront taxonomy.",
    },
    {
      href: "/admin/content",
      icon: FileText,
      title: "Website content",
      stat: content.announcement.enabled ? "Announcement live" : "Announcement off",
      desc: "Announcement bar, opening hours, about copy, featured products and footer note.",
    },
    {
      href: "/staff/enquiries",
      icon: Inbox,
      title: "Enquiry management",
      stat: `${enquiries.filter((e) => !["COMPLETED", "CLOSED"].includes(e.status)).length} open`,
      desc: "Queue, filters, status control, quote preparation and audit history.",
    },
    {
      href: "/admin/staff",
      icon: Users,
      title: "Staff & roles",
      stat: "3 demo roles",
      desc: "Role separation: admin, pharmacist and sales — with server-enforced permission gates.",
    },
  ];

  return (
    <div>
      <h1 className="text-[24px] font-bold text-brand-950">Administration</h1>
      <p className="mt-1 max-w-2xl text-[14px] text-ink-soft">
        The owner’s view: everything the storefront shows is managed here — no code edits required.
        Changes apply to the demo immediately (production persists to Supabase with the same forms).
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="card group p-5 transition-shadow hover:shadow-card">
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-brand-100 text-brand-800">
                <c.icon size={19} aria-hidden="true" />
              </span>
              <ArrowRight size={16} className="mt-1 text-ink-faint transition-transform group-hover:translate-x-0.5 group-hover:text-brand-700" aria-hidden="true" />
            </div>
            <h2 className="mt-3.5 font-display text-[16px] font-semibold text-ink">{c.title}</h2>
            <p className="mt-0.5 font-display text-[12.5px] font-semibold tracking-wide text-brand-700 uppercase">{c.stat}</p>
            <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
