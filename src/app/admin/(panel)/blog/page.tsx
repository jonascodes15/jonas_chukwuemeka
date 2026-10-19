import { Copy, ExternalLink, Images, PenLine, Plus, Search, Star, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import {
  EmptyState,
  FilterTabs,
  formatDateTime,
  PageHeader,
  PageSkeleton,
  Panel,
  SetupNotice,
  StatCard,
  StatusPill,
  timeAgo,
} from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { deletePost, duplicatePost } from "@/server/actions/blog";
import { listPosts, postCounts, postViews, type PostFilter } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";

export const metadata: Metadata = { title: "Blog" };

const FILTERS: PostFilter[] = ["all", "published", "scheduled", "draft"];
const DAYS = 30;

export default function BlogAdminPage({ searchParams }: PageProps<"/admin/blog">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then(({ status, q }) => (
        <Posts
          filter={FILTERS.find((f) => f === status) ?? "all"}
          q={typeof q === "string" ? q.trim().slice(0, 100) : ""}
        />
      ))}
    </Suspense>
  );
}

async function Posts({ filter, q }: { filter: PostFilter; q: string }) {
  await requireAdmin();
  const db = getDb();
  const header = (
    <PageHeader
      title="Blog"
      description="Write, schedule and publish posts. Published posts appear on /blog, the homepage and the RSS feed."
      actions={
        <>
          <Link href="/admin/blog/media" className={buttonClasses({ variant: "secondary", size: "sm" })}>
            <Images aria-hidden className="size-4" />
            Media library
          </Link>
          <Link href="/admin/blog/new" className={buttonClasses({ size: "sm" })}>
            <Plus aria-hidden className="size-4" />
            New post
          </Link>
        </>
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

  let data;
  try {
    data = await Promise.all([listPosts(db, filter, q), postCounts(db), postViews(db, DAYS)]);
  } catch (err) {
    console.error("[blog] admin list failed", err);
    return (
      <>
        {header}
        <Panel>
          <EmptyState
            icon={PenLine}
            title="The blog tables aren't set up yet"
            body={
              <>
                Run <code className="font-mono text-fg">npm run db:migrate</code> once, then reload this page.
              </>
            }
          />
        </Panel>
      </>
    );
  }
  const [rows, counts, views] = data;
  const recentViews = [...views.values()].reduce((n, v) => n + v.recent, 0);
  const top = [...views].sort((a, b) => b[1].recent - a[1].recent)[0];

  return (
    <>
      {header}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Published" value={counts.published} href="/admin/blog?status=published" />
        <StatCard label="Scheduled" value={counts.scheduled} href="/admin/blog?status=scheduled" />
        <StatCard label="Drafts" value={counts.draft} href="/admin/blog?status=draft" />
        <StatCard
          label={`Post views, ${DAYS} days`}
          value={recentViews}
          hint={top && top[1].recent > 0 ? <span className="truncate">Top: /blog/{top[0]}</span> : undefined}
          href="/admin/analytics"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <FilterTabs
          active={filter}
          items={[
            { label: "All", value: "all", count: counts.all },
            { label: "Published", value: "published", count: counts.published },
            { label: "Scheduled", value: "scheduled", count: counts.scheduled },
            { label: "Drafts", value: "draft", count: counts.draft },
          ].map((i) => ({
            ...i,
            href: `/admin/blog?status=${i.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`,
          }))}
        />
        <form action="/admin/blog" className="relative mb-5 sm:w-72">
          <input type="hidden" name="status" value={filter} />
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search posts"
            aria-label="Search posts"
            className={cn(inputClasses, "h-9 py-0 pl-10 text-sm")}
          />
        </form>
      </div>

      <Panel bodyClassName="p-0">
        {rows.length === 0 ? (
          <EmptyState
            icon={PenLine}
            title={q ? "No posts match that search" : counts.all ? "Nothing here" : "No posts yet"}
            body={
              counts.all ? undefined : (
                <>
                  <Link href="/admin/blog/new" className="font-medium text-accent-ink hover:underline">
                    Write your first post
                  </Link>
                  . It stays a draft until you publish it.
                </>
              )
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((p) => {
              const scheduled = p.status === "published" && p.publishedAt && p.publishedAt > new Date();
              const status = p.status === "draft" ? "draft" : scheduled ? "scheduled" : "published";
              const v = views.get(p.slug);
              return (
                <li key={p.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
                  <Link href={`/admin/blog/${p.id}`} className="group flex min-w-0 flex-1 items-center gap-4">
                    <span className="relative hidden h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-2 sm:block">
                      {p.coverImage?.startsWith("/media/") ? (
                        <Image src={p.coverImage} alt="" fill sizes="96px" className="object-cover" />
                      ) : (
                        <span className="bg-grid absolute inset-0 opacity-60" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <StatusPill status={status} />
                        {p.featured && <Star aria-label="Featured" className="size-3.5 text-accent-ink" />}
                        <span className="truncate text-sm font-medium text-fg group-hover:text-accent-ink">
                          {p.title}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-xs text-muted">
                        /blog/{p.slug}
                        {p.tags.length > 0 && <> · {p.tags.join(", ")}</>} ·{" "}
                        {p.wordCount.toLocaleString("en-US")} words
                      </span>
                    </span>
                  </Link>

                  <span className="shrink-0 text-xs text-muted sm:w-40 sm:text-right">
                    {p.status === "draft" ? (
                      <>Edited {timeAgo(p.updatedAt)}</>
                    ) : (
                      <>
                        {scheduled ? "Goes live " : ""}
                        {formatDateTime(p.publishedAt)}
                      </>
                    )}
                    {v && (
                      <span className="block font-mono">
                        {v.recent.toLocaleString("en-US")} views / {DAYS}d · {v.total.toLocaleString("en-US")}{" "}
                        total
                      </span>
                    )}
                  </span>

                  <span className="flex shrink-0 items-center gap-1">
                    <IconLink href={`/admin/blog/${p.id}`} label="Edit">
                      <PenLine className="size-4" />
                    </IconLink>
                    {status === "published" ? (
                      <IconLink href={`/blog/${p.slug}`} label="View live" external>
                        <ExternalLink className="size-4" />
                      </IconLink>
                    ) : (
                      <IconLink href={`/admin/preview/${p.id}`} label="Preview" external>
                        <ExternalLink className="size-4" />
                      </IconLink>
                    )}
                    <form action={duplicatePost}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" aria-label="Duplicate" title="Duplicate" className={iconButton}>
                        <Copy className="size-4" />
                      </button>
                    </form>
                    <form action={deletePost}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmSubmit
                        message={`Delete "${p.title}"? This can't be undone.`}
                        aria-label="Delete"
                        title="Delete"
                        className={cn(iconButton, "hover:text-red-600 dark:hover:text-red-400")}
                      >
                        <Trash2 className="size-4" />
                      </ConfirmSubmit>
                    </form>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </>
  );
}

const iconButton =
  "grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-fg";

function IconLink({
  href,
  label,
  external,
  children,
}: {
  href: string;
  label: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className={iconButton}
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      {children}
    </Link>
  );
}
