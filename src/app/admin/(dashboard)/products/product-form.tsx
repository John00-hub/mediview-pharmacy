"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, Save, Image as ImageIcon } from "lucide-react";
import type { Brand, Category, DoseForm, Product, RxClass } from "@/lib/types";
import { saveProductAction } from "../../actions";

const RX_OPTIONS: [RxClass, string][] = [
  ["OTC", "OTC — general sale"],
  ["POM", "Prescription only (POM)"],
  ["POM_OTC_WAIVER", "POM with OTC waiver (e.g. family planning)"],
  ["DEVICE", "Medical device"],
  ["GENERAL_RETAIL", "General retail"],
];

const FORM_OPTIONS: DoseForm[] = [
  "tablet", "caplet", "capsule", "syrup", "suspension", "sachet", "cream", "ointment", "gel",
  "wash", "inhaler", "nasal-spray", "eye-drop", "mouthwash", "suppository", "injection",
  "device", "test-kit", "drink", "food", "other",
];

export function ProductForm({
  product,
  categories,
  brands,
}: {
  product: Product | null;
  categories: Category[];
  brands: Brand[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const brandName = product?.brandId ? brands.find((b) => b.id === product.brandId)?.name ?? "" : "";
  const categorySlug = categories.find((c) => c.id === product?.primaryCategoryId)?.slug ?? categories[0]?.slug ?? "";

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await saveProductAction({
        id: product?.id,
        slug: product?.slug,
        name: String(fd.get("name") ?? ""),
        brandName: String(fd.get("brandName") ?? ""),
        genericName: String(fd.get("genericName") ?? ""),
        doseForm: String(fd.get("doseForm") ?? "tablet"),
        strength: String(fd.get("strength") ?? ""),
        packSize: String(fd.get("packSize") ?? ""),
        categorySlug: String(fd.get("categorySlug") ?? ""),
        rxClass: String(fd.get("rxClass") ?? "OTC"),
        description: String(fd.get("description") ?? ""),
        featured: fd.get("featured") === "on",
        coldChain: fd.get("coldChain") === "on",
        professionalUseOnly: fd.get("professionalUseOnly") === "on",
      });
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        setError(res.error ?? "Save failed.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="card max-w-3xl divide-y divide-line" noValidate>
      <div className="p-5 sm:p-6">
        <h2 className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
          {product ? "Edit product" : "New product"}
        </h2>
        {product && (
          <p className="mt-1.5 text-[12.5px] text-ink-faint">
            URL: <code className="rounded-xs bg-surface px-1.5 py-0.5">/p/{product.slug}</code> —
            slugs are stable; renaming never breaks links (SEO preservation by design).
          </p>
        )}
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="name">Product name *</label>
            <input id="name" name="name" className="field" required minLength={2} maxLength={160} defaultValue={product?.name} placeholder="e.g. Panadol ActiFast Tablets" />
          </div>
          <div>
            <label className="field-label" htmlFor="brandName">Brand</label>
            <input id="brandName" name="brandName" className="field" maxLength={80} defaultValue={brandName} list="brand-list" placeholder="e.g. Panadol" />
            <datalist id="brand-list">
              {brands.map((b) => <option key={b.id} value={b.name} />)}
            </datalist>
          </div>
          <div>
            <label className="field-label" htmlFor="genericName">Generic name (only if certain)</label>
            <input id="genericName" name="genericName" className="field" maxLength={120} defaultValue={product?.genericName ?? ""} placeholder="e.g. paracetamol" />
          </div>
          <div>
            <label className="field-label" htmlFor="strength">Strength (as labelled)</label>
            <input id="strength" name="strength" className="field" maxLength={40} defaultValue={product?.strength ?? ""} placeholder="e.g. 500mg" />
          </div>
          <div>
            <label className="field-label" htmlFor="packSize">Pack size (as labelled)</label>
            <input id="packSize" name="packSize" className="field" maxLength={60} defaultValue={product?.packSize ?? ""} placeholder="e.g. 24 tablets" />
          </div>
          <div>
            <label className="field-label" htmlFor="doseForm">Product type</label>
            <select id="doseForm" name="doseForm" className="field capitalize" defaultValue={product?.doseForm ?? "tablet"}>
              {FORM_OPTIONS.map((f) => <option key={f} value={f} className="capitalize">{f.replace("-", " ")}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="categorySlug">Category</label>
            <select id="categorySlug" name="categorySlug" className="field" defaultValue={categorySlug}>
              {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="rxClass">Prescription classification *</label>
            <select id="rxClass" name="rxClass" className="field" defaultValue={product?.rxClass ?? "OTC"}>
              {RX_OPTIONS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
            <p className="mt-1.5 text-[12px] text-ink-faint">
              Final classification is the Superintendent Pharmacist’s decision. POM items trigger the
              verification gate in every enquiry that contains them. Controlled medicines cannot be
              listed for online sale at all.
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="description">Description (factual — no therapeutic claims)</label>
            <textarea id="description" name="description" rows={3} className="field" maxLength={1200} defaultValue={product?.description ?? ""} placeholder="Leave blank for an auto-generated factual description." />
          </div>
          <fieldset className="sm:col-span-2">
            <legend className="field-label">Flags</legend>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-[14px] text-ink-soft">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="featured" className="h-4 w-4 accent-brand-700" defaultChecked={product?.featured} />
                Featured on homepage
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="coldChain" className="h-4 w-4 accent-brand-700" defaultChecked={product?.coldChain} />
                Cold chain
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="professionalUseOnly" className="h-4 w-4 accent-brand-700" defaultChecked={product?.professionalUseOnly} />
                Professional use only
              </label>
            </div>
          </fieldset>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
          <ImageIcon size={15} aria-hidden="true" /> Product image
        </h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
          The storefront currently renders the designed placeholder tile for every product.
          Production image management uploads real pack-shots to the private-capable Supabase
          Storage bucket (<code className="rounded-xs bg-surface px-1">product-images</code>) with
          automatic AVIF/WebP conversion via next/image — wiring arrives with the Supabase adapter,
          so no interface changes are needed.
        </p>
      </div>

      {error && (
        <p role="alert" className="bg-rx-soft px-5 py-3 text-[13.5px] text-rx sm:px-6">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3 p-5 sm:p-6">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
          {product ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className="btn-ghost btn-sm">Cancel</Link>
        {product && (
          <Link href={`/p/${product.slug}`} className="btn-quiet btn-sm ml-auto" target="_blank">
            View on storefront
          </Link>
        )}
      </div>
    </form>
  );
}
