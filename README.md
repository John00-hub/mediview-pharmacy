# Mediview Pharmacy — Modernized Storefront (Demonstration Build)

**Client:** Mediview Pharmacy, Plot 969 Aminu Crescent, Wuse 2, Abuja · mediviewpharmacy.com
**Built by:** Midex Edits · per the *Master Development Directive* and the *Digital Modernization Intelligence Report*
**Stack:** Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Zod · Supabase-ready (schema shipped in `supabase/`)

A complete, functional, production-structured demonstration of the pharmacy's new digital
storefront: public catalogue with **price-on-enquiry** workflow (no fabricated prices),
enquiry basket → reference-numbered enquiry → staff dashboard → customer tracking,
prescription-information experience with pharmacist verification gates, full admin
(product/category/content management, role separation), SEO surface, and the production
PostgreSQL schema + RLS policies ready for Supabase cutover.

> ⚠️ **This is a demonstration.** It does not transmit anything to the real pharmacy,
> contains no real patient data, and its demo credentials/enquiries are synthetic.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Production-style run (what the acceptance test targets):

```bash
npm run build
npm start            # or: npx next start -H 0.0.0.0 -p 3000
npm run test:accept  # 64-check end-to-end acceptance suite (§21 of the directive)
```

Environment: copy `.env.example` → `.env.local`. The app runs fully in **demo mode**
(`DEMO_MODE` unset/`true`) with the file-backed demo adapter — no Supabase project needed.
Set `DEMO_MODE=false` only for a real deployment with credentials + implemented adapter.

### Demo staff accounts (click-to-fill on `/staff/login`, `/admin/login`)

| Role | Email | Password | Can do |
|---|---|---|---|
| ADMIN | `admin@demo.mediview` | `demo-admin-2026` | Everything |
| PHARMACIST | `pharmacist@demo.mediview` | `demo-pharmacist-2026` | Enquiries + **prescription verification** (cannot manage products) |
| SALES | `sales@demo.mediview` | `demo-sales-2026` | Enquiries; **blocked server-side** from verifying POM enquiries or advancing them past `AWAITING_PHARMACIST` |

---

## What to show the owner (guided walkthrough)

1. **Homepage** — announcement bar, hero search, verified NAP, category discovery, featured products, how-ordering-works, prescription info, trust section (verified facts only).
2. **Search** — type `panadl` (typo) → suggestions still find Panadol; keyboard navigation; proper `/search?q=` URLs.
3. **Catalogue** — `/shop`, category pages (`/c/pain-relief`), filters (brand/type), sorting, pagination, SSR HTML (view-source shows real product markup).
4. **Product page** — “Price on enquiry”, Rx badge & pharmacist-review gate for POM items, WhatsApp deep link with product context, no fake stock counters.
5. **Enquiry flow** — add 2 products (one prescription-only) to the enquiry basket → adjust quantities/notes → complete the form → receive reference `MVP-YYYY-NNNN` → confirmation screen.
6. **Customer tracking** — `/track` with reference + phone. Wrong phone → honest failure (no data leak).
7. **Staff dashboard** — log in as **sales** and try to verify the POM enquiry → blocked. Log in as **pharmacist** → verify → prepare quote → status advances; the customer's tracking timeline updates; every action is recorded in the audit trail.
8. **Admin** — edit a product's name → the storefront page reflects it instantly at the **same URL** (slugs are stable — SEO preservation by design). Add/archive products, reorder categories, edit the announcement bar, opening hours (with an honest “pending client confirmation” toggle), about copy, featured products, footer note.
9. **Prescriptions** — `/prescriptions` explains the workflow; uploads in demo accept **synthetic files only**; production architecture (private bucket, signed URLs, pharmacist-only reads, retention) is documented in `supabase/README.md`.
10. **Legacy URL redirects** — `/25-skincare` → `/c/skin-care`, etc. (map from the 2018 PrestaShop structure; report §6).

