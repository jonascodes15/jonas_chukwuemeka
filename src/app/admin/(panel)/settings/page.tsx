import { CheckCircle2, CircleDashed } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHeader, PageSkeleton, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import { saveSettings } from "@/server/actions/admin";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { configStatus } from "@/server/env";
import { getSettings } from "@/server/settings";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Settings />
    </Suspense>
  );
}

async function Settings() {
  await requireAdmin();
  const [settings, status] = [await getSettings(), configStatus()];
  const canSave = Boolean(getDb());

  const checks = [
    { ok: status.database, label: "Database", detail: "DATABASE_URL" },
    { ok: status.resend, label: "Email sending", detail: "RESEND_API_KEY and RESEND_FROM_EMAIL" },
    { ok: status.contactTo, label: "Enquiry inbox", detail: "CONTACT_TO_EMAIL" },
    { ok: status.ipSalt, label: "Analytics and rate limiting", detail: "IP_HASH_SALT" },
    { ok: status.admin, label: "Admin login", detail: "ADMIN_EMAIL, ADMIN_PASSWORD_HASH and SESSION_SECRET" },
    { ok: status.calWebhook, label: "Cal.com bookings log", detail: "CAL_WEBHOOK_SECRET" },
  ];

  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Availability">
          <form action={saveSettings} className="flex flex-col gap-5">
            <label className="flex cursor-pointer items-start justify-between gap-4">
              <span>
                <span className="block font-medium text-fg">Available for work</span>
                <span className="mt-0.5 block text-sm text-muted">
                  Shows the label above the headline on the homepage. Off hides it.
                </span>
              </span>
              <input
                type="checkbox"
                name="availableForWork"
                defaultChecked={settings.availableForWork}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="relative mt-0.5 h-6 w-11 shrink-0 rounded-pill bg-border-strong transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent-ink after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:bg-surface after:transition-transform peer-checked:after:translate-x-5"
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-fg">Badge text</span>
              <input
                name="availabilityLabel"
                defaultValue={settings.availabilityLabel}
                maxLength={60}
                className={inputClasses}
              />
            </label>
            <div>
              <Button type="submit" disabled={!canSave}>
                Save
              </Button>
              {!canSave && <p className="mt-2 text-xs text-muted">Connect the database to save settings.</p>}
            </div>
          </form>
        </Panel>

        <Panel title="Setup status">
          <ul className="space-y-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-3">
                {c.ok ? (
                  <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
                ) : (
                  <CircleDashed aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
                )}
                <span>
                  <span className={cn("block text-sm", c.ok ? "text-fg" : "text-muted")}>
                    {c.label}
                    <span className="sr-only">{c.ok ? ": set up" : ": not set up"}</span>
                  </span>
                  <span className="block font-mono text-[0.7rem] text-muted">{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-relaxed text-muted">
            Your visits are left out of analytics on any browser you&apos;ve signed in from, even after you
            log out.
          </p>
        </Panel>
      </div>
    </>
  );
}
