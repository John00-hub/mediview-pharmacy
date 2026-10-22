import "server-only";
import type { DataPort } from "./ports";

/**
 * SupabaseAdapter — production integration point.
 *
 * The schema this adapter maps onto lives in /supabase/schema.sql (tables,
 * indexes, RLS policies) and /supabase/migrations. Row shapes already match
 * the domain types in src/lib/types.ts, so implementing this adapter is a
 * mapping exercise, not a redesign.
 *
 * Implementation checklist when credentials become available:
 *  1. `createClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)`
 *     for public reads (RLS-filtered views: products_public, categories).
 *  2. Service-role client ONLY in server code (never bundled to the browser)
 *     for admin mutations; every mutation must still check the caller's JWT
 *     role claim (staff_users.role) server-side — RLS is the second layer.
 *  3. Enquiries: insert into `enquiries` + `enquiry_items`; events append-only
 *     via trigger or explicit insert; tracking lookup = select where
 *     ref_code = $1 AND phone_match($2) with an RPC rate-limited at the edge.
 *  4. Prescriptions: `storage.from('prescriptions').createSignedUploadUrl()`;
 *     files private; reads via short-lived signed URLs restricted to the
 *     PHARMACIST role by an RLS policy on the objects' owner column.
 *  5. Auth: Supabase Auth (phone OTP for customers, email+MFA for staff);
 *     replaces the demo cookie session in src/lib/auth-demo.ts entirely.
 *  6. Search: Postgres `pg_trgm` + `to_tsvector` columns already defined in
 *     schema.sql; swap scoreProduct() for an RPC `search_products(q)`.
 */
export function createSupabaseAdapter(): DataPort {
  throw new Error(
    "Supabase adapter not yet wired: NEXT_PUBLIC_SUPABASE_URL is set but the adapter implementation is pending. Remove Supabase env vars to run the demo adapter."
  );
}
