import type { Metadata } from "next";
import { BUSINESS } from "@/lib/brand";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const DEFAULT_TITLE = `${BUSINESS.name} — ${BUSINESS.tagline} | Wuse 2, Abuja`;
export const DEFAULT_DESCRIPTION =
  "Mediview Pharmacy, Wuse 2 Abuja — browse medicines, vitamins, devices and wellness products, then request current prices and availability. Prescription items verified by our pharmacist.";

export function buildMetadata(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${SITE_URL}${opts.path}`;
  return {
    title: `${opts.title} | ${BUSINESS.name}`,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${opts.title} | ${BUSINESS.name}`,
      description: opts.description,
      siteName: BUSINESS.name,
      ...(opts.image ? { images: [{ url: opts.image }] } : {}),
    },
    twitter: {
      card: opts.image ? "summary_large_image" : "summary",
      title: `${opts.title} | ${BUSINESS.name}`,
      description: opts.description,
    },
    ...(opts.noIndex || process.env.DEMO_MODE !== "false"
      ? { robots: { index: false, follow: false } }
      : {}),
  };
}

/* ── JSON-LD builders (report §6.2 Principle 4) ─────────────────────────────
 * Product schema deliberately OMITS `offers` — no fabricated prices or
 * availability (directive §7, report §4.3). Pharmacy schema uses only
 * verified NAP data; openingHours are added once the client confirms them.
 */

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "Pharmacy"],
    name: BUSINESS.name,
    slogan: BUSINESS.tagline,
    url: SITE_URL,
    telephone: BUSINESS.phone,
    email: BUSINESS.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.line1,
      addressLocality: "Wuse 2",
      addressRegion: "FCT Abuja",
      addressCountry: "NG",
    },
    // openingHoursSpecification intentionally omitted until client-confirmed.
  };
}

export function productJsonLd(p: {
  name: string;
  description: string;
  brand?: string | null;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    url: `${SITE_URL}/p/${p.slug}`,
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    // No `offers` block: prices are enquiry-only and must never be fabricated.
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
}

export function itemListJsonLd(name: string, products: { name: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/p/${p.slug}`,
      name: p.name,
    })),
  };
}
