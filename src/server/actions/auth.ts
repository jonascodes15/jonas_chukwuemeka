"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { optionalEnv } from "../env";
import { ipHash } from "../privacy";
import { rateLimit } from "../rate-limit";
import { createSessionToken, IGNORE_COOKIE, SESSION_COOKIE, SESSION_DAYS } from "../session";

/** `email` is sent back so the form can keep it after a failed attempt. */
export type LoginState = { error?: string; email?: string };

// Compared against when the email is wrong, so a wrong email takes as long as a wrong password.
let dummyHash: string | null = null;
const getDummyHash = async () => (dummyHash ??= await bcrypt.hash("not-the-admin-password", 12));

const digest = (s: string) => createHash("sha256").update(s).digest();

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const adminEmail = optionalEnv("ADMIN_EMAIL")?.toLowerCase();
  const adminHash = optionalEnv("ADMIN_PASSWORD_HASH");
  if (!adminEmail || !adminHash || !optionalEnv("SESSION_SECRET")) {
    return {
      error: "Admin login isn't set up yet. Add ADMIN_EMAIL, ADMIN_PASSWORD_HASH and SESSION_SECRET.",
    };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!optionalEnv("IP_HASH_SALT")) {
    return { error: "IP_HASH_SALT isn't set on this server. Add it, then restart or redeploy.", email };
  }
  const h = await headers();
  try {
    const limit = await rateLimit(`login:${ipHash(h)}`, 5, 15 * 60);
    if (!limit.ok) return { error: "Too many attempts. Wait 15 minutes and try again.", email };
  } catch (err) {
    // The full error is in the server logs (terminal locally, Vercel > Logs in production).
    console.error("[login] rate limit query failed", err);
    // Drizzle wraps the driver's error; the useful message is on `cause`.
    const root = err instanceof Error && err.cause instanceof Error ? err.cause : err;
    const detail = root instanceof Error ? root.message.slice(0, 160) : "unknown error";
    return {
      error: `Can't reach the database (${detail}). Check DATABASE_URL, then restart or redeploy.`,
      email,
    };
  }

  const password = String(formData.get("password") ?? "");
  const emailOk = timingSafeEqual(digest(email), digest(adminEmail));
  const passwordOk = await bcrypt.compare(password, emailOk ? adminHash : await getDummyHash());
  if (!emailOk || !passwordOk) return { error: "That email and password don't match.", email };

  const jar = await cookies();
  const secure = process.env.NODE_ENV === "production";
  jar.set(SESSION_COOKIE, await createSessionToken(), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
  jar.set(IGNORE_COOKIE, "1", {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });

  const next = String(formData.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logout() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}
