import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * Demo deployments are fully noindex/disallow (directive §15 — the staging
 * demo must never compete with or replace the live domain in search engines).
 * Production flips this by setting DEMO_MODE=false at build time.
 */
export default function robots(): MetadataRoute.Robots {
  const isDemo = process.env.DEMO_MODE !== "false";
  if (isDemo) {
    return { rules: [{ userAgent: "*", disallow: "/" }], sitemap: `${SITE_URL}/sitemap.xml` };
  }
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/staff", "/admin", "/basket", "/enquiry", "/track", "/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
