#!/usr/bin/env node
/**
 * MEDIVIEW PHARMACY — END-TO-END ACCEPTANCE TEST (directive §21)
 *
 * Runs against a live server (default http://localhost:3000). Exercises the
 * SAME server actions the UI uses, through the demo harness endpoints.
 *
 *   node scripts/acceptance-test.mjs [baseUrl]
 */

const BASE = process.argv[2] || process.env.BASE_URL || "http://localhost:3000";
let pass = 0;
let fail = 0;
const failures = [];

function check(name, ok, detail = "") {
  if (ok) {
    pass++;
    console.log(`  ✓ ${name}`);
  } else {
    fail++;
    failures.push(`${name} ${detail}`);
    console.log(`  ✗ ${name} ${detail}`);
  }
}

async function get(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual", ...opts });
  const text = await res.text().catch(() => null);
  return { status: res.status, headers: res.headers, text };
}

function cookieOf(res) {
  const raw = res.headers.getSetCookie?.() ?? [];
  return raw.map((c) => c.split(";")[0]).join("; ");
}

const j = (r) => r.json();

console.log(`\nMEDIVIEW 2.0 — acceptance test against ${BASE}\n`);

// ── 1. Public routes render ─────────────────────────────────────────────────
console.log("Public routes:");
const PUBLIC_ROUTES = [
  "/", "/shop", "/c/pain-relief", "/c/vitamins-supplements", "/search?q=panadol",
  "/basket", "/enquiry", "/track", "/prescriptions", "/about", "/contact",
  "/faq", "/delivery-pickup", "/privacy", "/terms", "/staff/login", "/admin/login",
];
for (const route of PUBLIC_ROUTES) {
  const r = await get(route);
  check(`GET ${route} → 200`, r.status === 200, `(got ${r.status})`);
}

// ── 2. Homepage integrity ───────────────────────────────────────────────────
console.log("\nHomepage integrity:");
const home = await get("/");
check("Homepage mentions brand", home.text?.includes("Mediview"));
check("Homepage mentions verified address", home.text?.includes("Aminu Crescent"));
check("Homepage mentions verified phone", home.text?.includes("704 878 1219"));
check("NO fabricated ₦0.00 prices", !home.text?.includes("₦0.00"));
check("NO fabricated ₦1.00 prices", !home.text?.includes("₦1.00"));
check("Price-on-enquiry messaging present", /Price on enquiry/i.test(home.text ?? ""));
check("JSON-LD Pharmacy present", home.text?.includes('"@type":["Organization","Pharmacy"]') || home.text?.includes('"Pharmacy"'));
check("Single <h1>", (home.text?.match(/<h1/g) ?? []).length === 1);

