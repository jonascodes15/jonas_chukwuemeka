"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { cleanTags, isDoc, nodeText, readingMinutes, slugify, wordCount, type DocNode } from "@/lib/blog";
import { requireAdmin } from "../auth";
import { BLOG_TAG } from "../blog";
import { getDb, schema } from "../db";
import {
  ACCEPTED_TYPES,
  MAX_UPLOAD_BYTES,
  listMedia,
  mediaUrl,
  processImage,
  type MediaItem,
} from "../media";

/** Blog mutations for /admin/blog. Each checks the session first: server actions are public endpoints. */

async function db() {
  await requireAdmin();
  const d = getDb();
  if (!d) throw new Error("Database not configured");
  return d;
}

const uuid = z.uuid();
const MAX_CONTENT_CHARS = 1_500_000;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullish()
    .transform((v) => v || null);

const postSchema = z.object({
  id: uuid.nullish(),
  title: z.string().trim().max(160),
  slug: z.string().trim().max(80),
  excerpt: z.string().trim().max(320),
  content: z.unknown(),
  coverImage: optionalText(1000),
  coverAlt: optionalText(300),
  coverWidth: z.number().int().positive().nullish(),
  coverHeight: z.number().int().positive().nullish(),
  tags: z.array(z.string()).max(20),
  status: z.enum(["draft", "published"]),
  publishedAt: z.iso.datetime({ offset: true }).nullish(),
  featured: z.boolean(),
  seoTitle: optionalText(120),
  seoDescription: optionalText(320),
  canonicalUrl: optionalText(1000),
  /** The `updatedAt` of the version the editor started from, so a stale editor can't overwrite newer work. */
  expectedUpdatedAt: z.iso.datetime({ offset: true }).nullish(),
});

export type PostInput = z.input<typeof postSchema>;

export type SaveResult =
  | {
      ok: true;
      id: string;
      slug: string;
      status: "draft" | "published";
      publishedAt: string | null;
      updatedAt: string;
      message: string;
    }
  | { ok: false; message: string; field?: string; conflict?: true };

const isHttpUrl = (v: string) => {
  try {
    return ["http:", "https:"].includes(new URL(v).protocol);
  } catch {
    return false;
  }
};

/** First ~200 characters of the body, ending on a whole word, for posts saved without an excerpt. */
function autoExcerpt(doc: DocNode) {
  const text = (doc.content ?? [])
    .filter((n) => n.type === "paragraph")
    .map(nodeText)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= 200) return text;
  return `${text.slice(0, 200).replace(/\s+\S*$/, "")}...`;
}

export async function savePost(input: PostInput): Promise<SaveResult> {
  const d = await db();
  const parsed = postSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      message: issue?.message ?? "Some fields aren't valid.",
      field: String(issue?.path[0] ?? ""),
    };
  }
  const v = parsed.data;

  if (!isDoc(v.content))
    return { ok: false, message: "The post body couldn't be read. Reload and try again." };
  const content = v.content;
  if (JSON.stringify(content).length > MAX_CONTENT_CHARS) {
    return { ok: false, message: "This post is too long to save in one piece." };
  }

  const title = v.title || "Untitled";
  const slug = slugify(v.slug || title);
  if (!slug)
    return { ok: false, message: "Add a URL slug with at least one letter or number.", field: "slug" };
  if (v.status === "published") {
    if (!v.title) return { ok: false, message: "Add a title before publishing.", field: "title" };
    if (wordCount(content) < 1) return { ok: false, message: "Write something before publishing." };
  }
  if (v.canonicalUrl && !isHttpUrl(v.canonicalUrl)) {
    return { ok: false, message: "The canonical URL must start with https://", field: "canonicalUrl" };
  }

  const clash = await d
    .select({ id: schema.posts.id })
    .from(schema.posts)
    .where(v.id ? and(eq(schema.posts.slug, slug), ne(schema.posts.id, v.id)) : eq(schema.posts.slug, slug))
    .limit(1);
  if (clash.length) {
    return {
      ok: false,
      message: `Another post already uses /blog/${slug}. Choose a different slug.`,
      field: "slug",
    };
  }

  const now = new Date();
  const publishedAt =
    v.status === "published"
      ? v.publishedAt
        ? new Date(v.publishedAt)
        : now
      : v.publishedAt
        ? new Date(v.publishedAt)
        : null;

  const row = {
    title,
    slug,
    excerpt: v.excerpt || autoExcerpt(content),
    content,
    coverImage: v.coverImage,
    coverAlt: v.coverAlt,
    coverWidth: v.coverImage ? (v.coverWidth ?? null) : null,
    coverHeight: v.coverImage ? (v.coverHeight ?? null) : null,
    tags: cleanTags(v.tags),
    status: v.status,
    publishedAt,
    featured: v.featured,
    seoTitle: v.seoTitle,
    seoDescription: v.seoDescription,
    canonicalUrl: v.canonicalUrl,
    wordCount: wordCount(content),
    readingMinutes: readingMinutes(content),
    updatedAt: now,
  };

  let id = v.id ?? null;
  try {
    if (id) {
      // Only overwrite the version this editor last saw. If the post changed since (another tab,
      // or an editor screen kept from earlier), refuse instead of silently replacing that work.
      const unchanged = v.expectedUpdatedAt
        ? sql`date_trunc('milliseconds', ${schema.posts.updatedAt}) = ${v.expectedUpdatedAt}::timestamptz`
        : undefined;
      const updated = await d
        .update(schema.posts)
        .set(row)
        .where(and(eq(schema.posts.id, id), unchanged))
        .returning({ id: schema.posts.id });
      if (!updated.length) {
        const [exists] = await d
          .select({ id: schema.posts.id })
          .from(schema.posts)
          .where(eq(schema.posts.id, id))
          .limit(1);
        if (!exists) return { ok: false, message: "This post no longer exists. It may have been deleted." };
        return {
          ok: false,
          conflict: true,
          message:
            "Not saved: this post was changed somewhere else since this screen loaded (another tab, perhaps). Copy anything you want to keep, then reload the page to get the latest version.",
        };
      }
    } else {
      const [created] = await d.insert(schema.posts).values(row).returning({ id: schema.posts.id });
      id = created.id;
    }
  } catch (err) {
    console.error("[blog] save failed", err);
    return {
      ok: false,
      message: "Couldn't save. If this is the first post, run npm run db:migrate, then try again.",
    };
  }

  updateTag(BLOG_TAG);
  const scheduled = v.status === "published" && publishedAt && publishedAt > now;
  return {
    ok: true,
    id,
    slug,
    status: v.status,
    publishedAt: publishedAt?.toISOString() ?? null,
    updatedAt: now.toISOString(),
    message:
      v.status === "draft"
        ? "Draft saved."
        : scheduled
          ? "Scheduled. It goes live within the hour after its publish time."
          : "Published. The post is live.",
  };
}

