import { ArrowUpRight, FileText, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { formatDateTime, PageHeader, PageSkeleton, Panel, SetupNotice } from "@/components/admin/ui";
import { deleteCv } from "@/server/actions/admin";
import { requireAdmin } from "@/server/auth";
import { getCvInfo, MAX_CV_BYTES, type CvInfo } from "@/server/cv";
import { getDb } from "@/server/db";
import { CvUpload } from "./cv-upload";

export const metadata: Metadata = { title: "CV" };

export default function CvPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Cv />
    </Suspense>
  );
}

const formatSize = (bytes: number) =>
  bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;

const linkClasses =
  "inline-flex items-center gap-1.5 rounded-pill border border-border px-3.5 py-2 text-sm font-medium text-fg transition-colors hover:border-border-strong hover:bg-surface-2";

async function Cv() {
  await requireAdmin();
  const db = getDb();
  const header = (
    <PageHeader title="CV" description="The file every Download CV button on the site gives." />
  );
  if (!db) {
    return (
      <>
        {header}
        <SetupNotice />
      </>
    );
  }

  let info: CvInfo | null = null;
  let migrated = true;
  try {
    info = await getCvInfo(db);
  } catch (err) {
    console.error("[cv] couldn't read the files table", err);
    migrated = false;
  }

  return (
    <>
      {header}
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Current CV">
          <div className="flex items-start gap-4">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent-ink">
              <FileText aria-hidden className="size-5" />
            </span>
            <div className="min-w-0">
              {info ? (
                <>
                  <p className="truncate font-medium text-fg">{info.fileName}</p>
                  <p className="mt-0.5 text-sm text-muted">
                    {formatSize(info.size)} · uploaded {formatDateTime(info.uploadedAt)}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium text-fg">Built-in CV</p>
                  <p className="mt-0.5 text-sm text-muted">
                    Nothing uploaded yet, so the site gives the CV that ships with the code.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <a href="/cv?view=1" target="_blank" rel="noopener noreferrer" className={linkClasses}>
              Open
              <ArrowUpRight aria-hidden className="size-4" />
            </a>
            {info && (
              <form action={deleteCv}>
                <ConfirmSubmit
                  message="Delete the uploaded CV? The site goes back to the built-in CV until you upload another."
                  className={linkClasses}
                >
                  <Trash2 aria-hidden className="size-4" />
                  Delete
                </ConfirmSubmit>
              </form>
            )}
          </div>
        </Panel>

        <Panel title="Upload a new CV">
          {migrated ? (
            <CvUpload maxBytes={MAX_CV_BYTES} />
          ) : (
            <p className="text-sm leading-relaxed text-muted">
              CV uploads need one more database table. Run{" "}
              <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-fg">npm run db:migrate</code>{" "}
              on your computer, then reload this page.
            </p>
          )}
        </Panel>
      </div>
    </>
  );
}
