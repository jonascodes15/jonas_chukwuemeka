import { createHash } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";

/**
 * Admin session token: a JWT signed with SESSION_SECRET, stored in an httpOnly cookie.
 * It carries a fingerprint of the current admin email and password hash, so changing
 * either one signs every existing session out.
 * Shared by proxy.ts and the server code, so it avoids the "server-only" import.
 */

export const SESSION_COOKIE = "jc_admin";
/** Set on login and kept after logout, so this browser's visits never count in analytics. */
export const IGNORE_COOKIE = "jc_ignore";
export const SESSION_DAYS = 7;

const secret = () => {
  const s = process.env.SESSION_SECRET?.trim();
  if (!s || s.length < 32) throw new Error("SESSION_SECRET must be set (32+ characters)");
  return new TextEncoder().encode(s);
};

/**
 * ADMIN_PASSWORD_HASH as a plain bcrypt hash. In .env.local each $ must be written as \$, and
 * people often paste that escaped form into Vercel too, where it stays literal. A bcrypt hash
 * never contains a backslash or quotes, so stripping them accepts both forms safely.
 */
export function adminPasswordHash(): string | undefined {
  const raw = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!raw) return undefined;
  return raw.replace(/^["']|["']$/g, "").replace(/\\\$/g, "$");
}

const fingerprint = () =>
  createHash("sha256")
    .update(`${process.env.ADMIN_EMAIL?.trim().toLowerCase()}|${adminPasswordHash()}`)
    .digest("base64url")
    .slice(0, 16);

export async function createSessionToken() {
  return new SignJWT({ fp: fingerprint() })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret());
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"], subject: "admin" });
    return payload.fp === fingerprint();
  } catch {
    return false;
  }
}
