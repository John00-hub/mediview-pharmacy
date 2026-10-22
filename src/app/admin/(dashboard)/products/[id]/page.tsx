import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/data";
import { requireStaff } from "@/lib/auth-demo";
import { ProductForm } from "../product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff(["ADMIN"]);
  const { id } = await params;
  const store = db();
  const [product, categories, brands] = await Promise.all([
    store.getProductById(id),
    store.listCategories(),
    store.listBrands(),
  ]);
  if (!product) notFound();

  return (
    <div>
      <Link href="/admin/products" className="inline-flex items-center gap-1.5 text-[13.5px] text-ink-soft hover:text-brand-800">
        <ArrowLeft size={15} aria-hidden="true" /> All products
      </Link>
      <h1 className="mt-3 text-[22px] font-bold text-brand-950">{product.name}</h1>
      <div className="mt-5">
        <ProductForm product={product} categories={categories} brands={brands} />
      </div>
    </div>
  );
}
