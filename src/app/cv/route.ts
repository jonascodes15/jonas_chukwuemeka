import type { NextRequest } from "next/server";
import { site } from "@/content/site";
import { BUNDLED_CV_PATH, getCvFile } from "@/server/cv";
import { getDb } from "@/server/db";

/**
 * Every "Download CV" button points here. Serves the CV uploaded from /admin/cv, or the
 * bundled PDF when there isn't one. `?view=1` opens it in the browser instead of downloading.
 */
export async function GET(request: NextRequest) {
  const view = request.nextUrl.searchParams.has("view");
  const db = getDb();
  let file: Awaited<ReturnType<typeof getCvFile>> = null;
  if (db) {
    try {
      file = await getCvFile(db);
    } catch (err) {
      // Most likely the files table hasn't been migrated yet: serve the bundled CV.
      console.error("[cv] couldn't read the uploaded CV", err);
    }
  }
  if (!file) return Response.redirect(new URL(BUNDLED_CV_PATH, request.url), 307);

  return new Response(new Uint8Array(file.bytes), {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(file.bytes.length),
      "Content-Disposition": `${view ? "inline" : "attachment"}; filename="${site.cv.fileName}"`,
      // A new upload must show up straight away.
      "Cache-Control": "no-store",
    },
  });
}
