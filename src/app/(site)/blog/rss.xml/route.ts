import { cacheLife, cacheTag } from "next/cache";
import { site } from "@/content/site";
import { BLOG_TAG, getPublishedPosts } from "@/server/blog";

/** RSS 2.0 feed of the latest posts, for feed readers and newsletter tools. */

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

async function feed() {
  "use cache";
  cacheLife("hours");
  cacheTag(BLOG_TAG);

  const posts = (await getPublishedPosts()).slice(0, 30);
  const blogUrl = `${site.url}/blog`;
  const items = posts
    .map((p) => {
      const url = `${blogUrl}/${p.slug}`;
      return `
    <item>
      <title>${escape(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${escape(p.excerpt)}</description>${p.tags.map((t) => `\n      <category>${escape(t)}</category>`).join("")}
    </item>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escape(`${site.name}'s blog`)}</title>
    <link>${blogUrl}</link>
    <description>${escape(site.blog.seoDescription)}</description>
    <language>en</language>
    <atom:link href="${blogUrl}/rss.xml" rel="self" type="application/rss+xml" />${
      posts[0] ? `\n    <lastBuildDate>${new Date(posts[0].publishedAt).toUTCString()}</lastBuildDate>` : ""
    }${items}
  </channel>
</rss>
`;
}

export async function GET() {
  return new Response(await feed(), {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