// ── 3. SEO surface ──────────────────────────────────────────────────────────
console.log("\nSEO surface:");
const robots = await get("/robots.txt");
check("robots.txt served (demo: disallow all)", robots.status === 200 && /Disallow: \//.test(robots.text ?? ""));
const sitemap = await get("/sitemap.xml");
check("sitemap.xml served with product URLs", sitemap.status === 200 && sitemap.text?.includes("/p/"));
const legacy = await get("/25-skincare");
check("Legacy /25-skincare redirects", [301, 302, 307, 308].includes(legacy.status) && (legacy.headers.get("location") ?? "").includes("/c/skin-care"), `(got ${legacy.status} → ${legacy.headers.get("location")})`);
const legacy2 = await get("/content/4-about-us");
check("Legacy /content/4-about-us redirects to /about", [301, 302, 307, 308].includes(legacy2.status) && (legacy2.headers.get("location") ?? "").includes("/about"));
const nf = await get("/definitely-not-a-page");
check("Unknown path → custom 404", nf.status === 404 && nf.text?.toLowerCase().includes("couldn"));
check("X-Robots-Tag noindex in demo", home.headers.get("x-robots-tag")?.includes("noindex"));
check("Security headers present", home.headers.get("x-frame-options") === "DENY" && home.headers.get("x-content-type-options") === "nosniff" && Boolean(home.headers.get("content-security-policy")));

// ── 4. Search ───────────────────────────────────────────────────────────────
console.log("\nIntelligent search:");
const suggest = await j(await fetch(`${BASE}/api/suggest?q=panadol`));
check("Suggest returns Panadol matches", Array.isArray(suggest) && suggest.some((s) => /panadol/i.test(s.label)));
const typo = await j(await fetch(`${BASE}/api/suggest?q=panadl`));
check("Typo tolerance (panadl → Panadol)", Array.isArray(typo) && typo.some((s) => /panadol/i.test(s.label)));
const generic = await j(await fetch(`${BASE}/api/suggest?q=paracetamol`));
check("Generic-name match (paracetamol)", Array.isArray(generic) && generic.length > 0);
const searchPage = await get("/search?q=vitamin+c");
check("Search URL /search?q= renders results", searchPage.status === 200 && /vitamin c/i.test(searchPage.text ?? ""));

// ── 5. Product page ─────────────────────────────────────────────────────────
console.log("\nProduct page:");
const products = await j(await fetch(`${BASE}/api/demo/products?q=panadol+actifast`));
const target = products[0];
check("Product resolvable", Boolean(target?.slug));
const pPage = await get(`/p/${target.slug}`);
check("Product page renders", pPage.status === 200 && pPage.text?.includes(target.name));
check("Product page: Price on enquiry (no numbers)", /Price on enquiry/i.test(pPage.text ?? "") && !/₦\d/.test(pPage.text ?? ""));
check("Product page: WhatsApp deep link", pPage.text?.includes("wa.me/2347048781219"));
check("Product page: breadcrumbs", pPage.text?.includes("Breadcrumb") || pPage.text?.includes("breadcrumb"));

// POM gating example
const pomProducts = await j(await fetch(`${BASE}/api/demo/products?q=tenormin`));
const pom = pomProducts.find((p) => p.rxClass === "POM");
check("POM product exists with POM classification", Boolean(pom));
const pomPage = await get(`/p/${pom.slug}`);
check("POM page shows prescription gate", /Prescription only|prescription-only/i.test(pomPage.text ?? ""));

// controlled items excluded
const controlled = await j(await fetch(`${BASE}/api/demo/products?q=alprazolam`));
check("Controlled items excluded from catalogue", controlled.length === 0);

// ── 6. Enquiry journey (customer → staff → tracking) ───────────────────────
console.log("\nEnquiry journey:");
const otcProducts = await j(await fetch(`${BASE}/api/demo/products?q=centrum`));
const otc = otcProducts[0];
const phone = "08031234567";
const submitRes = await fetch(`${BASE}/api/demo/enquiries`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    customerName: "Amaka Test",
    customerPhone: phone,
    customerEmail: "amaka.test@example.com",
    contactPreference: "WHATSAPP",
    fulfilment: "PICKUP",
    privacyAcknowledged: true,
    items: [
      { productId: otc.id, quantity: 2, note: "Please confirm expiry date" },
      { productId: pom.id, quantity: 1, hasPrescription: true, prescriptionFileName: "SYNTHETIC-prescription-demo.png" },
    ],
  }),
});
const submitBody = await submitRes.json();
check("Enquiry submitted → 201 + reference", submitRes.status === 201 && submitBody.ok && /^MVP-\d{4}-\d{4}$/.test(submitBody.data?.refCode ?? ""), JSON.stringify(submitBody).slice(0, 120));
const ref = submitBody.data?.refCode;

// validation rejection
const badSubmit = await fetch(`${BASE}/api/demo/enquiries`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ customerName: "X", customerPhone: "123", privacyAcknowledged: false, items: [] }),
});
check("Invalid enquiry rejected (400)", badSubmit.status === 400);

// POM routing
const track1 = await j(await fetch(`${BASE}/api/demo/track?ref=${ref}&phone=${phone}`));
check("Tracking requires ref+phone and works", track1.ok === true);
check("POM enquiry auto-routed to AWAITING_PHARMACIST", track1.data?.enquiry?.status === "AWAITING_PHARMACIST", `(got ${track1.data?.enquiry?.status})`);
const trackBad = await j(await fetch(`${BASE}/api/demo/track?ref=${ref}&phone=08099999999`));
check("Wrong phone cannot track (anti-enumeration)", trackBad.ok === false);

