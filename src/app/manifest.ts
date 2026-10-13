import type { MetadataRoute } from "next";
import { site } from "@/content/site";

/** Name, colours and icons used when someone adds the site to their phone's home screen. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Jonas C.",
    description: site.seo.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0e0e0d",
    theme_color: "#0e0e0d",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
