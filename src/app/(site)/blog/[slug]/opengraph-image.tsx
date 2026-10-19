import { ImageResponse } from "next/og";
import { site } from "@/content/site";
import { formatPostDate } from "@/lib/blog";
import { og, OG_SIZE, OgFrame, OgMark, ogFonts, ogPhoto, siteHost } from "@/lib/og";
import { getPublishedPost, getPublishedPosts } from "@/server/blog";

/** One share image per post: its title, topics, date and reading time. */

export const alt = `A post by ${site.name}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.length ? posts.map((p) => ({ slug: p.slug })) : [{ slug: "__no-posts__" }];
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = await getPublishedPost((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });

  // Long titles step down so they stay within four lines.
  const titleSize = post.title.length > 80 ? 56 : post.title.length > 50 ? 68 : 82;

  return new ImageResponse(
    <OgFrame>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: "64px 72px 60px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <OgMark size={52} />
          <div
            style={{
              display: "flex",
              fontFamily: "GeistMono",
              fontSize: 20,
              letterSpacing: 3.5,
              textTransform: "uppercase",
              color: og.muted,
            }}
          >
            {post.tags[0] ? `Blog · ${post.tags[0]}` : "Blog"}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 44,
            maxWidth: 1040,
            fontFamily: "Bricolage",
            fontSize: titleSize,
            lineHeight: 1.04,
            letterSpacing: -2.5,
          }}
        >
          {post.title}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: "auto",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- next/og draws with <img>, not next/image. */}
            <img
              src={ogPhoto}
              alt=""
              width={64}
              height={64}
              style={{
                width: 64,
                height: 64,
                borderRadius: 999,
                objectFit: "cover",
                border: `2px solid ${og.border}`,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 24, fontWeight: 500 }}>{site.name}</span>
              <span style={{ fontFamily: "GeistMono", fontSize: 18, color: og.muted }}>
                {formatPostDate(post.publishedAt)} · {post.readingMinutes} min read
              </span>
            </div>
          </div>
          <span style={{ fontFamily: "GeistMono", fontSize: 18, color: og.accent }}>{siteHost()}/blog</span>
        </div>
      </div>
    </OgFrame>,
    { ...size, fonts: ogFonts },
  );
}
