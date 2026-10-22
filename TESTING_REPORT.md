# TESTING REPORT — Mediview Pharmacy Demonstration Build

**Date:** 2026-10-21 · **Environment:** Next.js 15.5.28 production build (`next start`), Node 20, Linux sandbox
**Verdict: PASS** — the directive's §21 acceptance journey is verified end-to-end, automated, repeatable.

---

## 1. Static verification

| Check | Command | Result |
|---|---|---|
| TypeScript strict compile | `npx tsc --noEmit` | ✅ 0 errors |
| ESLint (next/core-web-vitals + next/typescript) | `npx next lint` | ✅ 0 errors, 0 warnings |
| Production build | `npx next build` | ✅ compiles; all 40+ routes generated |

## 2. End-to-end acceptance suite (the primary success definition)

`npm run test:accept` → `scripts/acceptance-test.mjs`, run against the production server.
Full console output archived in **`TESTING_REPORT_RUN.log`**.

**Result: 64 passed, 0 failed.** Mapping to directive §21's required journey:

| §21 requirement | How verified | Result |
|---|---|---|
| Visitor searches for a product | `GET /api/suggest?q=panadol`, `/search?q=vitamin+c` render | ✅ |
| Typo tolerance | `panadl` → Panadol suggestions (Levenshtein, token-level) | ✅ |
| Generic-name matching | `paracetamol` → matches without inventing medical synonyms | ✅ |
| Opens product page | `GET /p/{slug}` 200, name rendered, breadcrumbs present | ✅ |
| Adds 2 products, adjusts quantities | Enquiry submitted with 2 lines (qty 2 + qty 1, per-line note, `hasPrescription`) — same `submitEnquiryAction` the basket UI invokes | ✅ |
| Completes enquiry form → reference | 201 + `MVP-YYYY-NNNN` reference returned | ✅ |
| Invalid input rejected | Bad payload → 400 with field errors (Zod) | ✅ |
| Enquiry appears in staff dashboard | Pharmacist session: `/staff/enquiries` 200 and contains the ref code | ✅ |
| Staff updates status | Pharmacist records verification → prepares quote → status `QUOTE_PREPARED` | ✅ |
| Customer tracking reflects it | `GET /api/demo/track?ref&phone` → `QUOTE_PREPARED` + ≥3 timeline events | ✅ |
| Wrong phone can't track | Anti-enumeration check → honest failure | ✅ |
| Admin edits product → storefront reflects | Admin PATCH renames product; `GET /p/{slug}` shows new name at the **unchanged URL** | ✅ |
| POM pharmacist gate | POM line auto-routes enquiry to `AWAITING_PHARMACIST`; **sales verification attempt → 403** | ✅ |
| Role separation | Sales login ok, sales admin-edit → 403, sales `GET /admin` → redirect | ✅ |
| Auth boundaries | Unauthenticated `/staff` → redirect to `/staff/login?next=` | ✅ |
| No real order/patient data leaves demo | All writes go to the gitignored `.data/` demo store; no external transmission anywhere in codebase (no fetch to mediviewpharmacy.com, no email/SMS senders) | ✅ by construction |

## 3. Pricing-integrity assertions (owner's explicit requirement)

- ✅ No `₦0.00` / `₦1.00` / any `₦<number>` on homepage or product pages (asserted in suite).
- ✅ “Price on enquiry” present on homepage + PDP; Product JSON-LD contains **no `offers`**.
- ✅ No discount badges, no stock counters (codebase-wide: `stockStatus` is never rendered as a number).

## 4. SEO / platform surface

- ✅ `robots.txt` — demo: `Disallow: /` + staging noindex (`X-Robots-Tag: noindex` header asserted).
- ✅ `sitemap.xml` includes product URLs.
- ✅ Legacy redirects: `/25-skincare` → `/c/skin-care`; `/content/4-about-us` → `/about` (targeted map, not blanket).
- ✅ Unknown path → custom 404 with search recovery.
- ✅ Security headers asserted: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, CSP present.
- ✅ Controlled items excluded: `alprazolam` query returns zero catalogue results.

## 5. What was NOT tested here (honest scope)

| Item | Status |
|---|---|
| Real-device visual QA at 320–1440px | Not executed (no browser in sandbox). Layout is mobile-first Tailwind with tested breakpoints in markup; **manual pass recommended before client demo** — see checklist below. |
| Lighthouse 90+ scores | Targets set (report §12); not measured in sandbox. Measure on Vercel preview deployment. |
| Real Supabase backend | Adapter is a documented integration point (`supabase/README.md`); schema/RLS authored but not executed against a live project (no credentials — by directive design). |
| WhatsApp delivery | Deep links (`wa.me/2347048781219?...`) verified as correct URLs; actual message delivery is manual by staff — no API integration in demo (production options in report §9). |
| Prescription file upload | UI + validation paths exist; demo accepts synthetic files only; private-bucket signed-URL flow specified, not wired. |
| Load/rate-limit under real traffic | Demo in-memory rate limiter verified functionally; production needs edge WAF (documented). |

## 6. Manual QA checklist before the client demo (10 minutes)

1. Open the preview at 375px (iPhone) and 1440px: confirm no horizontal scroll on `/`, `/shop`, a PDP, `/enquiry`, `/track`.
2. Click through: search suggestion → PDP → add to enquiry (×2) → basket qty change → submit → confirmation → track.
3. Staff: login as sales (attempt POM verify → blocked), then pharmacist (verify → quote), watch tracking update.
4. Admin: rename a product → refresh its storefront page.
5. Reduced motion: OS setting on → confirm no shimmer/animation.

## 7. Regression policy

Every fix must keep `tsc`, `lint`, `build`, and `test:accept` green. The suite is
deterministic and idempotent (it restores the renamed product at the end); run it in CI
against a preview deployment before any client-facing URL is shared.
