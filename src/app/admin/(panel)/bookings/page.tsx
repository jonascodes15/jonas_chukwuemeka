import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import {
  BarList,
  EmptyState,
  FilterTabs,
  formatDateTime,
  PageHeader,
  PageSkeleton,
  Panel,
  SetupNotice,
  StatusPill,
} from "@/components/admin/ui";
import { bookCallClicks, listBookings } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { configStatus } from "@/server/env";

export const metadata: Metadata = { title: "Bookings" };

const DAYS = 30;

/** Where each "Book a call" button lives, for the clicks breakdown. */
const PLACES: Record<string, string> = {
  "nav:book-call": "Header",
  "contact:book-call": "Contact section",
  "case-study:book-call": "Case study pages",
  "chat:book-call": "FAQ chat",
};

export default function BookingsPage({ searchParams }: PageProps<"/admin/bookings">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then(({ filter }) => (
        <Bookings upcoming={filter !== "all"} />
      ))}
    </Suspense>
  );
}

async function Bookings({ upcoming }: { upcoming: boolean }) {
  await requireAdmin();
  const db = getDb();
  const header = (
    <PageHeader
      title="Bookings"
      description="Calls booked through Cal.com, and how often people click Book a call."
      actions={
        <a
          href="https://app.cal.com/bookings/upcoming"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-pill border border-border-strong px-4 py-2 text-sm font-medium text-fg transition-colors hover:border-fg"
        >
          Open Cal.com
          <ArrowUpRight aria-hidden className="size-4" />
        </a>
      }
    />
  );
  if (!db) {
    return (
      <>
        {header}
        <SetupNotice />
      </>
    );
  }
  const [rows, clicks] = await Promise.all([listBookings(db, upcoming), bookCallClicks(db, DAYS)]);
  const totalClicks = clicks.reduce((sum, c) => sum + c.count, 0);
  const webhookReady = configStatus().calWebhook;

  return (
    <>
      {header}
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div>
          <FilterTabs
            active={upcoming ? "upcoming" : "all"}
            items={[
              { label: "Upcoming", value: "upcoming", href: "/admin/bookings" },
              { label: "All", value: "all", href: "/admin/bookings?filter=all" },
            ]}
          />
          <Panel bodyClassName="p-0">
            {rows.length === 0 ? (
              <EmptyState
                icon={CalendarDays}
                title={upcoming ? "No upcoming calls" : "No bookings yet"}
                body={
                  webhookReady ? (
                    "Calls booked on Cal.com appear here automatically."
                  ) : (
                    <>
                      Bookings appear here once the Cal.com webhook is set up. See{" "}
                      <code className="font-mono text-fg">CAL_WEBHOOK_SECRET</code> in{" "}
                      <code className="font-mono text-fg">.env.example</code>.
                    </>
                  )
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((b) => (
                  <li
                    key={b.id}
                    className="flex flex-col gap-1 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <span className="w-44 shrink-0 text-sm font-medium text-fg">
                      {formatDateTime(b.startTime)}
                    </span>
                    <span className="min-w-0 flex-1 text-sm text-fg">
                      {b.name ?? "Unknown"} <span className="text-muted">· {b.title}</span>
                    </span>
                    {b.email && (
                      <a href={`mailto:${b.email}`} className="text-sm text-accent-ink hover:underline">
                        {b.email}
                      </a>
                    )}
                    <StatusPill status={b.status} />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel title={`Book a call clicks, ${DAYS} days`}>
          <p className="mb-4 font-display text-3xl font-extrabold tracking-tight text-fg tabular-nums">
            {totalClicks.toLocaleString("en-US")}
          </p>
          <BarList rows={clicks} empty="No clicks yet." format={(label) => PLACES[label] ?? label} />
        </Panel>
      </div>
    </>
  );
}
