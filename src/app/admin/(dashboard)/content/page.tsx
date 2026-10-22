import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";
import { ContentForm } from "./content-form";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  await requireStaff(["ADMIN"]);
  const store = db();
  const [content, { products }] = await Promise.all([store.getContent(), store.listProducts({ pageSize: 1000 })]);
  const featuredSlugs = content.featuredProductIds
    .map((id) => products.find((p) => p.id === id)?.slug)
    .filter(Boolean)
    .join(", ");

  return (
    <div>
      <h1 className="text-[22px] font-bold text-brand-950">Website content</h1>
      <p className="mt-1 max-w-2xl text-[14px] text-ink-soft">
        Announcement bar, opening hours, about copy, featured products and the footer note —
        editable without touching code. Contact details (NAP) are managed as verified constants
        until the client confirms updates (report §15).
      </p>
      <div className="mt-5">
        <ContentForm content={content} featuredSlugs={featuredSlugs} />
      </div>
    </div>
  );
}
