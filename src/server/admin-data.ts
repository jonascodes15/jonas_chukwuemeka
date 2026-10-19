import "server-only";
import { and, count, desc, eq, gte, sql, type SQL } from "drizzle-orm";
import type { Db } from "./db";
import { schema } from "./db";
import { lagosDay } from "./privacy";

/** Read queries for the admin dashboard. Days are counted in Lagos time. */

const { enquiries, subscribers, newsletterIssues, chatLogs, bookings, posts } = schema;

const since = (days: number) => sql`now() - make_interval(days => ${days})`;

export type DayPoint = {
  day: string;
  views: number;
  visitors: number;
  clicks: number;
};

/** One point per day for the last `days` days, including days with no traffic. */
export async function trafficSeries(db: Db, days: number): Promise<DayPoint[]> {
  const { rows } = await db.execute<DayPoint>(sql`
    select to_char((created_at at time zone 'Africa/Lagos')::date, 'YYYY-MM-DD') as day,
           count(*) filter (where type = 'pageview')::int as views,
           count(distinct visitor_hash) filter (where type = 'pageview')::int as visitors,
           count(*) filter (where type = 'click')::int as clicks
    from events
    where created_at >= ${since(days)}
    group by 1 order by 1`);
  const byDay = new Map(rows.map((r) => [r.day, r]));
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = lagosDay(new Date(Date.now() - i * 86_400_000));
    out.push(byDay.get(day) ?? { day, views: 0, visitors: 0, clicks: 0 });
  }
  return out;
}

export type Totals = {
  views: number;
  visitors: number;
  clicks: number;
};

/**
 * Totals for the current window and the one before it, for "vs previous period".
 * Visitors are summed per day, because visitor ids rotate daily by design.
 */
export async function trafficTotals(db: Db, days: number): Promise<{ current: Totals; previous: Totals }> {
  const { rows } = await db.execute<Totals & { cur: boolean }>(sql`
    with daily as (
      select (created_at at time zone 'Africa/Lagos')::date as d,
             created_at >= ${since(days)} as cur,
             count(*) filter (where type = 'pageview') as v,
             count(distinct visitor_hash) filter (where type = 'pageview') as u,
             count(*) filter (where type = 'click') as c
      from events
      where created_at >= ${since(days * 2)}
      group by 1, 2
    )
    select cur, coalesce(sum(v), 0)::int as views, coalesce(sum(u), 0)::int as visitors,
           coalesce(sum(c), 0)::int as clicks
    from daily group by cur`);
  const empty = { views: 0, visitors: 0, clicks: 0 };
  const pick = (cur: boolean) => {
    const r = rows.find((x) => x.cur === cur);
    return r ? { views: r.views, visitors: r.visitors, clicks: r.clicks } : empty;
  };
  return { current: pick(true), previous: pick(false) };
}

export async function onlineNow(db: Db): Promise<number> {
  const { rows } = await db.execute<{ n: number }>(
    sql`select count(distinct visitor_hash)::int as n from events where created_at >= now() - interval '5 minutes'`,
  );
  return rows[0]?.n ?? 0;
}

export type TopRow = {
  key: string;
  count: number;
};

const TOP_COLUMNS = {
  path: "path",
  referrer: "referrer",
  label: "label",
  country: "country",
  device: "device",
  browser: "browser",
  os: "os",
} as const;

/** Most frequent values of one column, e.g. top pages or top clicked buttons. */
export async function topBy(
  db: Db,
  column: keyof typeof TOP_COLUMNS,
  type: "pageview" | "click",
  days: number,
  limit = 8,
): Promise<TopRow[]> {
  const col = sql.identifier(TOP_COLUMNS[column]);
  const { rows } = await db.execute<TopRow>(sql`
    select ${col} as key, count(*)::int as count
    from events
    where type = ${type} and created_at >= ${since(days)} and ${col} is not null
    group by ${col} order by count desc limit ${limit}`);
  return rows;
}

