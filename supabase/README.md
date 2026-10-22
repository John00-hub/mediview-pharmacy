# Supabase production integration

This folder contains everything needed to move the demonstration from the
file-based demo adapter to a real Supabase/PostgreSQL backend **without
rewriting the application**.

## What's here

| File | Purpose |
|---|---|
| `schema.sql` | Complete DDL: enums, catalogue, enquiries, prescriptions, audit log, staff, content, redirect rules, indexes, search RPC, tracking RPC, RLS policies, and the pharmacist-gate trigger. |
| `migrations/0001_init.sql` | The same DDL packaged as the first migration for `supabase db push` / CI-based migrations. |
| `seed.sql` | Minimal structural seed (site_content row). The catalogue seed lives in `src/lib/data/seed-products.ts` and is exported to SQL by `npm run` scripts or inserted via the admin UI / a one-off script. |

## Wiring steps (when client credentials arrive)

1. **Create the project** in Supabase (EU region recommended for Abuja latency).
2. Run `schema.sql` in the SQL editor (or `supabase db push` with the migration).
3. **Storage buckets:**
   - `product-images` — public, admin-write.
   - `prescriptions` — **private**; server actions issue `createSignedUploadUrl()`;
     reads only via `createSignedUrl(path, { expiresIn: 300 })` after an
     `is_pharmacist()` check. Add a pg_cron job honoring `purge_after`.
4. **Auth:** enable Email (staff, MFA enforced) and Phone OTP (customers).
   Add a sign-in hook / Edge Function mirroring `staff_users.role` into the
   JWT custom claim used by `public_role()`.
5. **Env:** set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` (server-only), `DEMO_MODE=false`.
6. **Implement `createSupabaseAdapter()`** in `src/lib/data/supabase-adapter.ts`
   against the `DataPort` interface — the checklist is in that file. Row shapes
   already match `src/lib/types.ts`; the demo adapter is the reference
   implementation for expected behaviour (search ranking, ref codes, gates).
7. **Cutover:** revalidate all routes; verify RLS with the anon key from a
   browser session (anon must NOT be able to read any enquiry, prescription
   metadata, or another customer's data).

## Security invariants (do not regress)

- `products_public` view is the ONLY catalogue surface; `CONTROLLED_PROHIBITED_ONLINE` rows never leave the database.
- `enquiry_events` is append-only (no UPDATE/DELETE policies).
- Pharmacist gate enforced by trigger `enquiries_gate` **and** by server actions — two independent layers.
- Tracking requires `ref_code` + last-10-digit phone match via `track_enquiry()`; rate-limit at the edge (Vercel WAF or Upstash).
- Service-role key never imported by any client component (`server-only` guards already in place).
