"use client";

import {
  BarChart3,
  CalendarDays,
  FileText,
  Inbox,
  LayoutDashboard,
  Mail,
  MessageCircleQuestion,
  PenLine,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/enquiries", label: "Enquiries", icon: Inbox, badge: "enquiries" },
  { href: "/admin/blog", label: "Blog", icon: PenLine },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
  { href: "/admin/chats", label: "Chat logs", icon: MessageCircleQuestion },
  { href: "/admin/bookings", label: "Bookings", icon: CalendarDays },
  { href: "/admin/cv", label: "CV", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
] as const;

/** Sidebar links on desktop, a scrolling row on mobile. `badges` holds server-rendered counts. */
type Badges = Partial<Record<"enquiries", ReactNode>>;

export function AdminNav({ badges }: { badges?: Badges }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  // On mobile the links scroll sideways: keep the current page in view.
  useEffect(() => {
    ref.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);
  return (
    <div ref={ref}>
      <AdminNavLinks pathname={pathname} badges={badges} />
    </div>
  );
}

/** The links themselves. Rendered without a pathname as the Suspense fallback, so nothing is highlighted. */
export function AdminNavLinks({ pathname, badges }: { pathname: string | null; badges?: Badges }) {
  return (
    <nav aria-label="Admin">
      <ul className="no-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map((item) => {
          const active =
            pathname !== null &&
            (item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <li key={item.href} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2/60 hover:text-fg",
                )}
              >
                <Icon aria-hidden className={cn("size-4", active && "text-accent-ink")} />
                {item.label}
                {"badge" in item && badges?.[item.badge]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