export async function statusCounts(db: Db, table: "enquiries" | "subscribers") {
  const t = table === "enquiries" ? enquiries : subscribers;
  const rows = await db.select({ status: t.status, n: count() }).from(t).groupBy(t.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Record<string, number>;
}

export async function newSince(db: Db, table: "enquiries" | "subscribers", days: number) {
  const t = table === "enquiries" ? enquiries : subscribers;
  const [r] = await db
    .select({ n: count() })
    .from(t)
    .where(gte(t.createdAt, sql`${since(days)}`));
  return r?.n ?? 0;
}

export function listEnquiries(db: Db, status: string, limit = 100) {
  const where: SQL | undefined =
    status === "all"
      ? undefined
      : status === "inbox"
        ? sql`${enquiries.status} <> 'archived'`
        : eq(enquiries.status, status);
  return db.select().from(enquiries).where(where).orderBy(desc(enquiries.createdAt)).limit(limit);
}

export async function getEnquiry(db: Db, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [row] = await db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
  return row ?? null;
}

export function listSubscribers(db: Db, status: string, limit = 1000) {
  return db
    .select()
    .from(subscribers)
    .where(status === "all" ? undefined : eq(subscribers.status, status))
    .orderBy(desc(subscribers.createdAt))
    .limit(limit);
}

export function listIssues(db: Db) {
  return db.select().from(newsletterIssues).orderBy(desc(newsletterIssues.createdAt)).limit(50);
}

export function listChats(db: Db, onlyUnanswered: boolean) {
  return db
    .select()
    .from(chatLogs)
    .where(onlyUnanswered ? eq(chatLogs.answered, false) : undefined)
    .orderBy(desc(chatLogs.createdAt))
    .limit(200);
}

/** Which FAQ answers were given most, for the "Most asked" list. */
export async function topFaqs(db: Db, days: number, limit = 10): Promise<TopRow[]> {
  const { rows } = await db.execute<TopRow>(sql`
    select matched_faq_id as key, count(*)::int as count
    from chat_logs
    where matched_faq_id is not null and created_at >= ${since(days)}
    group by matched_faq_id order by count desc limit ${limit}`);
  return rows;
}

/**
 * "Book a call" clicks by where they happened (header, contact section, case study, chat).
 * Every booking button is tagged with a label ending in "book-call".
 */
export async function bookCallClicks(db: Db, days: number): Promise<TopRow[]> {
  const { rows } = await db.execute<TopRow>(sql`
    select label as key, count(*)::int as count
    from events
    where type = 'click' and label like '%book-call' and created_at >= ${since(days)}
    group by label order by count desc`);
  return rows;
}

// --- Blog -------------------------------------------------------------------

export type PostFilter = "all" | "published" | "scheduled" | "draft";

/** Post list for /admin/blog, without bodies. "published" means live now; "scheduled" is due later. */
export function listPosts(db: Db, filter: PostFilter, q: string) {
  const status =
    filter === "draft"
      ? eq(posts.status, "draft")
      : filter === "published"
        ? and(eq(posts.status, "published"), sql`${posts.publishedAt} <= now()`)
        : filter === "scheduled"
          ? and(eq(posts.status, "published"), sql`${posts.publishedAt} > now()`)
          : undefined;
  const search = q ? sql`(${posts.title} ilike ${`%${q}%`} or ${posts.slug} ilike ${`%${q}%`})` : undefined;
  return db
    .select({
      id: posts.id,
      slug: posts.slug,
      title: posts.title,
      excerpt: posts.excerpt,
      status: posts.status,
      publishedAt: posts.publishedAt,
      updatedAt: posts.updatedAt,
      tags: posts.tags,
      featured: posts.featured,
      coverImage: posts.coverImage,
      readingMinutes: posts.readingMinutes,
      wordCount: posts.wordCount,
    })
    .from(posts)
    .where(and(status, search))
    .orderBy(desc(sql`coalesce(${posts.publishedAt}, ${posts.updatedAt})`))
    .limit(300);
}

export async function postCounts(db: Db): Promise<Record<PostFilter, number>> {
  const { rows } = await db.execute<{ draft: number; published: number; scheduled: number; all: number }>(sql`
    select count(*) filter (where status = 'draft')::int as draft,
           count(*) filter (where status = 'published' and published_at <= now())::int as published,
           count(*) filter (where status = 'published' and published_at > now())::int as scheduled,
           count(*)::int as "all"
    from posts`);
  return rows[0] ?? { draft: 0, published: 0, scheduled: 0, all: 0 };
}

export function getPost(db: Db, id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return Promise.resolve(null);
  return db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)
    .then((r) => r[0] ?? null);
}

/** Page views per post slug: in the last `days` days and all time, from the first-party analytics. */
export async function postViews(db: Db, days: number) {
  const { rows } = await db.execute<{ slug: string; recent: number; total: number }>(sql`
    select substring(path from 7) as slug,
           count(*) filter (where created_at >= ${since(days)})::int as recent,
           count(*)::int as total
    from events
    where type = 'pageview' and path like '/blog/%'
    group by 1`);
  return new Map(rows.map((r) => [r.slug, { recent: r.recent, total: r.total }]));
}

/** Which posts use each image, by searching bodies and covers for its id. */
export async function mediaUsage(db: Db) {
  const { rows } = await db.execute<{ id: string; title: string; post_id: string }>(sql`
    select m.id, p.title, p.id as post_id
    from media m
    join posts p on p.content::text like '%' || m.id::text || '%' or p.cover_image like '%' || m.id::text || '%'`);
  const map = new Map<string, { id: string; title: string }[]>();
  for (const r of rows) map.set(r.id, [...(map.get(r.id) ?? []), { id: r.post_id, title: r.title }]);
  return map;
}

export function listBookings(db: Db, upcoming: boolean) {
  return db
    .select()
    .from(bookings)
    .where(
      upcoming ? and(gte(bookings.startTime, sql`now()`), sql`${bookings.status} <> 'cancelled'`) : undefined,
    )
    .orderBy(upcoming ? bookings.startTime : desc(bookings.startTime))
    .limit(200);
}
