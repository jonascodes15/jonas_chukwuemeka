import { Rss } from "lucide-react";
import type { Metadata } from "next";
import { PostCard } from "@/components/blog/post-card";
import { PostGrid } from "@/components/blog/post-grid";
import { Enter } from "@/components/motion/enter";
import { PageTransition } from "@/components/motion/page-transition";
import { Reveal } from "@/components/motion/reveal";
import { Newsletter } from "@/components/sections/newsletter";
import { blogSchema, JsonLd } from "@/components/seo/json-ld";
import { site } from "@/content/site";
import { featuredPost, getPublishedPosts } from "@/server/blog";

export const ensureStatic = "navigation";

export const metadata: Metadata = {
  title: "Blog",
  description: site.blog.seoDescription,
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: `${site.name}'s blog` }] },
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    siteName: site.name,
    url: "/blog",
    title: `Blog | ${site.name}`,
    description: site.blog.seoDescription,
  },
  twitter: {
    card: "summary_large_image",
    creator: "@JCK_ng",
    title: `Blog | ${site.name}`,
    description: site.blog.seoDescription,
  },
};

export default async function BlogPage() {
  const posts = await getPublishedPosts();
  const lead = featuredPost(posts);

  // Topics by how many posts use them.
  const counts = new Map<string, number>();
  for (const p of posts) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  const tags = [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);

  return (
    <PageTransition>
      <div>
        <JsonLd data={blogSchema(posts)} />

        <section
          aria-labelledby="blog-title"
          className="relative isolate overflow-hidden pt-10 pb-14 sm:pt-14 md:pb-20"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_10%,black,transparent)]" />
            <div className="absolute -top-48 left-[8%] size-[38rem] animate-drift rounded-full bg-accent-glow blur-3xl" />
          </div>
          <div className="container-page flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
            <div className="max-w-4xl">
              <Enter y={10}>
                <p className="mb-4 flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-muted uppercase">
                  <span aria-hidden className="inline-block size-1.5 rounded-full bg-accent" />
                  {site.blog.eyebrow}
                </p>
              </Enter>
              <Enter y={24} delay={0.06}>
                <h1 id="blog-title" className="font-display text-display font-extrabold uppercase">
                  <span className="block text-fg">{site.blog.lead}</span>
                  <span className="block text-ghost">{site.blog.trail}</span>
                </h1>
              </Enter>
            </div>
            <Enter y={16} delay={0.14} className="flex max-w-sm flex-col items-start gap-5 lg:pb-3">
              <p className="text-muted">{site.blog.description}</p>
              <a
                href="/blog/rss.xml"
                className="inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted uppercase transition-colors hover:text-accent-ink"
                data-track="blog:rss"
              >
                <Rss aria-hidden className="size-3.5" />
                RSS feed
              </a>
            </Enter>
          </div>
        </section>

        <div className="container-page">
          {lead ? (
            <>
              <Enter y={24} delay={0.12}>
                <p className="sr-only">Featured post</p>
                <PostCard post={lead} variant="feature" priority headingLevel="h2" />
              </Enter>

              {posts.length > 1 && (
                <section aria-labelledby="all-posts" className="mt-20 md:mt-28">
                  <Reveal className="mb-8 flex items-end justify-between gap-4">
                    <h2
                      id="all-posts"
                      className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl"
                    >
                      All posts <span className="text-ghost">({posts.length})</span>
                    </h2>
                  </Reveal>
                  {/* Every post, the featured one too, so filtering by topic never hides a match. */}
                  <PostGrid posts={posts} tags={tags} />
                </section>
              )}
            </>
          ) : (
            <Enter
              y={24}
              delay={0.12}
              className="relative isolate overflow-hidden rounded-card border border-dashed border-border-strong px-6 py-16 text-center sm:py-24"
            >
              <div
                aria-hidden
                className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_70%)]"
              />
              <p className="font-display text-3xl font-extrabold tracking-tight text-balance text-fg sm:text-4xl">
                {site.blog.empty.title}
              </p>
              <p className="mx-auto mt-3 max-w-md text-muted">{site.blog.empty.body}</p>
            </Enter>
          )}
        </div>

        <div className="mt-20 md:mt-28">
          <Newsletter heading={site.newsletter.heading} body={site.newsletter.body} />
        </div>
      </div>
    </PageTransition>
  );
}
