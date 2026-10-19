import { uploadMedia, type UploadResult } from "@/server/actions/blog";

/**
 * Image uploads from the dashboard. Phone photos are often bigger than the 4 MB a server action
 * accepts, so large or oversized images are scaled down here first (the server then converts
 * them to WebP). GIFs are sent as they are, to keep their animation.
 */

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_SIDE = 2400;

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif";

async function shrink(file: File): Promise<File> {
  if (file.type === "image/gif") return file;
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= MAX_BYTES * 0.9) {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.9));
  if (!blob) return file;
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".webp", { type: "image/webp" });
}

export async function uploadImage(file: File, alt = ""): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) return { ok: false, message: "That file isn't an image." };
  if (file.type === "image/svg+xml")
    return { ok: false, message: "SVG images aren't supported. Export a PNG instead." };
  const ready = await shrink(file);
  if (ready.size > MAX_BYTES) return { ok: false, message: "That image is still over 4 MB after resizing." };
  const data = new FormData();
  data.set("file", ready);
  data.set("alt", alt);
  try {
    return await uploadMedia(data);
  } catch {
    return { ok: false, message: "The upload failed. Check your connection and try again." };
  }
}

/** A readable default alt text from a file name: "team-photo_2.jpg" -> "Team photo 2". */
export function altFromFileName(name: string) {
  const base = name
    .replace(/\.\w+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!base || /^(img|dsc|image|screenshot|photo)?\s?\d+$/i.test(base)) return "";
  return base.charAt(0).toUpperCase() + base.slice(1);
}
