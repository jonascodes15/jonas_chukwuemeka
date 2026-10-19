import "server-only";
import { desc } from "drizzle-orm";
import type { LinkSuggestion } from "@/components/admin/blog/types";
import { navHref, navLinks, site } from "@/content/site";
import { caseStudyEntries } from "@/content/work";
import { schema, type Db } from "@/server/db";

/** Pages offered in the editor's link dialog, and tags already in use for the tag field. */
export async function editorExtras(db: Db) {
  let posts: { title: string; slug: string; tags: string[] }[] = [];
  try {
    posts = await db
      .select({ title: schema.posts.title, slug: schema.posts.slug, tags: schema.posts.tags })
      .from(schema.posts)
      .orderBy(desc(schema.posts.updatedAt))
      .limit(200);
  } catch (err) {
    console.error("[blog] couldn't load editor data", err);
  }

  const linkSuggestions: LinkSuggestion[] = [
    ...posts.map((p) => ({ label: p.title, href: `/blog/${p.slug}`, group: "Post" })),
    ...caseStudyEntries.map((e) => ({
      label: `${e.project.name} case study`,
      href: `/work/${e.project.slug}`,
      group: "Case study",
    })),
    ...navLinks.map((l) => ({ label: l.label, href: navHref(l), group: l.href ? "Page" : "Section" })),
    { label: "Home", href: "/", group: "Page" },
    ...(site.calLink ? [{ label: "Book a call", href: site.calLink, group: "Booking" }] : []),
  ];

  const seen = new Map<string, string>();
  for (const p of posts) for (const t of p.tags) if (!seen.has(t.toLowerCase())) seen.set(t.toLowerCase(), t);
  const allTags = [...seen.values()].sort((a, b) => a.localeCompare(b));

  return { linkSuggestions, allTags };
}

export const siteHost = () => site.url.replace(/^https?:\/\//, "");