export async function deletePost(formData: FormData) {
  const d = await db();
  const id = uuid.parse(formData.get("id"));
  await d.delete(schema.posts).where(eq(schema.posts.id, id));
  updateTag(BLOG_TAG);
  if (formData.get("redirect") === "list") redirect("/admin/blog");
  refresh();
}

/** Copies a post into a new draft, then opens it. */
export async function duplicatePost(formData: FormData) {
  const d = await db();
  const id = uuid.parse(formData.get("id"));
  const [post] = await d.select().from(schema.posts).where(eq(schema.posts.id, id)).limit(1);
  if (!post) return;
  // Find a free slug: "my-post-copy", "my-post-copy-2"...
  const base = `${post.slug}-copy`.slice(0, 74);
  let slug = base;
  for (let i = 2; ; i++) {
    const taken = await d
      .select({ id: schema.posts.id })
      .from(schema.posts)
      .where(eq(schema.posts.slug, slug))
      .limit(1);
    if (!taken.length) break;
    slug = `${base}-${i}`;
  }
  const [copy] = await d
    .insert(schema.posts)
    .values({
      ...post,
      // A new row: fresh id and created time, unpublished.
      id: undefined,
      createdAt: undefined,
      slug,
      title: `${post.title} (copy)`,
      status: "draft",
      publishedAt: null,
      featured: false,
      updatedAt: new Date(),
    })
    .returning({ id: schema.posts.id });
  redirect(`/admin/blog/${copy.id}`);
}

// --- Media ------------------------------------------------------------------

export type UploadResult = { ok: true; item: MediaItem } | { ok: false; message: string };

export async function uploadMedia(formData: FormData): Promise<UploadResult> {
  const d = await db();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { ok: false, message: "Choose an image first." };
  if (file.size > MAX_UPLOAD_BYTES) return { ok: false, message: "That image is over 4 MB." };
  if (file.type && !ACCEPTED_TYPES.includes(file.type)) {
    return { ok: false, message: "Use a JPG, PNG, WebP, GIF or AVIF image." };
  }

  let processed: Awaited<ReturnType<typeof processImage>>;
  try {
    processed = await processImage(Buffer.from(await file.arrayBuffer()));
  } catch {
    return { ok: false, message: "That file couldn't be read as an image." };
  }

  const alt = String(formData.get("alt") ?? "")
    .trim()
    .slice(0, 300);
  const fileName =
    (file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^\w .()-]/g, "")
      .slice(0, 100) || "image") + ".webp";
  try {
    const [row] = await d
      .insert(schema.media)
      .values({
        fileName,
        contentType: processed.contentType,
        size: processed.data.length,
        width: processed.width,
        height: processed.height,
        alt,
        data: processed.data.toString("base64"),
      })
      .returning({ id: schema.media.id, createdAt: schema.media.createdAt });
    return {
      ok: true,
      item: {
        id: row.id,
        url: mediaUrl(row.id),
        fileName,
        size: processed.data.length,
        width: processed.width,
        height: processed.height,
        alt,
        createdAt: row.createdAt,
      },
    };
  } catch (err) {
    console.error("[media] upload failed", err);
    return {
      ok: false,
      message: "Couldn't save the image. If this is the first upload, run npm run db:migrate.",
    };
  }
}

export async function listMediaAction(): Promise<MediaItem[]> {
  const d = await db();
  try {
    return await listMedia(d);
  } catch (err) {
    console.error("[media] list failed", err);
    return [];
  }
}

export async function updateMediaAlt(formData: FormData) {
  const d = await db();
  const id = uuid.parse(formData.get("id"));
  const alt = String(formData.get("alt") ?? "")
    .trim()
    .slice(0, 300);
  await d.update(schema.media).set({ alt }).where(eq(schema.media.id, id));
  refresh();
}

export async function deleteMedia(formData: FormData) {
  const d = await db();
  const id = uuid.parse(formData.get("id"));
  await d.delete(schema.media).where(eq(schema.media.id, id));
  refresh();
}
