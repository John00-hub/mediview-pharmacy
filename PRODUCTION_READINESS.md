# PRODUCTION READINESS CHECKLIST — Mediview Pharmacy 2.0

Everything between this demonstration and a live launch, split into
**client decisions** (blocking — cannot be guessed) and **engineering work**
(estimated, mostly mechanical because the architecture already accounts for it).

---

## A. Client confirmations required (BLOCKING — do not launch without these)

| # | Item | Where it surfaces now | Owner |
|---|---|---|---|
| A1 | **Opening hours** — exact weekly schedule | Honest “pending confirmation” copy; toggle in Admin → Website content (`openingHoursConfirmed`) | Pharmacy owner |
| A2 | **Product classifications** — POM/OTC/waiver for every listed item | Seed classifications derived from public listings; final authority is the Superintendent Pharmacist (directive §5) | Responsible pharmacist |
| A3 | **Controlled-item policy confirmation** — exclusion list | Already excluded from public flows; needs written sign-off | Responsible pharmacist |
| A4 | **Delivery scope & fees** (Wuse 2 radius? dispatch partners?) | `/delivery-pickup` describes modes without inventing fees/radii | Owner |
| A5 | **Pricing model decision** — keep price-on-enquiry, or publish prices later | System supports `price_status='PUBLISHED'` in schema but no UI path publishes numbers | Owner |
| A6 | **Legal review of Privacy Policy & Terms** (NDPA 2023 compliance, retention periods, DPO contact) | Drafts at `/privacy`, `/terms` carry visible “draft — requires legal review” banners | Nigerian counsel |
| A7 | **Brand assets** — logo files, brand-colour confirmation | Provisional vector logo + palette refined from live site's `#305f3a` | Owner/marketing |
| A8 | **Product photography** — real pack-shots (or license plan) | Designed placeholder tiles | Owner |
| A9 | **Verified NAP cleanup** — directories still show old Lingu Crescent address/phone (report §3.4) | App uses current verified NAP only | Owner + agency |
| A10 | **WhatsApp Business** — dedicated number & who monitors it | Deep links use verified `0704 878 1219` | Owner |
| A11 | **60,000-visitor claim** — analytics access to verify before any migration SEO baseline | Treated as unverified client-provided figure | Owner (grant GA/GSC access) |

## B. Engineering work to launch (estimated effort)

| # | Task | Effort | Notes |
|---|---|---|---|
| B1 | Provision Supabase (EU region) + run `supabase/schema.sql` | 0.5 day | Schema, RLS, triggers, RPCs already authored |
| B2 | Implement `createSupabaseAdapter()` against `DataPort` | 3–5 days | Checklist in `supabase-adapter.ts`; demo adapter is the behavioural reference |
| B3 | Supabase Auth: staff email+MFA, customer phone OTP; JWT role claim hook | 2–3 days | Replaces `auth-demo.ts` cookie sessions wholesale |
| B4 | Prescription upload: signed upload URLs, private bucket, pharmacist-only signed reads, retention job | 2–3 days | Policies specified in `supabase/README.md` |
| B5 | Product images: bucket + admin upload UI + next/image remote patterns | 1–2 days | Product form already reserves the section |
| B6 | Seed import: transform `seed-products.ts` → SQL/CSV load after A2 sign-off | 0.5 day | |
| B7 | Notifications: WhatsApp Business API (or click-to-send fallback initially), optional email | 2–4 days | Templates already exist in staff UI |
| B8 | Edge rate limiting (Vercel WAF / Upstash) replacing demo in-memory limiter | 0.5 day | |
| B9 | Monitoring: Sentry + Vercel Analytics + uptime check on `/` and `/api/suggest` | 0.5 day | |
| B10 | Legacy URL redirect audit against GSC export (extend `next.config.ts` map + `redirect_rules` table) | 1 day | Requires A11 access |
| B11 | Backup/DR: Supabase PITR enabled, storage bucket versioning | 0.25 day | |
| B12 | Pen-test / security review pass (RLS bypass attempts, action fuzzing) | 1–2 days | External recommended |

**Realistic path: ~2.5–4 engineering weeks after client confirmations A1–A8 land.**

## C. Deployment checklist

- [ ] Staging first: Vercel preview with `DEMO_MODE=true` (robots disallow + `X-Robots-Tag: noindex`) — share with client; **never point mediviewpharmacy.com here**
- [ ] Client signs off A1–A11
- [ ] Production deploy: `DEMO_MODE=false`, real env vars (`.env.example` lists all), service-role key server-side only
- [ ] Verify in production: acceptance suite passes against prod URL (with a test enquiry cleaned up after)
- [ ] Submit sitemap to Search Console; monitor crawl of legacy redirects
- [ ] Old site: keep read-only snapshot until GSC shows new URLs indexed (do not delete hosting immediately)
- [ ] Run the 10-minute manual QA checklist (TESTING_REPORT.md §6) on real devices

## D. Explicit non-goals of this build (per directive)

- No payments, no live inventory sync, no real order transmission.
- No medical advice content; no invented strengths, indications, manufacturers, prices, reviews, or certifications.
- No modification of the live PrestaShop site; no guaranteed SEO preservation claims — only preservation-by-design (stable slugs, targeted redirects, SSR, structured data).
