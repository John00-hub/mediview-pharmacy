import { db } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { BasketManager } from "@/components/basket-manager";
import { Breadcrumbs } from "@/components/ui";
import type { DoseForm } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Your enquiry basket",
  description: "Review the items in your Mediview Pharmacy enquiry basket before submitting.",
  path: "/basket",
  noIndex: true,
});

export default async function BasketPage() {
  // Map of product id → dose form so the basket can render tiles without a client fetch.
  const { products } = await db().listProducts({ pageSize: 1000 });
  const doseForms: Record<string, DoseForm> = Object.fromEntries(
    products.map((p) => [p.id, p.doseForm])
  );

  return (
    <div className="container-page py-8 lg:py-10">
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Enquiry basket" }]} />
      <h1 className="text-[28px] font-bold text-brand-950 sm:text-[34px]">Your enquiry basket</h1>
      <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">
        No prices are shown here on purpose — medicine prices change often, so your quote is
        prepared fresh by our team after you submit.
      </p>
      <div className="mt-8 max-w-3xl">
        <BasketManager doseForms={doseForms} />
      </div>
    </div>
  );
}
