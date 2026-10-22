import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { StaffRole, StaffUser } from "@/lib/types";

/**
 * DEMO-ONLY session mechanism: an HMAC-signed, HttpOnly cookie.
 * Production replaces this entirely with Supabase Auth JWTs + RLS
 * (see src/lib/data/supabase-adapter.ts and supabase/schema.sql).
 * This is deliberately isolated so removing it touches two files only.
 */

const COOKIE = "mvp_staff_session";
const MAX_AGE = 60 * 60 * 8; // 8h demo sessions

function secret(): string {
  return process.env.AUTH_COOKIE_SECRET || "dev-only-insecure-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function encodeSession(user: StaffUser): string {
  const payload = Buffer.from(JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function decodeSession(token: string | undefined): StaffUser | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = Buffer.from(sign(payload));
  const provided = Buffer.from(sig);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as StaffUser;
    if (!data.id || !data.role) return null;
    return data;
  } catch {
    return null;
  }
}

export async function getStaffSession(): Promise<StaffUser | null> {
  const store = await cookies();
  return decodeSession(store.get(COOKIE)?.value);
}

export async function requireStaff(allowedRoles?: StaffRole[]): Promise<StaffUser> {
  const user = await getStaffSession();
  if (!user) throw new AuthError("not-authenticated");
  if (allowedRoles && !allowedRoles.includes(user.role)) throw new AuthError("forbidden");
  return user;
}

export class AuthError extends Error {
  constructor(public code: "not-authenticated" | "forbidden") {
    super(code);
  }
}

export async function setSessionCookie(user: StaffUser) {
  const store = await cookies();
  store.set(COOKIE, encodeSession(user), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE);
}

export const SESSION_COOKIE_NAME = COOKIE;
