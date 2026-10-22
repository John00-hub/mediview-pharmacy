import type { MetadataRoute } from "next";
import { db } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const store = db();
  const [categories, { products }] = await Promise.all([
    store.listCategories(),
    store.listProducts({ pageSize: 1000 }),
  ]);

  const statics: MetadataRoute.Sitemap = [
    "", "/shop", "/prescriptions", "/delivery-pickup", "/about", "/contact", "/faq", "/privacy", "/terms", "/track",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.6,
  }));

  return [
    ...statics,
    ...categories.map((c) => ({
      url: `${SITE_URL}/c/${c.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((p) => ({
      url: `${SITE_URL}/p/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
