import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/blog/post-article";
import { PostCard } from "@/components/blog/post-card";
import { CaseCta } from "@/components/case-study/case-footer";
import { PageTransition } from "@/components/motion/page-transition";
import { Reveal } from "@/components/motion/reveal";
import { Newsletter } from "@/components/sections/newsletter";
import { blogPostingSchema, JsonLd } from "@/components/seo/json-ld";
import { site } from "@/content/site";
import { getPublishedPost, getPublishedPosts, relatedPosts } from "@/server/blog";

// Prerendered, and so is a post published later (on its first visit). Requiring a complete
// static render also gives an unknown slug a real 404 status rather than a streamed one.
export const ensureStatic = "navigation";

/** Cache Components needs at least one entry, so a placeholder stands in before the first post. */
const PLACEHOLDER = "__no-posts__";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: PLACEHOLDER }];
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug);
  if (!post) return {};
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const url = `/blog/${post.slug}`;

  // The share image comes from opengraph-image.tsx next to this page; X falls back to it too.
  return {
    title,
    description,
    keywords: post.tags,
    alternates: {
      canonical: post.canonicalUrl || url,
      types: { "application/rss+xml": [{ url: "/blog/rss.xml", title: `${site.name}'s blog` }] },
    },
    openGraph: {
      type: "article",
      locale: "en_NG",
      siteName: site.name,
      url,
      title,
      description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [site.url],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@JCK_ng",
      title,
      description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound();

  const all = await getPublishedPosts();
  const index = all.findIndex((p) => p.id === post.id);
  const newer = index > 0 ? all[index - 1] : null;
  const older = index >= 0 && index < all.length - 1 ? all[index + 1] : null;
  const related = relatedPosts(all, post);

  return (
    <PageTransition>
      <div>
        <JsonLd data={blogPostingSchema(post)} />
        <PostArticle post={post} url={`${site.url}/blog/${post.slug}`} />

        {(newer || older) && (
          <nav aria-label="More posts" className="container-page mt-20">
            <div className="mx-auto grid max-w-5xl gap-4 sm:grid-cols-2">
              {older ? <Adjacent post={older} direction="older" /> : <span className="max-sm:hidden" />}
              {newer && <Adjacent post={newer} direction="newer" />}
            </div>
          </nav>
        )}

        {related.length > 0 && (
          <section aria-labelledby="related-title" className="container-page mt-24 md:mt-32">
            <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2
                id="related-title"
                className="font-display text-3xl font-extrabold tracking-tight text-fg sm:text-4xl"
              >
                Keep <span className="text-ghost">reading</span>
              </h2>
              <Link
                href="/blog"
                transitionTypes={["nav-back"]}
                className="text-sm font-medium text-accent-ink hover:underline"
              >
                All posts
              </Link>
            </Reveal>
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <Reveal as="li" key={p.id}>
                  <PostCard post={p} />
                </Reveal>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-20 md:mt-28">
          <Newsletter heading={site.newsletter.heading} body={site.newsletter.body} />
        </div>
        <div className="container-page">
          <CaseCta />
        </div>
      </div>
    </PageTransition>
  );
}

function Adjacent({
  post,
  direction,
}: {
  post: { slug: string; title: string };
  direction: "older" | "newer";
}) {
  const older = direction === "older";
  return (
    <Link
      href={`/blog/${post.slug}`}
      transitionTypes={[older ? "nav-back" : "nav-forward"]}
      className={`group flex flex-col gap-2 rounded-2xl border border-border bg-surface p-5 transition-[border-color,transform] duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-border-strong sm:p-6 ${older ? "" : "sm:items-end sm:text-right"}`}
    >
      <span className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">
        {older && (
          <ArrowLeft aria-hidden className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
        )}
        {older ? "Previous post" : "Next post"}
        {!older && (
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        )}
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-balance text-fg">{post.title}</span>
    </Link>
  );
}
