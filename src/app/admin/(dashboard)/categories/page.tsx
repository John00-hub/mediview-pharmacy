import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";
import { CategoriesManager } from "./categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireStaff(["ADMIN"]);
  const categories = await db().listCategories();
  return (
    <div>
      <h1 className="text-[22px] font-bold text-brand-950">Categories</h1>
      <p className="mt-1 text-[14px] text-ink-soft">
        The storefront taxonomy — normalized from the legacy site’s 14 shouty-caps categories into
        customer language (report §4.1).
      </p>
      <div className="mt-5">
        <CategoriesManager initial={categories} />
      </div>
    </div>
  );
}
