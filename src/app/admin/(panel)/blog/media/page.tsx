import { ArrowLeft, Images } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { MediaLibrary } from "@/components/admin/blog/media-library";
import { EmptyState, PageHeader, PageSkeleton, Panel, SetupNotice } from "@/components/admin/ui";
import { buttonClasses } from "@/components/ui/button";
import { mediaUsage } from "@/server/admin-data";
import { requireAdmin } from "@/server/auth";
import { getDb } from "@/server/db";
import { listMedia } from "@/server/media";

export const metadata: Metadata = { title: "Media library" };

export default function MediaPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Media />
    </Suspense>
  );
}

async function Media() {
  await requireAdmin();
  const db = getDb();
  const header = (
    <PageHeader
      title="Media library"
      description="Images for blog posts. Uploads are resized, stripped of location data and saved as WebP."
      actions={
        <Link href="/admin/blog" className={buttonClasses({ variant: "secondary", size: "sm" })}>
          <ArrowLeft aria-hidden className="size-4" />
          Posts
        </Link>
      }
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

  let items, usage;
  try {
    [items, usage] = await Promise.all([listMedia(db), mediaUsage(db)]);
  } catch (err) {
    console.error("[media] library failed", err);
    return (
      <>
        {header}
        <Panel>
          <EmptyState
            icon={Images}
            title="The media table isn't set up yet"
            body={
              <>
                Run <code className="font-mono text-fg">npm run db:migrate</code> once, then reload this page.
              </>
            }
          />
        </Panel>
      </>
    );
  }

  return (
    <>
      {header}
      <MediaLibrary
        items={items.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
          usedIn: usage.get(m.id) ?? [],
        }))}
      />
    </>
  );
}
