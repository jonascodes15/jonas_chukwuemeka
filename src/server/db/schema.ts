import { sql } from "drizzle-orm";
import {
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Database schema. After changing it, run `npm run db:generate` to write a migration,
 * then `npm run db:migrate` to apply it.
 * IP addresses are never stored: only salted SHA-256 hashes (see src/server/privacy.ts).
 */

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

export const enquiries = pgTable(
  "enquiries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: createdAt(),
    type: text("type").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    budget: text("budget"),
    message: text("message").notNull(),
    /** new | read | archived */
    status: text("status").notNull().default("new"),
    ipHash: text("ip_hash"),
  },
  (t) => [index("enquiries_created_idx").on(t.createdAt), index("enquiries_status_idx").on(t.status)],
);

export const subscribers = pgTable(
  "subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: createdAt(),
    email: text("email").notNull().unique(),
    /** pending | confirmed | unsubscribed */
    status: text("status").notNull().default("pending"),
    /** Random token used in confirm and unsubscribe links. */
    token: text("token").notNull().unique(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (t) => [index("subscribers_status_idx").on(t.status)],
);

export const newsletterIssues = pgTable("newsletter_issues", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: createdAt(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  recipientCount: integer("recipient_count").notNull().default(0),
  failedCount: integer("failed_count").notNull().default(0),
});

/** First-party analytics: page views and clicks. */
export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    createdAt: createdAt(),
    /** pageview | click */
    type: text("type").notNull(),
    path: text("path").notNull(),
    /** Click label, e.g. "download:cv" or "outbound:weblanda.com". */
    label: text("label"),
    /** Host of an external referrer only. */
    referrer: text("referrer"),
    /** Salted hash of IP + user agent + day. Rotates daily, so visitors can't be followed across days. */
    visitorHash: text("visitor_hash").notNull(),
    country: text("country"),
    device: text("device"),
    browser: text("browser"),
    os: text("os"),
  },
  (t) => [
    index("events_created_idx").on(t.createdAt),
    index("events_type_created_idx").on(t.type, t.createdAt),
  ],
);

/** Fixed-window rate limiting. Keys are hashed. */
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull().default(0),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .default(sql`now()`),
});

/**
 * Files uploaded from the dashboard, such as the CV (key "cv"). Kept in the database as base64
 * so there's no extra storage service to set up; uploads are capped at a few MB.
 */
export const files = pgTable("files", {
  key: text("key").primaryKey(),
  /** The name the file had when it was uploaded, shown in the dashboard. */
  fileName: text("file_name").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  data: text("data").notNull(),
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Questions asked in the FAQ chat widget (written from Phase 5). */
export const chatLogs = pgTable(
  "chat_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: createdAt(),
    question: text("question").notNull(),
    matchedFaqId: text("matched_faq_id"),
    answered: boolean("answered").notNull().default(false),
    email: text("email"),
    visitorHash: text("visitor_hash"),
  },
  (t) => [index("chat_logs_created_idx").on(t.createdAt)],
);

/**
 * Blog posts, written in /admin/blog. `content` is the editor's document (Tiptap JSON), rendered
 * on the server by src/components/blog/post-body.tsx. A post is public when its status is
 * "published" and `publishedAt` has passed, so a future date schedules it.
 */
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull().default(""),
    content: jsonb("content").notNull(),
    coverImage: text("cover_image"),
    coverAlt: text("cover_alt"),
    coverWidth: integer("cover_width"),
    coverHeight: integer("cover_height"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    /** draft | published */
    status: text("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    featured: boolean("featured").notNull().default(false),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    /** Set when the post first appeared elsewhere, so search engines credit the original. */
    canonicalUrl: text("canonical_url"),
    wordCount: integer("word_count").notNull().default(0),
    readingMinutes: integer("reading_minutes").notNull().default(1),
  },
  (t) => [index("posts_status_published_idx").on(t.status, t.publishedAt)],
);

/**
 * Images uploaded for the blog, served from /media/<id>.<ext>. Stored as base64 like `files`,
 * after being resized and converted to WebP on upload, so each one stays small.
 */
export const media = pgTable(
  "media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: createdAt(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    size: integer("size").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    alt: text("alt").notNull().default(""),
    data: text("data").notNull(),
  },
  (t) => [index("media_created_idx").on(t.createdAt)],
);

/** Cal.com bookings, received by webhook (from Phase 5). */
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: createdAt(),
    calUid: text("cal_uid").notNull().unique(),
    title: text("title"),
    name: text("name"),
    email: text("email"),
    startTime: timestamp("start_time", { withTimezone: true }),
    endTime: timestamp("end_time", { withTimezone: true }),
    /** booked | rescheduled | cancelled */
    status: text("status").notNull().default("booked"),
  },
  (t) => [index("bookings_start_idx").on(t.startTime)],
);
