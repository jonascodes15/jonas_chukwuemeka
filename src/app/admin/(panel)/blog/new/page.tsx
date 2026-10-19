import type { Metadata } from "next";
import { Suspense } from "react";
import { PostEditor } from "@/components/admin/blog/post-editor";
import { newPost } from "@/components/admin/blog/types";
import { PageHeader, PageSkeleton, SetupNotice } from "@/components/admin/ui";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { editorExtras, siteHost } from "../editor-data";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <NewPost />
    </Suspense>
  );
}

async function NewPost() {
  await requireAdmin();
  const db = getDb();
  if (!db) {
    return (
      <>
        <PageHeader title="New post" />
        <SetupNotice />
      </>
    );
  }
  const extras = await editorExtras(db);
  return <PostEditor initial={newPost} siteHost={siteHost()} {...extras} />;
}
