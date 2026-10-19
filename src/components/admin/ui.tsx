import { ArrowDownRight, ArrowUpRight, Database, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Building blocks shared by the admin pages. */

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dayFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", day: "numeric", month: "short" });

export const formatDateTime = (d: Date | string | null) => (d ? dateFmt.format(new Date(d)) : "");
export const formatDay = (d: Date | string) => dayFmt.format(new Date(d));

export function timeAgo(d: Date | string) {
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.round(h / 24);
  return days < 30 ? `${days}d ago` : formatDay(d);
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-surface", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          {title && <h2 className="font-display text-base font-bold tracking-tight text-fg">{title}</h2>}
          {action}
        </div>
      )}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>
  );
}

export function StatCard({
  label,
  value,
  previous,
  hint,
  href,
}: {
  label: string;
  value: number;
  /** Previous-period value; shows a change badge when given. */
  previous?: number;
  hint?: ReactNode;
  href?: string;
}) {
  const change =
    previous === undefined
      ? null
      : previous === 0
        ? value > 0
          ? 100
          : 0
        : ((value - previous) / previous) * 100;
  const body = (
    <>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-extrabold tracking-tight text-fg tabular-nums">
        {value.toLocaleString("en-US")}
      </p>
      <div className="mt-2 flex min-h-5 items-center gap-2 text-xs text-muted">
        {change !== null && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-pill px-1.5 py-0.5 font-medium",
              change >= 0 ? "bg-accent-glow text-accent-ink" : "bg-surface-2 text-muted",
            )}
          >
            {change >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
            {Math.abs(Math.round(change))}%
          </span>
        )}
        {hint}
      </div>
    </>
  );
  const cls = "block rounded-2xl border border-border bg-surface p-5";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-border-strong")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Ranked list with proportional bars, for top pages, referrers, clicks and so on. */
export function BarList({
  rows,
  empty = "No data yet.",
  format = (k) => k,
}: {
  rows: { key: string; count: number }[];
  empty?: string;
  format?: (key: string) => ReactNode;
}) {
  if (rows.length === 0) return <p className="py-6 text-center text-sm text-muted">{empty}</p>;
  const max = Math.max(...rows.map((r) => r.count));
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li
          key={r.key}
          className="relative flex items-center justify-between gap-3 overflow-hidden rounded-lg px-3 py-2"
        >
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 rounded-lg bg-accent-glow"
            style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }}
          />
          <span className="relative truncate text-sm text-fg">{format(r.key)}</span>
          <span className="relative font-mono text-xs text-muted tabular-nums">
            {r.count.toLocaleString("en-US")}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-surface-2 text-muted">
        <Icon className="size-5" />
      </span>
      <p className="mt-4 font-display text-lg font-bold tracking-tight text-fg">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-muted">{body}</p>}
    </div>
  );
}

export function SetupNotice() {
  return (
    <Panel>
      <EmptyState
        icon={Database}
        title="Database not connected"
        body={
          <>
            Add <code className="font-mono text-fg">DATABASE_URL</code> to your environment variables, run{" "}
            <code className="font-mono text-fg">npm run db:migrate</code> once, then reload this page.
          </>
        }
      />
    </Panel>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    new: "bg-accent text-accent-contrast",
    confirmed: "bg-accent-glow text-accent-ink",
    booked: "bg-accent-glow text-accent-ink",
    pending: "bg-surface-2 text-fg",
    read: "bg-surface-2 text-muted",
    archived: "bg-surface-2 text-muted",
    unsubscribed: "bg-surface-2 text-muted",
    cancelled: "bg-surface-2 text-muted",
    published: "bg-accent-glow text-accent-ink",
    scheduled: "bg-surface-2 text-fg",
    draft: "bg-surface-2 text-muted",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-pill px-2 py-0.5 font-mono text-[0.65rem] tracking-wide uppercase",
        tone[status] ?? "bg-surface-2 text-muted",
      )}
    >
      {status}
    </span>
  );
}

/** Pill-style filter links, e.g. status or date range. */
export function FilterTabs({
  items,
  active,
}: {
  items: { label: string; href: string; value: string; count?: number }[];
  active: string;
}) {
  return (
    <nav className="no-scrollbar -mx-1 mb-5 flex gap-1.5 overflow-x-auto px-1">
      {items.map((i) => (
        <Link
          key={i.value}
          href={i.href}
          aria-current={i.value === active ? "page" : undefined}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-2 rounded-pill border px-3.5 text-sm transition-colors",
            i.value === active
              ? "border-fg bg-fg text-bg"
              : "border-border text-muted hover:border-border-strong hover:text-fg",
          )}
        >
          {i.label}
          {i.count !== undefined && <span className="font-mono text-xs opacity-70">{i.count}</span>}
        </Link>
      ))}
    </nav>
  );
}

export function PageSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="mb-8 h-10 w-56 rounded-xl bg-surface-2" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-surface" />
        ))}
      </div>
      <div className="mt-4 h-80 rounded-2xl bg-surface" />
    </div>
  );
}
