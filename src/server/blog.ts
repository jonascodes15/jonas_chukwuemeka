import { and, desc, eq, lte } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import type { DocNode } from "@/lib/blog";
import { getDb, schema } from "./db";

/**
 * Public blog reads. Cached and tagged, so the blog, the homepage section, the RSS feed and the
 * sitemap stay static; saving or publishing in the dashboard calls updateTag(BLOG_TAG).
 * They are also refreshed hourly, which is how a scheduled post goes live on its own.
 */

export const BLOG_TAG = "blog";

const { posts } = schema;

export type PostSummary = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string | null;
  coverAlt: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  tags: string[];
  featured: boolean;
  readingMinutes: number;
  /** ISO strings, so the values survive the cache. */
  publishedAt: string;
  updatedAt: string;
};

export type Post = PostSummary & {
  content: DocNode;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  wordCount: number;
};

const summaryColumns = {
  id: posts.id,
  slug: posts.slug,
  title: posts.title,
  excerpt: posts.excerpt,
  coverImage: posts.coverImage,
  coverAlt: posts.coverAlt,
  coverWidth: posts.coverWidth,
  coverHeight: posts.coverHeight,
  tags: posts.tags,
  featured: posts.featured,
  readingMinutes: posts.readingMinutes,
  publishedAt: posts.publishedAt,
  updatedAt: posts.updatedAt,
};

const live = () => and(eq(posts.status, "published"), lte(posts.publishedAt, new Date()));

function toSummary<T extends { publishedAt: Date | null; updatedAt: Date }>(row: T) {
  return {
    ...row,
    publishedAt: (row.publishedAt ?? row.updatedAt).toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** Every live post, newest first. Empty when the database isn't set up or reachable. */
export async function getPublishedPosts(): Promise<PostSummary[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);

  const db = getDb();
  if (!db) return [];
  try {
    const rows = await db.select(summaryColumns).from(posts).where(live()).orderBy(desc(posts.publishedAt));
    return rows.map(toSummary);
  } catch (err) {
    // Most likely the posts table hasn't been migrated yet.
    console.error("[blog] couldn't list posts", err);
    return [];
  }
}

export async function getPublishedPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);

  const db = getDb();
  if (!db) return null;
  try {
    const [row] = await db
      .select({
        ...summaryColumns,
        content: posts.content,
        seoTitle: posts.seoTitle,
        seoDescription: posts.seoDescription,
        canonicalUrl: posts.canonicalUrl,
        wordCount: posts.wordCount,
      })
      .from(posts)
      .where(and(eq(posts.slug, slug), live()))
      .limit(1);
    return row ? { ...toSummary(row), content: row.content as DocNode } : null;
  } catch (err) {
    console.error("[blog] couldn't read post", err);
    return null;
  }
}

/**
 * Up to `limit` other posts, those sharing the most tags first, then the newest.
 * Worked out from the cached list, so it costs no extra query.
 */
export function relatedPosts(all: PostSummary[], post: PostSummary, limit = 3) {
  const tags = new Set(post.tags.map((t) => t.toLowerCase()));
  return all
    .filter((p) => p.id !== post.id)
    .map((p, i) => ({ p, i, shared: p.tags.filter((t) => tags.has(t.toLowerCase())).length }))
    .sort((a, b) => b.shared - a.shared || a.i - b.i)
    .slice(0, limit)
    .map((x) => x.p);
}

/** The post shown large at the top of /blog: the newest one marked featured, else the newest. */
export function featuredPost(all: PostSummary[]) {
  return all.find((p) => p.featured) ?? all[0] ?? null;
}
