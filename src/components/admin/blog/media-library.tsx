"use client";

import { Check, Copy, ImagePlus, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type DragEvent } from "react";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { formatDateTime } from "@/components/admin/ui";
import { inputClasses } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { deleteMedia, updateMediaAlt } from "@/server/actions/blog";
import { ErrorNote } from "./media-picker";
import { altFromFileName, IMAGE_ACCEPT, uploadImage } from "./upload";

type Item = {
  id: string;
  url: string;
  fileName: string;
  size: number;
  width: number;
  height: number;
  alt: string;
  createdAt: string;
  usedIn: { id: string; title: string }[];
};

const kb = (n: number) =>
  n > 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;

export function MediaLibrary({ items }: { items: Item[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const upload = async (files: File[]) => {
    setErrors([]);
    for (const file of files) {
      setBusy((n) => n + 1);
      const res = await uploadImage(file, altFromFileName(file.name));
      setBusy((n) => n - 1);
      if (!res.ok) setErrors((e) => [...e, `${file.name}: ${res.message}`]);
    }
    router.refresh();
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    upload(Array.from(e.dataTransfer.files));
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        className={cn(
          "flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          over
            ? "border-accent-ink bg-accent-glow"
            : "border-border-strong hover:border-muted hover:bg-surface",
        )}
      >
        {busy ? (
          <Loader2 aria-hidden className="size-6 animate-spin text-accent-ink" />
        ) : (
          <ImagePlus aria-hidden className="size-6 text-muted" />
        )}
        <span className="font-medium text-fg">
          {busy
            ? `Uploading ${busy} image${busy === 1 ? "" : "s"}...`
            : "Drop images here, or click to choose"}
        </span>
        <span className="text-xs text-muted">Several at once is fine. JPG, PNG, WebP, GIF or AVIF.</span>
      </button>
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        multiple
        className="hidden"
        onChange={(e) => {
          upload(Array.from(e.currentTarget.files ?? []));
          e.currentTarget.value = "";
        }}
      />
      {errors.map((e) => (
        <ErrorNote key={e} message={e} />
      ))}

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No images yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((m) => (
            <MediaCard key={m.id} item={m} />
          ))}
        </ul>
      )}
    </div>
  );
}

function MediaCard({ item: m }: { item: Item }) {
  const [copied, setCopied] = useState(false);
  const [alt, setAlt] = useState(m.alt);

  return (
    <li className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface">
      <a href={m.url} target="_blank" rel="noopener" className="relative block aspect-[4/3] bg-surface-2">
        <Image
          src={m.url}
          alt={m.alt}
          fill
          sizes="(min-width: 1024px) 320px, 50vw"
          className="object-contain"
        />
      </a>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <p className="truncate text-sm font-medium text-fg" title={m.fileName}>
          {m.fileName}
        </p>
        <p className="-mt-2 font-mono text-[0.68rem] text-muted">
          {m.width} x {m.height} · {kb(m.size)} · {formatDateTime(m.createdAt)}
        </p>
        <form action={updateMediaAlt} className="flex gap-2">
          <input type="hidden" name="id" value={m.id} />
          <input
            name="alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text"
            aria-label="Alt text"
            className={cn(inputClasses, "h-9 py-0 text-sm")}
          />
          {alt !== m.alt && (
            <button
              type="submit"
              className="h-9 shrink-0 rounded-xl bg-accent px-3 text-sm font-medium text-accent-contrast"
            >
              Save
            </button>
          )}
        </form>
        <p className="text-xs text-muted">
          {m.usedIn.length === 0 ? (
            "Not used in any post"
          ) : (
            <>
              Used in{" "}
              {m.usedIn.map((p, i) => (
                <span key={p.id}>
                  {i > 0 && ", "}
                  <Link href={`/admin/blog/${p.id}`} className="text-accent-ink hover:underline">
                    {p.title}
                  </Link>
                </span>
              ))}
            </>
          )}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard
                ?.writeText(new URL(m.url, location.origin).toString())
                .then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                })
                .catch(() => {});
            }}
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg"
          >
            {copied ? (
              <Check aria-hidden className="size-4 text-accent-ink" />
            ) : (
              <Copy aria-hidden className="size-4" />
            )}
            {copied ? "Copied" : "Copy URL"}
          </button>
          <form action={deleteMedia}>
            <input type="hidden" name="id" value={m.id} />
            <ConfirmSubmit
              message={
                m.usedIn.length
                  ? `This image is used in ${m.usedIn.length} post${m.usedIn.length === 1 ? "" : "s"}. Deleting it leaves a gap there. Delete anyway?`
                  : "Delete this image?"
              }
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-red-600 dark:hover:text-red-400"
            >
              <Trash2 aria-hidden className="size-4" />
              Delete
            </ConfirmSubmit>
          </form>
        </div>
      </div>
    </li>
  );
}
