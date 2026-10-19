import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { formatPostDateShort, safeImageSrc } from "@/lib/blog";
import { cn } from "@/lib/utils";
import type { PostSummary } from "@/server/blog";

/** A post's cover image, or a quiet branded panel when it has none. */
export function PostCover({
  post,
  sizes,
  priority,
  className,
}: {
  post: Pick<PostSummary, "coverImage" | "coverAlt" | "coverWidth" | "coverHeight" | "title" | "tags">;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const src = safeImageSrc(post.coverImage);
  return (
    <div className={cn("relative isolate overflow-hidden bg-surface-2", className)}>
      {src ? (
        src.startsWith("/media/") ? (
          <Image
            src={src}
            alt={post.coverAlt ?? ""}
            fill
            sizes={sizes}
            priority={priority}
            className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- linked from another site, size unknown.
          <img
            src={src}
            alt={post.coverAlt ?? ""}
            loading={priority ? "eager" : "lazy"}
            className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
          />
        )
      ) : (
        <div aria-hidden className="absolute inset-0 bg-lab">
          <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black_15%,transparent_70%)]" />
          <div className="absolute -top-1/3 -right-1/4 size-[70%] rounded-full bg-accent-glow blur-3xl" />
          <LogoMark className="absolute right-[8%] bottom-[10%] size-[22%] max-w-24 text-accent-ink/70 transition-transform duration-700 ease-out-expo group-hover:scale-105" />
          {post.tags[0] && (
            <span className="absolute top-5 left-5 inline-flex items-center gap-2 font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">
              <span className="size-1.5 rounded-full bg-accent" />
              {post.tags[0]}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function PostMeta({ post, className }: { post: PostSummary; className?: string }) {
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted", className)}>
      <time dateTime={post.publishedAt}>{formatPostDateShort(post.publishedAt)}</time>
      <span aria-hidden>·</span>
      <span>{post.readingMinutes} min read</span>
    </p>
  );
}

function Tags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {tags.slice(0, 3).map((t) => (
        <li
          key={t}
          className="rounded-pill border border-border bg-surface-2/60 px-2.5 py-1 font-mono text-[0.68rem] leading-none text-muted"
        >
          {t}
        </li>
      ))}
    </ul>
  );
}

/**
 * - "card": cover on top, for grids.
 * - "feature": cover beside the text on wide screens, for the lead post.
 * - "row": no cover, for compact lists.
 */
export function PostCard({
  post,
  variant = "card",
  priority,
  headingLevel: H = "h3",
  className,
}: {
  post: PostSummary;
  variant?: "card" | "feature" | "row";
  priority?: boolean;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const href = `/blog/${post.slug}`;

  if (variant === "row") {
    return (
      <article className={cn("group relative h-full", className)}>
        <Link
          href={href}
          transitionTypes={["nav-forward"]}
          data-track={`blog-card:${post.slug}`}
          className="flex h-full flex-col rounded-card border border-border bg-surface p-6 transition-[border-color,transform] duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-border-strong sm:p-7"
        >
          <PostMeta post={post} />
          <H className="mt-3 font-display text-xl leading-snug font-extrabold tracking-tight text-balance text-fg sm:text-2xl">
            {post.title}
          </H>
          <p className="mt-2.5 line-clamp-3 leading-relaxed text-muted">{post.excerpt}</p>
          {/* Pinned to the bottom, so cards stretched to fill a column still look finished. */}
          <div className="mt-auto flex items-end justify-between gap-4 pt-6">
            <Tags tags={post.tags} />
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted transition-[background-color,border-color,color] duration-500 ease-out-expo group-hover:border-accent group-hover:bg-accent group-hover:text-accent-contrast"
            >
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </Link>
      </article>
    );
  }

  const feature = variant === "feature";
  return (
    <article className={cn("group relative h-full", className)}>
      <Link
        href={href}
        transitionTypes={["nav-forward"]}
        data-track={`blog-card:${post.slug}`}
        className={cn(
          "flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-[border-color,transform] duration-500 ease-out-expo hover:-translate-y-1 hover:border-border-strong",
          feature && "lg:grid lg:grid-cols-[1.15fr_1fr]",
        )}
      >
        <PostCover
          post={post}
          priority={priority}
          sizes={
            feature
              ? "(min-width: 1024px) 680px, 100vw"
              : "(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
          }
          className={cn("aspect-[16/10] w-full", feature && "lg:aspect-auto lg:h-full lg:min-h-[26rem]")}
        />
        <div className={cn("flex flex-1 flex-col p-6", feature && "sm:p-8 lg:p-10")}>
          <Tags tags={post.tags} />
          <H
            className={cn(
              "mt-4 font-display font-extrabold tracking-tight text-balance text-fg",
              feature
                ? "text-3xl sm:text-4xl lg:text-[2.6rem] lg:leading-[1.05]"
                : "text-xl leading-snug sm:text-2xl",
            )}
          >
            {post.title}
          </H>
          <p className={cn("mt-3 leading-relaxed text-muted", feature ? "text-lg" : "line-clamp-3")}>
            {post.excerpt}
          </p>
          <div className="mt-auto flex items-center justify-between gap-4 pt-6">
            <PostMeta post={post} />
            <span
              aria-hidden
              className={cn(
                "grid shrink-0 place-items-center rounded-full transition-[background-color,color,transform] duration-500 ease-out-expo",
                feature
                  ? "size-12 bg-accent text-accent-contrast group-hover:translate-x-0.5"
                  : "size-9 border border-border text-muted group-hover:border-accent group-hover:bg-accent group-hover:text-accent-contrast",
              )}
            >
              <ArrowUpRight className={feature ? "size-5" : "size-4"} />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
