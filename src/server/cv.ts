import "server-only";
import { eq } from "drizzle-orm";
import { schema, type Db } from "./db";

/**
 * The CV uploaded from /admin/cv. When none is uploaded (or the files table doesn't exist
 * yet), /cv falls back to the PDF bundled in public/cv.
 */

export const CV_KEY = "cv";
/** Vercel caps a request body at 4.5 MB, so uploads stay under that. */
export const MAX_CV_BYTES = 4 * 1024 * 1024;
export const BUNDLED_CV_PATH = "/cv/Jonas-Chukwuemeka-CV.pdf";

export type CvInfo = { fileName: string; size: number; uploadedAt: Date };

export async function getCvInfo(db: Db): Promise<CvInfo | null> {
  const [row] = await db
    .select({
      fileName: schema.files.fileName,
      size: schema.files.size,
      uploadedAt: schema.files.uploadedAt,
    })
    .from(schema.files)
    .where(eq(schema.files.key, CV_KEY));
  return row ?? null;
}

export async function getCvFile(db: Db) {
  const [row] = await db
    .select({ data: schema.files.data, contentType: schema.files.contentType })
    .from(schema.files)
    .where(eq(schema.files.key, CV_KEY));
  return row ? { bytes: Buffer.from(row.data, "base64"), contentType: row.contentType } : null;
}
