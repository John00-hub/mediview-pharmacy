import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShieldAlert, MessageCircle, Truck, Store, ChevronRight } from "lucide-react";
import { db } from "@/lib/data";
import { buildMetadata, productJsonLd, breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/JsonLd";
import { Breadcrumbs, ProductCard, RxBadge, ColdChainBadge } from "@/components/ui";
import { ProductTile } from "@/components/ProductTile";
import { AddToBasketPanel } from "@/components/add-to-basket-button";
import { waLink, BUSINESS } from "@/lib/brand";

/** Demo data is file-backed and mutable by the admin demo — always render fresh.
 *  Production (Supabase) switches this to ISR + revalidateTag; see docs. */
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await db().getProductBySlug(slug);
  if (!product) return {};
  const meta = buildMetadata({
    title: product.name,
    description: product.description.slice(0, 155),
    path: `/p/${product.slug}`,
  });
  return meta;
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = db();
  const product = await store.getProductBySlug(slug);
  if (!product) notFound();

  const [category, related, brands] = await Promise.all([
    store.listCategories().then((cs) => cs.find((c) => c.id === product.primaryCategoryId) ?? null),
    store.getRelatedProducts(product, 4),
    store.listBrands(),
  ]);
  const brand = product.brandId ? brands.find((b) => b.id === product.brandId) ?? null : null;
  const brandName = (id: string | null) => brands.find((b) => b.id === id)?.name ?? null;

  const specs: [string, string | null][] = [
    ["Brand", brand?.name ?? null],
    ["Generic name", product.genericName],
    ["Product type", product.doseForm.replace("-", " ")],
    ["Strength", product.strength],
    ["Pack size", product.packSize],
    ["Category", category?.name ?? null],
    ["Storage", product.coldChain ? "Cold chain — temperature controlled" : null],
  ];

  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs
        items={[
          { name: "Home", href: "/" },
          { name: "Shop", href: "/shop" },
          ...(category ? [{ name: category.name, href: `/c/${category.slug}` }] : []),
          { name: product.name },
        ]}
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* Gallery column */}
        <div>
          <ProductTile
            name={product.name}
            form={product.doseForm}
            brand={brand?.name}
            size="lg"
            className="aspect-4/5 w-full shadow-card"
          />
          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-faint">
            Product photography is scheduled with the pharmacy (report §11.2). This tile is the
            demo placeholder — real pack-shot images drop straight into this frame.
          </p>
        </div>

        {/* Detail column */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <RxBadge rxClass={product.rxClass} />
            {product.coldChain && <ColdChainBadge />}
            {product.professionalUseOnly && <span className="badge-neutral">Professional use</span>}
          </div>

          <h1 className="mt-3 text-[30px] leading-tight font-bold text-brand-950 sm:text-[36px]">
            {product.name}
          </h1>
          {brand && (
            <p className="mt-1.5 text-[15px] text-ink-soft">
              by <Link href={`/shop?brand=${brand.slug}`} className="link-under font-semibold text-brand-800">{brand.name}</Link>
              {product.genericName && <> · generic: <span className="font-medium">{product.genericName}</span></>}
            </p>
          )}

          <p className="mt-4 inline-flex items-center gap-2 rounded-sm border border-enquiry/30 bg-enquiry-soft px-3.5 py-2 font-display text-[14px] font-bold tracking-wide text-enquiry uppercase">
            Price on enquiry
          </p>
          <p className="mt-2 max-w-xl text-[14.5px] leading-relaxed text-ink-soft">
            Medicine prices change frequently, so we confirm the current price and availability
            with every enquiry — never a stale figure.
          </p>

          <div className="mt-7">
            <AddToBasketPanel product={product} brandName={brand?.name} />
          </div>

          {/* Fulfilment strip */}
          <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
            <div className="flex items-start gap-3 bg-card p-4">
              <Store size={18} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
              <p className="text-[13.5px] leading-relaxed text-ink-soft">
                <strong className="font-display text-ink">Pickup at Wuse 2</strong><br />
                {BUSINESS.address.line1} — {BUSINESS.address.landmarks.toLowerCase()}.
              </p>
            </div>
            <div className="flex items-start gap-3 bg-card p-4">
              <Truck size={18} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
              <p className="text-[13.5px] leading-relaxed text-ink-soft">
                <strong className="font-display text-ink">Delivery enquiry</strong><br />
                Choose delivery at checkout; our team confirms coverage and timing with your quote.
              </p>
            </div>
          </div>

          {/* Spec table */}
          <section aria-labelledby="specs" className="mt-8">
            <h2 id="specs" className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              Product details
            </h2>
            <table className="table-spec mt-3">
              <tbody>
                {specs.filter(([, v]) => v).map(([k, v]) => (
                  <tr key={k} className="border-t border-line">
                    <th scope="row">{k}</th>
                    <td className="capitalize">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Description */}
          <section aria-labelledby="desc" className="mt-8">
            <h2 id="desc" className="font-display text-[15px] font-bold tracking-[0.14em] text-ink-faint uppercase">
              About this item
            </h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-soft">{product.description}</p>
            {product.rxClass === "POM" && (
              <p className="mt-4 flex max-w-2xl items-start gap-2.5 rounded-sm border border-rx/25 bg-rx-soft px-4 py-3 text-[13.5px] leading-relaxed text-rx">
                <ShieldAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                This is a prescription-only medicine. Supply requires a valid prescription verified
                by our pharmacist. <Link href="/prescriptions" className="underline underline-offset-4">Read how it works</Link>.
              </p>
            )}
            <p className="mt-4 text-[13px] text-ink-faint">
              Questions about suitability? Speak to our pharmacist —{" "}
              <a href={waLink(`Hello, I have a question about ${product.name}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-700 underline underline-offset-4">
                <MessageCircle size={13} aria-hidden="true" /> ask on WhatsApp
              </a>{" "}
              or call {BUSINESS.phone}. This page provides product information only, not medical advice.
            </p>
          </section>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-14">
          <h2 id="related" className="text-[22px] font-bold text-brand-950">
            Related products
            {category && (
              <Link href={`/c/${category.slug}`} className="ml-3 inline-flex items-center gap-1 text-[13.5px] font-semibold text-brand-700 hover:underline">
                All {category.name} <ChevronRight size={14} aria-hidden="true" />
              </Link>
            )}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} brandName={brandName(p.brandId)} />
            ))}
          </div>
        </section>
      )}

      <JsonLd
        data={productJsonLd({
          name: product.name,
          description: product.description,
          brand: brand?.name,
          slug: product.slug,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          ...(category ? [{ name: category.name, path: `/c/${category.slug}` }] : []),
          { name: product.name, path: `/p/${product.slug}` },
        ])}
      />
    </div>
  );
}
