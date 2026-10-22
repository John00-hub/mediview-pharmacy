import "server-only";
import type { DataPort } from "./ports";
import { demoAdapter } from "./demo-adapter";
import { createSupabaseAdapter } from "./supabase-adapter";

/**
 * Adapter selection — the ONLY place the app decides where data comes from.
 * UI/server-action code imports `db()` and never knows the backend kind.
 */
let adapter: DataPort | null = null;

export function db(): DataPort {
  if (adapter) return adapter;
  const hasSupabase =
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) &&
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  if (hasSupabase) {
    adapter = createSupabaseAdapter();
  } else {
    adapter = demoAdapter;
  }
  return adapter;
}

export const IS_DEMO = process.env.DEMO_MODE !== "false";
