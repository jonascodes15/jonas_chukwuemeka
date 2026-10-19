"use client";

import { CircleAlert, ImagePlus, Link2, Loader2, Images, Upload } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import { safeImageSrc } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { listMediaAction } from "@/server/actions/blog";
import type { MediaItem } from "@/server/media";
import { Modal } from "./modal";
import { altFromFileName, IMAGE_ACCEPT, uploadImage } from "./upload";

export type PickedImage = { src: string; alt: string; width?: number; height?: number };

type Tab = "upload" | "library" | "link";

/** Choose an image: upload a new one, reuse one from the library, or link to one elsewhere. */
export function MediaPicker({
  open,
  onClose,
  onPick,
  title = "Add an image",
}: {
  open: boolean;
  onClose: () => void;
  onPick: (image: PickedImage) => void;
  title?: string;
}) {
  const [tab, setTab] = useState<Tab>("upload");
  const pick = (image: PickedImage) => {
    onPick(image);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={title} className="max-w-3xl">
      <div role="tablist" className="mb-5 flex gap-1.5">
        {(
          [
            ["upload", "Upload", Upload],
            ["library", "Library", Images],
            ["link", "From a link", Link2],
          ] as const
        ).map(([value, label, Icon]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-pill border px-3.5 text-sm transition-colors",
              tab === value ? "border-fg bg-fg text-bg" : "border-border text-muted hover:text-fg",
            )}
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </button>
        ))}
      </div>
      {tab === "upload" && <UploadTab onPick={pick} />}
      {tab === "library" && <LibraryTab onPick={pick} />}
      {tab === "link" && <LinkTab onPick={pick} />}
    </Modal>
  );
}

function UploadTab({ onPick }: { onPick: (image: PickedImage) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);
  const [alt, setAlt] = useState("");
  const input = useRef<HTMLInputElement>(null);

  const send = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    const res = await uploadImage(file, alt || altFromFileName(file.name));
    setBusy(false);
    if (!res.ok) return setError(res.message);
    onPick({ src: res.item.url, alt: res.item.alt, width: res.item.width, height: res.item.height });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setOver(false);
    send(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => input.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={() => setOver(false)}
        onDrop={onDrop}
        disabled={busy}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors",
          over
            ? "border-accent-ink bg-accent-glow"
            : "border-border-strong hover:border-muted hover:bg-surface-2/50",
        )}
      >
        {busy ? (
          <Loader2 aria-hidden className="size-7 animate-spin text-accent-ink" />
        ) : (
          <ImagePlus aria-hidden className="size-7 text-muted" />
        )}
        <span className="font-medium text-fg">
          {busy ? "Uploading and optimising..." : "Drop an image, or click to choose"}
        </span>
        <span className="text-xs text-muted">
          JPG, PNG, WebP, GIF or AVIF. Large photos are resized and saved as WebP.
        </span>
      </button>
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={(e) => {
          send(e.currentTarget.files?.[0]);
          e.currentTarget.value = "";
        }}
      />
      <label className="block">
        <span className="text-sm font-medium text-fg">Alt text</span>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Describe the image for screen readers and search engines"
          className={cn(inputClasses, "mt-2")}
        />
      </label>
      {error && <ErrorNote message={error} />}
    </div>
  );
}

function LibraryTab({ onPick }: { onPick: (image: PickedImage) => void }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let live = true;
    listMediaAction()
      .then((rows) => live && setItems(rows))
      .catch(() => live && setItems([]));
    return () => {
      live = false;
    };
  }, []);

  if (!items) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-xl bg-surface-2" />
        ))}
      </div>
    );
  }
  if (!items.length) return <p className="py-10 text-center text-sm text-muted">No images uploaded yet.</p>;

  const q = query.trim().toLowerCase();
  const shown = q ? items.filter((i) => `${i.fileName} ${i.alt}`.toLowerCase().includes(q)) : items;

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by file name or alt text"
        className={inputClasses}
      />
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {shown.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onPick({ src: m.url, alt: m.alt, width: m.width, height: m.height })}
              className="group block w-full overflow-hidden rounded-xl border border-border text-left transition-colors hover:border-accent-ink"
            >
              <span className="relative block aspect-square bg-surface-2">
                <Image src={m.url} alt={m.alt} fill sizes="180px" className="object-cover" />
              </span>
              <span className="block truncate px-2.5 py-2 text-xs text-muted group-hover:text-fg">
                {m.alt || m.fileName}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LinkTab({ onPick }: { onPick: (image: PickedImage) => void }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const src = safeImageSrc(url.trim());
        if (!src) return setError("Use a full image address starting with https://");
        onPick({ src, alt: alt.trim() });
      }}
    >
      <label className="block">
        <span className="text-sm font-medium text-fg">Image address</span>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/picture.jpg"
          inputMode="url"
          className={cn(inputClasses, "mt-2")}
          autoFocus
        />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-fg">Alt text</span>
        <input value={alt} onChange={(e) => setAlt(e.target.value)} className={cn(inputClasses, "mt-2")} />
      </label>
      <p className="text-xs text-muted">
        The image stays on the other site, so it disappears if they remove it. Uploading is safer.
      </p>
      {error && <ErrorNote message={error} />}
      <Button type="submit">Insert image</Button>
    </form>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p className="flex items-start gap-2 rounded-xl border border-border-strong bg-surface-2 p-3 text-sm text-fg">
      <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
      {message}
    </p>
  );
}
