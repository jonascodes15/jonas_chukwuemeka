import { ArrowLeft, ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ReadingProgress } from "@/components/case-study/reading-progress";
import { Enter } from "@/components/motion/enter";
import { site } from "@/content/site";
import { formatPostDate, headings, type DocNode } from "@/lib/blog";
import { PostCover } from "./post-card";
import { PostBody } from "./post-body";
import { ShareButtons } from "./share-buttons";
import { TableOfContents } from "./table-of-contents";

export type ArticlePost = {
  slug: string;
  title: string;
  excerpt: string;
  content: DocNode;
  coverImage: string | null;
  coverAlt: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  tags: string[];
  readingMinutes: number;
  publishedAt: string;
  updatedAt: string;
};

/** A post as readers see it: header, cover, body with contents and share links, author card. */
export function PostArticle({ post, url }: { post: ArticlePost; url: string }) {
  const toc = headings(post.content);
  const showToc = toc.length >= 2;
  // Only mention an update when it's a different day from publishing.
  const updated =
    formatPostDate(post.updatedAt) !== formatPostDate(post.publishedAt) &&
    new Date(post.updatedAt) > new Date(post.publishedAt);

  return (
    <article>
      <ReadingProgress />

      <header className="relative isolate overflow-hidden pt-8 pb-10 md:pt-12 md:pb-14">
        <div
          aria-hidden
          className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_70%)]"
        />
        <div
          aria-hidden
          className="absolute -top-40 left-1/2 -z-10 size-176 -translate-x-1/2 rounded-full bg-accent-glow blur-3xl"
        />
        <div className="container-page">
          <div className="mx-auto max-w-3xl">
            <Enter y={10}>
              <Link
                href="/blog"
                transitionTypes={["nav-back"]}
                className="group inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted uppercase transition-colors hover:text-fg"
              >
                <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" />
                All posts
              </Link>
            </Enter>

            {post.tags.length > 0 && (
              <Enter y={14} delay={0.05} className="mt-10">
                <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
                  {post.tags.map((t) => (
                    <li
                      key={t}
                      className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface/70 px-3 py-1.5 font-mono text-[0.7rem] leading-none text-muted backdrop-blur"
                    >
                      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
                      {t}
                    </li>
                  ))}
                </ul>
              </Enter>
            )}

            <Enter y={20} delay={0.1}>
              <h1 className="mt-6 font-display text-[clamp(2.25rem,6vw,4rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-fg">
                {post.title}
              </h1>
            </Enter>
            {post.excerpt && (
              <Enter y={16} delay={0.16}>
                <p className="mt-6 text-lg leading-relaxed text-pretty text-muted sm:text-xl">
                  {post.excerpt}
                </p>
              </Enter>
            )}

            <Enter y={12} delay={0.22} className="mt-8 flex flex-wrap items-center justify-between gap-5">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/me.jpg"
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 rounded-full border border-border object-cover"
                />
                <div className="text-sm">
                  <p className="font-medium text-fg">{site.name}</p>
                  <p className="mt-0.5 text-muted">
                    <time dateTime={post.publishedAt}>{formatPostDate(post.publishedAt)}</time>
                    <span aria-hidden> · </span>
                    {post.readingMinutes} min read
                    {updated && (
                      <>
                        <span aria-hidden> · </span>
                        Updated <time dateTime={post.updatedAt}>{formatPostDate(post.updatedAt)}</time>
                      </>
                    )}
                  </p>
                </div>
              </div>
              <ShareButtons url={url} title={post.title} className="max-sm:hidden" />
            </Enter>
          </div>
        </div>
      </header>

      {post.coverImage && (
        <div className="container-page">
          <Enter y={24} delay={0.18}>
            <PostCover
              post={post}
              priority
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="mx-auto aspect-[2/1] max-w-5xl rounded-card border border-border"
            />
          </Enter>
        </div>
      )}

      <div className="container-page mt-12 md:mt-16">
        <div className="xl:grid xl:grid-cols-[13rem_minmax(0,42rem)_13rem] xl:justify-center xl:gap-12">
          <aside className="hidden xl:block">
            {showToc && (
              <div className="sticky top-28 max-h-[calc(100dvh-9rem)] overflow-y-auto pb-4">
                <TableOfContents items={toc} />
              </div>
            )}
          </aside>

          <div className="mx-auto max-w-2xl min-w-0 xl:max-w-none">
            {showToc && (
              <details className="group mb-10 rounded-2xl border border-border bg-surface xl:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-mono text-xs tracking-[0.18em] text-muted uppercase [&::-webkit-details-marker]:hidden">
                  On this page
                  <ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <ol className="space-y-2 border-t border-border px-5 py-4 text-sm">
                  {toc.map((h) => (
                    <li key={h.id} className={h.level > 2 ? "pl-4" : undefined}>
                      <a href={`#${h.id}`} className="text-muted transition-colors hover:text-fg">
                        {h.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </details>
            )}

            <PostBody doc={post.content} />

            <div className="mt-16 flex flex-col gap-6 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Share this post</p>
              <ShareButtons url={url} title={post.title} />
            </div>

            <AuthorCard />
          </div>

          <aside className="hidden xl:block">
            <div className="sticky top-28 flex flex-col items-start gap-4">
              <p className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">Share</p>
              <ShareButtons url={url} title={post.title} vertical />
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}

function AuthorCard() {
  return (
    <div className="mt-10 flex flex-col gap-5 rounded-card border border-border bg-surface p-6 sm:flex-row sm:items-center sm:p-8">
      <Image
        src="/images/me.jpg"
        alt={site.name}
        width={80}
        height={80}
        className="size-20 shrink-0 rounded-2xl border border-border object-cover"
      />
      <div>
        <p className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">Written by</p>
        <p className="mt-1.5 font-display text-xl font-bold tracking-tight text-fg">{site.name}</p>
        <p className="mt-2 leading-relaxed text-muted">{site.blog.authorBio}</p>
        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
          <Link href="/#about" transitionTypes={["nav-back"]} className="text-accent-ink hover:underline">
            More about me
          </Link>
          <Link href="/#work" transitionTypes={["nav-back"]} className="text-accent-ink hover:underline">
            See my work
          </Link>
        </p>
      </div>
    </div>
  );
}
