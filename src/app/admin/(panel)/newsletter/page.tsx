import type { Metadata } from "next";
import { Suspense } from "react";
import { formatDateTime, PageHeader, PageSkeleton, Panel, SetupNotice } from "@/components/admin/ui";
import { site } from "@/content/site";
import { getPost, listIssues, statusCounts } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { Composer } from "./composer";

export const metadata: Metadata = { title: "Newsletter" };

export default function NewsletterPage({ searchParams }: PageProps<"/admin/newsletter">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {searchParams.then(({ post }) => (
        <Newsletter postId={typeof post === "string" ? post : null} />
      ))}
    </Suspense>
  );
}

async function Newsletter({ postId }: { postId: string | null }) {
  await requireAdmin();
  const db = getDb();
  const header = (
    <PageHeader
      title="Newsletter"
      description="Write an issue, send yourself a test, then send it to every confirmed subscriber."
    />
  );
  if (!db) {
    return (
      <>
        {header}
        <SetupNotice />
      </>
    );
  }

  const [counts, issues, post] = await Promise.all([
    statusCounts(db, "subscribers"),
    listIssues(db),
    postId ? getPost(db, postId).catch(() => null) : null,
  ]);
  // Arriving from a published post: start the issue from its title and excerpt.
  const draft =
    post?.status === "published"
      ? {
          subject: post.title,
          body: `${post.excerpt}

Read the full post: ${site.url}/blog/${post.slug}`,
        }
      : undefined;

  return (
    <>
      {header}
      <div className="grid gap-4 xl:grid-cols-[1fr_20rem]">
        <Panel title="New issue">
          <Composer
            recipients={counts.confirmed ?? 0}
            defaultSubject={draft?.subject}
            defaultBody={draft?.body}
          />
        </Panel>
        <Panel title="Sent" bodyClassName="p-0">
          {issues.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">Nothing sent yet.</p>
          ) : (
            <ul className="divide-y divide-border">
              {issues.map((i) => (
                <li key={i.id} className="px-5 py-3.5">
                  <p className="truncate text-sm font-medium text-fg">{i.subject}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatDateTime(i.sentAt)} · {i.recipientCount} sent
                    {i.failedCount > 0 && `, ${i.failedCount} failed`}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </>
  );
}
