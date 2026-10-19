import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostEditor } from "@/components/admin/blog/post-editor";
import type { EditorPost } from "@/components/admin/blog/types";
import { PageHeader, PageSkeleton, SetupNotice } from "@/components/admin/ui";
import { emptyDoc, isDoc } from "@/lib/blog";
import { getPost } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { editorExtras, siteHost } from "../editor-data";

export const metadata: Metadata = { title: "Edit post" };

export default function EditPostPage({ params }: PageProps<"/admin/blog/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {params.then(({ id }) => (
        <EditPost id={id} />
      ))}
    </Suspense>
  );
}

async function EditPost({ id }: { id: string }) {
  await requireAdmin();
  const db = getDb();
  if (!db) {
    return (
      <>
        <PageHeader title="Edit post" />
        <SetupNotice />
      </>
    );
  }
  const [post, extras] = await Promise.all([getPost(db, id), editorExtras(db)]);
  if (!post) notFound();

  const initial: EditorPost = {
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: isDoc(post.content) ? post.content : emptyDoc,
    coverImage: post.coverImage,
    coverAlt: post.coverAlt,
    coverWidth: post.coverWidth,
    coverHeight: post.coverHeight,
    tags: post.tags,
    status: post.status === "published" ? "published" : "draft",
    publishedAt: post.publishedAt?.toISOString() ?? null,
    featured: post.featured,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    canonicalUrl: post.canonicalUrl,
    updatedAt: post.updatedAt.toISOString(),
  };
  // Keyed by id so opening another post starts a fresh editor.
  return <PostEditor key={post.id} initial={initial} siteHost={siteHost()} {...extras} />;
}
