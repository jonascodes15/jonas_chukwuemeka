import type { MetadataRoute } from "next";
import { site } from "@/content/site";

// Add the case study pages here once they exist (Phase 3).
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: site.url, changeFrequency: "monthly", priority: 1 }];
}
