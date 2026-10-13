import "server-only";

/**
 * Server-side configuration. Values are read when used, not at import, so the site still
 * builds and renders while a variable is missing; only the feature that needs it fails.
 */

export class ConfigError extends Error {
  constructor(public variable: string) {
    super(`Missing environment variable: ${variable}`);
    this.name = "ConfigError";
  }
}

export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new ConfigError(name);
  return value;
}

export function optionalEnv(name: string): string | undefined {
  return process.env[name]?.trim() || undefined;
}

/** For the admin settings page: which integrations are configured. Never exposes values. */
export function configStatus() {
  const has = (name: string) => Boolean(optionalEnv(name));
  return {
    database: has("DATABASE_URL"),
    resend: has("RESEND_API_KEY") && has("RESEND_FROM_EMAIL"),
    contactTo: has("CONTACT_TO_EMAIL"),
    admin: has("ADMIN_EMAIL") && has("ADMIN_PASSWORD_HASH") && has("SESSION_SECRET"),
    ipSalt: has("IP_HASH_SALT"),
    calWebhook: has("CAL_WEBHOOK_SECRET"),
  };
}
