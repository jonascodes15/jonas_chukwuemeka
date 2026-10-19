import { ArrowUpRight } from "lucide-react";
import { PostCard } from "@/components/blog/post-card";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { site } from "@/content/site";
import { getPublishedPosts, type PostSummary } from "@/server/blog";

/**
 * The three newest posts on the homepage: the newest large, the next two beside it.
 * Hidden until the first post is published. Cached with the page, refreshed on publish.
 */
export async function LatestPosts() {
  return <LatestPostsView posts={(await getPublishedPosts()).slice(0, 3)} />;
}

export function LatestPostsView({ posts }: { posts: PostSummary[] }) {
  if (!posts.length) return null;
  const [lead, ...rest] = posts;

  return (
    <section id="blog" aria-labelledby="blog-home-title" className="py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            id="blog-home-title"
            eyebrow={site.blog.eyebrow}
            lead={site.blog.home.lead}
            trail={site.blog.home.trail}
          />
          <Reveal className="flex max-w-sm flex-col items-start gap-5 lg:pb-3">
            <p className="text-muted">{site.blog.home.description}</p>
            <ButtonLink
              href="/blog"
              variant="secondary"
              transitionTypes={["nav-forward"]}
              data-track="home:all-posts"
            >
              All posts
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
              />
            </ButtonLink>
          </Reveal>
        </div>

        <RevealGroup
          as="ul"
          className={
            rest.length ? "mt-14 grid gap-5 md:mt-20 lg:grid-cols-[1.35fr_1fr]" : "mt-14 grid gap-5 md:mt-20"
          }
        >
          <RevealItem as="li">
            {/* On its own, the newest post gets the wide layout. */}
            <PostCard post={lead} variant={rest.length ? "card" : "feature"} />
          </RevealItem>
          {rest.length > 0 && (
            <RevealItem as="li">
              <ul className="grid h-full gap-5 lg:grid-rows-2">
                {rest.map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} variant="row" />
                  </li>
                ))}
              </ul>
            </RevealItem>
          )}
        </RevealGroup>
      </div>
    </section>
  );
}
