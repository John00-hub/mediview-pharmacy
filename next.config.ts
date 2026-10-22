import type { NextConfig } from "next";

const isDemo = process.env.DEMO_MODE !== "false";

/**
 * Security headers (see Intelligence Report §12.1 — every one of these was
 * missing on the legacy site).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; "),
  },
  // HSTS is intentionally enabled only once the production domain + cert are
  // in place (report §14 Phase 3). Kept off for the localhost demo.
];

const demoHeaders = isDemo
  ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
  : [];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Supabase Storage (production adapter). Demo mode uses local assets only.
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...securityHeaders, ...demoHeaders],
      },
    ];
  },
  async redirects() {
    // Legacy URL rescue map — Intelligence Report §6.2 (2018 PrestaShop era).
    // Unmapped legacy product URLs are handled by the catch-all soft-404 logic,
    // NOT blindly sent to the homepage.
    return [
      { source: "/20-medicines", destination: "/shop", permanent: true },
      { source: "/21-healthcare", destination: "/c/devices-diagnostics", permanent: true },
      { source: "/22-mother-baby", destination: "/c/mother-baby", permanent: true },
      { source: "/23-vitamins", destination: "/c/vitamins-supplements", permanent: true },
      { source: "/24-toiletries", destination: "/c/personal-care", permanent: true },
      { source: "/25-skincare", destination: "/c/skin-care", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/content/4-about-us", destination: "/about", permanent: true },
      { source: "/content/1-delivery", destination: "/delivery-pickup", permanent: true },
      {
        source: "/content/3-terms-and-conditions-of-use",
        destination: "/terms",
        permanent: true,
      },
      { source: "/my-account", destination: "/track", permanent: false },
      { source: "/cart", destination: "/basket", permanent: false },
      { source: "/quick-order", destination: "/shop", permanent: false },
      { source: "/new-products", destination: "/shop", permanent: false },
      { source: "/module/:path*", destination: "/shop", permanent: false },
      // Legacy PrestaShop product pattern /{category}/{id}-{slug}.html —
      // best-effort slug carry-over, resolved by the catch-all redirect below.
      {
        source: "/:section/:id(\\d+)-:slug.html",
        destination: "/p/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
