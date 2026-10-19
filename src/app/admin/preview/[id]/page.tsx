import { PenLine } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PostArticle } from "@/components/blog/post-article";
import { emptyDoc, isDoc } from "@/lib/blog";
import { getPost } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { site } from "@/content/site";

export const metadata: Metadata = { title: "Preview" };

/** A post exactly as readers will see it, drafts included. Only for the signed-in admin. */
export default function PreviewPage({ params }: PageProps<"/admin/preview/[id]">) {
  return (
    <Suspense fallback={<div className="min-h-dvh" />}>
      {params.then(({ id }) => (
        <Preview id={id} />
      ))}
    </Suspense>
  );
}

async function Preview({ id }: { id: string }) {
  await requireAdmin();
  const db = getDb();
  const post = db ? await getPost(db, id) : null;
  if (!post) notFound();

  const scheduled = post.status === "published" && post.publishedAt && post.publishedAt > new Date();
  const label = post.status === "draft" ? "Draft" : scheduled ? "Scheduled" : "Published";
  const publishedAt = (post.publishedAt ?? post.updatedAt).toISOString();

  return (
    <>
      <div className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur">
        <div className="container-page flex h-12 items-center justify-between gap-3 text-sm">
          <p className="flex items-center gap-2 text-muted">
            <span className="rounded-pill bg-accent px-2 py-0.5 font-mono text-[0.65rem] tracking-wide text-accent-contrast uppercase">
              Preview
            </span>
            {label} · only you can see this page
          </p>
          <Link
            href={`/admin/blog/${post.id}`}
            className="inline-flex items-center gap-1.5 font-medium text-accent-ink hover:underline"
          >
            <PenLine aria-hidden className="size-4" />
            Back to editing
          </Link>
        </div>
      </div>
      <main className="pb-24">
        <PostArticle
          url={`${site.url}/blog/${post.slug}`}
          post={{
            ...post,
            content: isDoc(post.content) ? post.content : emptyDoc,
            publishedAt,
            updatedAt: post.updatedAt.toISOString(),
          }}
        />
      </main>
    </>
  );
}
