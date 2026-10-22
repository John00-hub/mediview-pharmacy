import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  await requireStaff(["ADMIN"]);
  const store = db();
  const [categories, brands] = await Promise.all([store.listCategories(), store.listBrands()]);
  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-[13.5px] text-ink-soft hover:text-brand-800">
        <ArrowLeft size={15} aria-hidden="true" /> All products
      </Link>
      <h1 className="mt-3 text-[22px] font-bold text-brand-950">Add product</h1>
      <p className="mt-1 text-[13.5px] text-ink-soft">
        Never invent strengths or pack sizes — record what the product label states.
      </p>
      <div className="mt-5">
        <ProductForm product={null} categories={categories} brands={brands} />
      </div>
    </div>
  );
}
