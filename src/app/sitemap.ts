import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { caseStudyEntries } from "@/content/work";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: site.url, changeFrequency: "monthly", priority: 1 },
    ...caseStudyEntries.map((e) => ({
      url: `${site.url}/work/${e.project.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
