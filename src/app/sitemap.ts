import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudyEntries } from "@/content/work";
import { getPublishedPosts } from "@/server/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    ...caseStudyEntries.map((e) => ({
      url: `${site.url}/work/${e.project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    {
      url: `${site.url}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
      ...(posts[0] && { lastModified: posts[0].publishedAt }),
    },
    ...posts.map((p) => ({
      url: `${site.url}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
