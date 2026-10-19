import { getDb } from "@/server/db";
import { getMediaFile } from "@/server/media";

/**
 * Serves blog images uploaded in the dashboard, at /media/<id>.webp. An id never changes what
 * it points to (replacing an image gives it a new id), so browsers and the CDN may keep a copy
 * for a year.
 */
export async function GET(_request: Request, { params }: RouteContext<"/media/[file]">) {
  const { file } = await params;
  const id = file.match(/^([0-9a-f-]{36})\.\w+$/i)?.[1];
  const db = getDb();
  if (!id || !db) return new Response("Not found", { status: 404 });

  let media: Awaited<ReturnType<typeof getMediaFile>> = null;
  try {
    media = await getMediaFile(db, id);
  } catch (err) {
    console.error("[media]", err);
  }
  if (!media) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(media.bytes), {
    headers: {
      "Content-Type": media.contentType,
      "Content-Length": String(media.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
