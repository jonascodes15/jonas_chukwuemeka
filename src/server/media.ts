import "server-only";
import { desc, eq } from "drizzle-orm";
import sharp from "sharp";
import { schema, type Db } from "./db";

/**
 * Blog images. Uploads are re-encoded here: turned upright from their EXIF data, stripped of
 * metadata (which can include GPS location), scaled down to MAX_WIDTH and saved as WebP.
 * SVG isn't accepted, because an SVG file can carry scripts.
 */

/** Server actions on Vercel accept 4.5 MB; the browser scales larger photos down first. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
export const MAX_WIDTH = 2400;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];

export type MediaItem = {
  id: string;
  url: string;
  fileName: string;
  size: number;
  width: number;
  height: number;
  alt: string;
  createdAt: Date;
};

export const mediaUrl = (id: string) => `/media/${id}.webp`;

export async function processImage(input: Buffer) {
  const image = sharp(input, { animated: true, limitInputPixels: 80_000_000 });
  const meta = await image.metadata();
  if (!meta.format || !["jpeg", "png", "webp", "gif", "avif", "heif"].includes(meta.format)) {
    throw new Error("unsupported");
  }
  const { data, info } = await image
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer({ resolveWithObject: true });
  // For animated images sharp reports the height of all frames stacked; use one frame's.
  const height = meta.pages && meta.pages > 1 ? Math.round(info.height / meta.pages) : info.height;
  return { data, width: info.width, height, contentType: "image/webp" };
}

export async function listMedia(db: Db, limit = 200): Promise<MediaItem[]> {
  const rows = await db
    .select({
      id: schema.media.id,
      fileName: schema.media.fileName,
      size: schema.media.size,
      width: schema.media.width,
      height: schema.media.height,
      alt: schema.media.alt,
      createdAt: schema.media.createdAt,
    })
    .from(schema.media)
    .orderBy(desc(schema.media.createdAt))
    .limit(limit);
  return rows.map((r) => ({ ...r, url: mediaUrl(r.id) }));
}

export async function getMediaFile(db: Db, id: string) {
  const [row] = await db
    .select({ data: schema.media.data, contentType: schema.media.contentType })
    .from(schema.media)
    .where(eq(schema.media.id, id))
    .limit(1);
  return row ? { bytes: Buffer.from(row.data, "base64"), contentType: row.contentType } : null;
}