// ── 7. Role separation ──────────────────────────────────────────────────────
console.log("\nRole separation (staff):");
const salesLogin = await fetch(`${BASE}/api/demo/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "sales@demo.mediview", password: "demo-sales-2026" }),
});
const salesCookie = cookieOf(salesLogin);
check("Sales login succeeds", salesLogin.status === 200 && Boolean(salesCookie));

const enquiryId = track1.data.enquiry.id;
const salesVerify = await fetch(`${BASE}/api/demo/enquiries/${enquiryId}`, {
  method: "POST",
  headers: { "content-type": "application/json", cookie: salesCookie },
  body: JSON.stringify({ op: "verify", verified: true }),
});
check("SALES cannot record pharmacist verification (403)", salesVerify.status === 403);

const pharmLogin = await fetch(`${BASE}/api/demo/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "pharmacist@demo.mediview", password: "demo-pharmacist-2026" }),
});
const pharmCookie = cookieOf(pharmLogin);
check("Pharmacist login succeeds", pharmLogin.status === 200 && Boolean(pharmCookie));

const verifyRes = await j(await fetch(`${BASE}/api/demo/enquiries/${enquiryId}`, {
  method: "POST",
  headers: { "content-type": "application/json", cookie: pharmCookie },
  body: JSON.stringify({ op: "verify", verified: true }),
}));
check("PHARMACIST records verification", verifyRes.ok === true && verifyRes.enquiry?.pharmacistVerified === true);

const quoteRes = await j(await fetch(`${BASE}/api/demo/enquiries/${enquiryId}`, {
  method: "POST",
  headers: { "content-type": "application/json", cookie: pharmCookie },
  body: JSON.stringify({ op: "quote", note: "All items available; prices confirmed by WhatsApp." }),
}));
check("Quote prepared → status QUOTE_PREPARED", quoteRes.ok === true && quoteRes.enquiry?.status === "QUOTE_PREPARED");

// customer sees updated status
const track2 = await j(await fetch(`${BASE}/api/demo/track?ref=${ref}&phone=${phone}`));
check("Customer tracking reflects QUOTE_PREPARED + timeline", track2.data?.enquiry?.status === "QUOTE_PREPARED" && (track2.data?.enquiry?.events?.length ?? 0) >= 3);

const staffQueue = await get("/staff/enquiries", { headers: { cookie: pharmCookie } });
check("Staff queue page renders for pharmacist", staffQueue.status === 200 && staffQueue.text?.includes(ref));

// unauthenticated staff area redirect
const noAuth = await get("/staff/enquiries");
check("Unauthenticated /staff redirects to login", [302, 307].includes(noAuth.status) && (noAuth.headers.get("location") ?? "").includes("/staff/login"));

// ── 8. Admin edits a product → storefront reflects it ──────────────────────
console.log("\nAdmin product edit:");
const adminLogin = await fetch(`${BASE}/api/demo/login`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ email: "admin@demo.mediview", password: "demo-admin-2026" }),
});
const adminCookie = cookieOf(adminLogin);
check("Admin login succeeds", adminLogin.status === 200);

const newName = `${target.name} (Updated by Admin)`;
const editRes = await j(await fetch(`${BASE}/api/demo/products/${otc.id}`, {
  method: "PATCH",
  headers: { "content-type": "application/json", cookie: adminCookie },
  body: JSON.stringify({ name: newName }),
}));
check("Admin edits product", editRes.ok === true);
const pPage2 = await get(`/p/${otc.slug}`);
check("Storefront reflects admin edit immediately", pPage2.text?.includes("Updated by Admin"));
check("Product URL (slug) unchanged after rename — SEO stability", pPage2.status === 200);

// sales cannot access admin API
const salesEdit = await fetch(`${BASE}/api/demo/products/${otc.id}`, {
  method: "PATCH",
  headers: { "content-type": "application/json", cookie: salesCookie },
  body: JSON.stringify({ name: "Hacked" }),
});
check("SALES blocked from admin product edit (403)", salesEdit.status === 403);

const adminProducts = await get("/admin/products", { headers: { cookie: adminCookie } });
check("Admin products page renders", adminProducts.status === 200 && adminProducts.text?.includes("Products"));
const salesToAdmin = await get("/admin", { headers: { cookie: salesCookie } });
check("SALES redirected away from /admin", [302, 307].includes(salesToAdmin.status));

// restore name
await fetch(`${BASE}/api/demo/products/${otc.id}`, {
  method: "PATCH",
  headers: { "content-type": "application/json", cookie: adminCookie },
  body: JSON.stringify({ name: target.name }),
});

// ── Summary ─────────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(60)}`);
console.log(`RESULT: ${pass} passed, ${fail} failed`);
if (failures.length) {
  console.log("\nFailures:");
  failures.forEach((f) => console.log(`  - ${f}`));
}
console.log(`${"═".repeat(60)}\n`);
process.exit(fail === 0 ? 0 : 1);