---

## Architecture

```
src/
  lib/types.ts            # domain model (Product, Enquiry, RxClass, statuses…)
  lib/validation.ts       # Zod schemas — the single source of input truth
  lib/auth-demo.ts        # signed-cookie staff sessions (HMAC); replaced by Supabase Auth in production
  lib/seo.ts              # metadata builders + JSON-LD (Pharmacy, Product w/o offers, Breadcrumb, FAQ)
  lib/data/ports.ts       # DataPort interface — the app's ONLY data contract
  lib/data/demo-adapter.ts    # file-backed demo implementation (.data/, gitignored)
  lib/data/supabase-adapter.ts# production integration point + implementation checklist
  lib/data/seed-*.ts      # ~150 products & 15 categories derived from the client's PUBLIC listings
  app/                    # routes: storefront, /staff, /admin, /api (suggest + demo harness)
  middleware.ts           # edge cookie-presence gate (full verification stays server-side)
supabase/
  schema.sql              # complete production DDL: enums, tables, search & tracking RPCs,
                          # RLS policies, append-only audit log, pharmacist-gate trigger
  migrations/0001_init.sql
  README.md               # cutover steps, storage bucket policies, security invariants
scripts/acceptance-test.mjs   # the 64-check §21 acceptance suite
```

**Design system** (tokens in `src/app/globals.css`): deep botanical green `#1E5B3F`
(refined from the live site's `#305f3a` for AA contrast), warm paper `#FAF8F4`, charcoal
ink, restrained radii/shadows, Montserrat display + Source Sans body, functional status
colours only (Rx red, enquiry amber, OK green). No decorative gradients, glassmorphism,
fake stats, invented testimonials, or placeholder links — per directive §11.

**Pricing integrity:** every product is `priceStatus: ENQUIRY_ONLY`. There is no code path
that renders a numeric price publicly, no `offers` in Product JSON-LD, and no ₦0.00/₦1.00
anywhere. The acceptance suite asserts this.

**Safety invariants (enforced server-side, twice):**
- Controlled/prohibited-online items are absent from public catalogue queries *and* excluded by the `products_public` view in the production schema.
- POM enquiries auto-route to `AWAITING_PHARMACIST`; only PHARMACIST/ADMIN can record verification; sales cannot advance unverified POM enquiries (mirrored by the `enquiries_gate` trigger in SQL).
- Tracking requires reference + last-10-digit phone match; rate-limited.
- Login, submissions and tracking are rate-limited in demo; production uses edge WAF (documented).

---

## SEO surface

- SSR catalogue/product HTML; unique `metadata` per route; canonicals + OpenGraph; `sitemap.xml`; `robots.ts` (**Disallow: /** while `DEMO_MODE=true` — staging noindex safety, flip with env); `X-Robots-Tag: noindex` in demo.
- Structured data: `Organization`+`Pharmacy`, `Product` (no offers — honest), `BreadcrumbList`, `FAQPage`, `ItemList`.
- Legacy PrestaShop redirects via `next.config.ts` (`/25-skincare` → `/c/skin-care`, `/content/4-about-us` → `/about`, numeric `*.html` → `/p/[slug]` pattern) — targeted, not blanket-to-homepage.
- Product slugs are immutable on rename; `product_slug_history` table exists for the rare deliberate change.

## Known limitations

See **`PRODUCTION_READINESS.md`** (client confirmations + remaining engineering) and
**`TESTING_REPORT.md`** (what was verified and how). Headlines: Supabase adapter is a
documented integration point, not yet implemented (no credentials); prescription upload
accepts synthetic demo files only; images are designed placeholders; demo sessions use
signed cookies rather than Supabase Auth; legal pages are NDPA-aware drafts requiring
Nigerian counsel review.

---

*Demo data contains no real patient information. Do not point mediviewpharmacy.com at this build; deploy to a staging domain with `DEMO_MODE=true` (noindex) for client review.*
