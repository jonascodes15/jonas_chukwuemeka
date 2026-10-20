"use client";

import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  Eye,
  ImagePlus,
  Loader2,
  Mail,
  Maximize2,
  Minimize2,
  Send,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ComponentProps, type KeyboardEvent, type ReactNode } from "react";
import { ConfirmSubmit } from "@/components/admin/confirm-submit";
import { StatusPill } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import { cleanTags, readingMinutes, slugify, wordCount } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { deletePost, savePost, type PostInput } from "@/server/actions/blog";
import { MediaPicker } from "./media-picker";
import { RichEditor } from "./rich-editor";
import type { EditorPost, LinkSuggestion } from "./types";

/** ISO time <-> the value of a datetime-local input, in this browser's time zone. */
function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

const AUTOSAVE_MS = 20_000;

type Notice = { tone: "success" | "error"; text: string } | null;

/**
 * The editor for /admin/blog/new. With Cache Components, Next.js keeps a page's state when you
 * leave it, so a second visit to "New post" brought back the previous editor, still holding the
 * id of the post just published, and saving there replaced that post. Keying on bfcacheId gives
 * every visit through a link a fresh, empty editor; browser back/forward still restores it.
 */
export function NewPostEditor(props: ComponentProps<typeof PostEditor>) {
  const { bfcacheId } = useRouter();
  return <PostEditor key={bfcacheId} {...props} />;
}

export function PostEditor({
  initial,
  siteHost,
  linkSuggestions,
  allTags,
}: {
  initial: EditorPost;
  siteHost: string;
  linkSuggestions: LinkSuggestion[];
  allTags: string[];
}) {
  const [post, setPost] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  // What's stored now: decides the status badge and which buttons show.
  const [stored, setStored] = useState({
    status: initial.status,
    publishedAt: initial.publishedAt,
    slug: initial.slug,
  });
  const [slugTouched, setSlugTouched] = useState(initial.id !== null);
  const [saving, setSaving] = useState<null | "draft" | "published" | "auto">(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [badField, setBadField] = useState<string | null>(null);
  const [coverPicker, setCoverPicker] = useState(false);
  const [focus, setFocus] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(initial.updatedAt);

  const dirty = JSON.stringify(post) !== saved;
  const words = wordCount(post.content);
  const minutes = readingMinutes(post.content);
  const scheduled = !!post.publishedAt && new Date(post.publishedAt) > new Date();
  const live = post.id !== null && stored.status === "published";
  const savedStatus: "draft" | "published" | "scheduled" = !live
    ? "draft"
    : stored.publishedAt && new Date(stored.publishedAt) > new Date()
      ? "scheduled"
      : "published";

  const update = (patch: Partial<EditorPost>) => setPost((p) => ({ ...p, ...patch }));

  const save = async (status: "draft" | "published", auto = false) => {
    if (saving) return;
    setSaving(auto ? "auto" : status);
    if (!auto) setNotice(null);
    const snapshot = { ...post, status };
    const input: PostInput = {
      id: post.id,
      title: post.title,
      slug: post.slug || slugify(post.title),
      excerpt: post.excerpt,
      content: post.content,
      coverImage: post.coverImage,
      coverAlt: post.coverAlt,
      coverWidth: post.coverWidth,
      coverHeight: post.coverHeight,
      tags: post.tags,
      status,
      publishedAt: post.publishedAt,
      featured: post.featured,
      seoTitle: post.seoTitle,
      seoDescription: post.seoDescription,
      canonicalUrl: post.canonicalUrl,
      expectedUpdatedAt: post.id ? post.updatedAt : null,
    };
    let res: Awaited<ReturnType<typeof savePost>>;
    try {
      res = await savePost(input);
    } catch {
      res = { ok: false, message: "Couldn't reach the server. Your changes are still here; try again." };
    }
    setSaving(null);

    if (!res.ok) {
      // A conflict always shows, even from an autosave: it means saving has stopped.
      if (!auto || res.conflict) {
        setNotice({ tone: "error", text: res.message });
        setBadField(res.field ?? null);
      }
      return;
    }
    const next = {
      ...snapshot,
      id: res.id,
      slug: res.slug,
      status: res.status,
      publishedAt: res.publishedAt,
      updatedAt: res.updatedAt,
    };
    // Keep anything typed while the save was in flight.
    setPost((p) => ({
      ...p,
      id: res.id,
      slug: res.slug,
      status: res.status,
      publishedAt: res.publishedAt,
      updatedAt: res.updatedAt,
    }));
    setSaved(JSON.stringify(next));
    setStored({ status: res.status, publishedAt: res.publishedAt, slug: res.slug });
    setSlugTouched(true);
    setLastSaved(res.updatedAt);
    setBadField(null);
    if (!auto) setNotice({ tone: "success", text: res.message });
    // Move from /admin/blog/new to the post's own address without remounting the editor.
    if (!post.id) window.history.replaceState(null, "", `/admin/blog/${res.id}`);
  };

  // Ctrl/Cmd+S saves: as a draft for drafts, as an update for published posts.
  const saveRef = useRef(save);
  useEffect(() => {
    saveRef.current = save;
  });
  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current(live ? "published" : "draft");
      }
      if (e.key === "Escape") setFocus(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [live]);

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);

  // Drafts save themselves after a pause in typing. Live posts only change when you press Update.
  useEffect(() => {
    if (!dirty || live || (!post.title.trim() && words === 0)) return;
    const t = setTimeout(() => saveRef.current("draft", true), AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [dirty, live, post, words]);

  const previewHref = post.id ? `/admin/preview/${post.id}` : null;
  const publicHref = savedStatus === "published" ? `/blog/${stored.slug}` : null;

  const statusLine =
    saving === "auto"
      ? "Saving..."
      : dirty
        ? "Unsaved changes"
        : lastSaved
          ? `Saved ${timeLabel(lastSaved)}`
          : "Not saved yet";

  const titleField = (
    <textarea
      value={post.title}
      onChange={(e) => {
        const title = e.target.value.replace(/\n/g, " ");
        update(slugTouched ? { title } : { title, slug: slugify(title) });
      }}
      onKeyDown={(e: KeyboardEvent) => e.key === "Enter" && e.preventDefault()}
      placeholder="Post title"
      aria-label="Title"
      aria-invalid={badField === "title"}
      rows={1}
      maxLength={160}
      className="field-sizing-content w-full resize-none bg-transparent font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] font-extrabold tracking-[-0.03em] text-fg outline-none placeholder:text-ghost"
    />
  );

  const editor = (
    <RichEditor
      initialContent={initial.content}
      onChange={(content) => update({ content })}
      linkSuggestions={linkSuggestions}
      toolbarEnd={
        <button
          type="button"
          onClick={() => setFocus((f) => !f)}
          aria-label={focus ? "Leave focus mode (Esc)" : "Focus mode"}
          title={focus ? "Leave focus mode (Esc)" : "Focus mode"}
          className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
        >
          {focus ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
      }
    />
  );

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      {previewHref && (
        <a
          href={previewHref}
          target="_blank"
          rel="noopener"
          className="inline-flex h-9 items-center gap-2 rounded-pill px-3 text-sm text-muted transition-colors hover:bg-surface-2 hover:text-fg"
          title={dirty ? "Preview shows the last saved version" : undefined}
        >
          <Eye aria-hidden className="size-4" />
          Preview
        </a>
      )}
      {live ? (
        <>
          <Button size="sm" variant="secondary" disabled={!!saving} onClick={() => save("draft")}>
            {saving === "draft" && <Loader2 aria-hidden className="size-4 animate-spin" />}
            Unpublish
          </Button>
          <Button size="sm" disabled={!!saving} onClick={() => save("published")}>
            {saving === "published" ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : (
              <Send aria-hidden className="size-4" />
            )}
            {scheduled ? "Update schedule" : "Update"}
          </Button>
        </>
      ) : (
        <>
          <Button size="sm" variant="secondary" disabled={!!saving} onClick={() => save("draft")}>
            {saving === "draft" && <Loader2 aria-hidden className="size-4 animate-spin" />}
            Save draft
          </Button>
          <Button size="sm" disabled={!!saving} onClick={() => save("published")}>
            {saving === "published" ? (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            ) : scheduled ? (
              <CalendarClock aria-hidden className="size-4" />
            ) : (
              <Send aria-hidden className="size-4" />
            )}
            {scheduled ? "Schedule" : "Publish"}
          </Button>
        </>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            aria-label="All posts"
            className="grid size-9 place-items-center rounded-full border border-border text-muted transition-colors hover:text-fg"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <StatusPill status={savedStatus} />
          <span className="text-sm text-muted" aria-live="polite">
            {statusLine}
          </span>
        </div>
        {actions}
      </div>

      {notice && (
        <div
          role="status"
          className={cn(
            "mb-6 flex items-start justify-between gap-3 rounded-xl border p-3 text-sm text-fg",
            notice.tone === "success"
              ? "border-accent-ink/40 bg-accent-glow"
              : "border-border-strong bg-surface-2",
          )}
        >
          <span className="flex items-start gap-2">
            {notice.tone === "success" ? (
              <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-ink" />
            ) : (
              <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-muted" />
            )}
            <span>
              {notice.text}{" "}
              {notice.tone === "success" && publicHref && (
                <a
                  href={publicHref}
                  target="_blank"
                  rel="noopener"
                  className="font-medium text-accent-ink hover:underline"
                >
                  View post
                </a>
              )}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setNotice(null)}
            aria-label="Dismiss"
            className="text-muted hover:text-fg"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Focus mode only changes classes here, so the editor never remounts and loses its state. */}
        <div
          className={cn(
            "min-w-0",
            focus
              ? "fixed inset-0 z-50 overflow-y-auto bg-bg [&_[role=toolbar]]:top-18"
              : "rounded-2xl border border-border bg-surface px-5 py-6 sm:px-8 sm:py-8",
          )}
        >
          {focus && (
            <div className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
              <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                <p className="text-sm text-muted">{statusLine}</p>
                {actions}
              </div>
            </div>
          )}
          <div className={focus ? "mx-auto max-w-3xl px-4 py-10" : undefined}>
            {titleField}
            <p className="mt-3 text-sm text-muted">
              {words.toLocaleString("en-US")} words · {minutes} min read
            </p>
            <div className="mt-6">{editor}</div>
          </div>
        </div>

        <aside className="space-y-4">
          <Card title="Publishing">
            <Labelled
              label="Publish date"
              hint={
                scheduled
                  ? "In the future, so the post is scheduled."
                  : "Leave empty to use the moment you publish."
              }
            >
              <div className="flex gap-2">
                <input
                  type="datetime-local"
                  value={toLocalInput(post.publishedAt)}
                  onChange={(e) => update({ publishedAt: fromLocalInput(e.target.value) })}
                  className={cn(inputClasses, "py-2.5")}
                />
                {post.publishedAt && (
                  <button
                    type="button"
                    onClick={() => update({ publishedAt: null })}
                    aria-label="Clear date"
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-border text-muted hover:text-fg"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </Labelled>
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border p-3">
              <input
                type="checkbox"
                checked={post.featured}
                onChange={(e) => update({ featured: e.target.checked })}
                className="mt-0.5 size-4 accent-accent-ink"
              />
              <span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-fg">
                  <Star aria-hidden className="size-3.5 text-accent-ink" /> Featured
                </span>
                <span className="mt-0.5 block text-xs text-muted">Shown large at the top of the blog.</span>
              </span>
            </label>
            {publicHref && (
              <a
                href={publicHref}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-ink hover:underline"
              >
                <ExternalLink aria-hidden className="size-3.5" /> View live post
              </a>
            )}
            {publicHref && (
              <Link
                href={`/admin/newsletter?post=${post.id}`}
                className="flex items-center gap-1.5 text-sm font-medium text-accent-ink hover:underline"
              >
                <Mail aria-hidden className="size-3.5" /> Email subscribers about it
              </Link>
            )}
          </Card>

          <Card title="Address">
            <Labelled
              label="URL slug"
              hint={
                <>
                  {siteHost}/blog/<span className="text-fg">{post.slug || "..."}</span>
                  {live && " · Changing this breaks links people have already shared."}
                </>
              }
            >
              <input
                value={post.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  update({
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                      .slice(0, 80),
                  });
                }}
                onBlur={() => update({ slug: slugify(post.slug) })}
                aria-invalid={badField === "slug"}
                className={cn(inputClasses, "py-2.5 font-mono text-sm")}
              />
            </Labelled>
          </Card>

          <Card title="Summary">
            <Labelled
              label="Excerpt"
              hint={
                <Counter
                  value={post.excerpt}
                  max={200}
                  note="Shown on cards and in search results. Left empty, the opening lines are used."
                />
              }
            >
              <textarea
                value={post.excerpt}
                onChange={(e) => update({ excerpt: e.target.value })}
                rows={4}
                maxLength={320}
                className={cn(inputClasses, "resize-y py-2.5 text-sm")}
              />
            </Labelled>
            <Labelled
              label="Tags"
              hint="Press Enter or comma to add. Up to 8; the first one is the main topic."
            >
              <TagInput tags={post.tags} onChange={(tags) => update({ tags })} suggestions={allTags} />
            </Labelled>
          </Card>

          <Card title="Cover image">
            {post.coverImage ? (
              <div className="space-y-3">
                <div className="relative aspect-[2/1] overflow-hidden rounded-xl border border-border bg-surface-2">
                  {post.coverImage.startsWith("/media/") ? (
                    <Image
                      src={post.coverImage}
                      alt={post.coverAlt ?? ""}
                      fill
                      sizes="352px"
                      className="object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.coverImage} alt={post.coverAlt ?? ""} className="size-full object-cover" />
                  )}
                </div>
                <input
                  value={post.coverAlt ?? ""}
                  onChange={(e) => update({ coverAlt: e.target.value })}
                  placeholder="Alt text: what the image shows"
                  aria-label="Cover alt text"
                  className={cn(inputClasses, "py-2.5 text-sm")}
                />
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setCoverPicker(true)}>
                    Replace
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      update({ coverImage: null, coverAlt: null, coverWidth: null, coverHeight: null })
                    }
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCoverPicker(true)}
                className="flex w-full flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border-strong px-4 py-8 text-sm text-muted transition-colors hover:border-muted hover:text-fg"
              >
                <ImagePlus aria-hidden className="size-6" />
                Add a cover image
                <span className="text-xs">Wide images work best (2:1).</span>
              </button>
            )}
          </Card>

          <Card title="Search and sharing">
            <SearchPreview
              host={siteHost}
              slug={post.slug}
              title={post.seoTitle || post.title || "Post title"}
              description={
                post.seoDescription || post.excerpt || "The excerpt, or the opening lines of the post."
              }
            />
            <Labelled
              label="SEO title"
              hint={
                <Counter
                  value={post.seoTitle ?? ""}
                  max={60}
                  note="Optional. Replaces the title in search results and share cards."
                />
              }
            >
              <input
                value={post.seoTitle ?? ""}
                onChange={(e) => update({ seoTitle: e.target.value || null })}
                maxLength={120}
                placeholder={post.title}
                className={cn(inputClasses, "py-2.5 text-sm")}
              />
            </Labelled>
            <Labelled
              label="Meta description"
              hint={
                <Counter
                  value={post.seoDescription ?? ""}
                  max={160}
                  note="Optional. Replaces the excerpt in search results."
                />
              }
            >
              <textarea
                value={post.seoDescription ?? ""}
                onChange={(e) => update({ seoDescription: e.target.value || null })}
                rows={3}
                maxLength={320}
                className={cn(inputClasses, "resize-y py-2.5 text-sm")}
              />
            </Labelled>
            <Labelled
              label="Canonical URL"
              hint="Only if this post first appeared on another site (Medium, Dev.to...)."
            >
              <input
                value={post.canonicalUrl ?? ""}
                onChange={(e) => update({ canonicalUrl: e.target.value || null })}
                placeholder="https://"
                inputMode="url"
                aria-invalid={badField === "canonicalUrl"}
                className={cn(inputClasses, "py-2.5 text-sm")}
              />
            </Labelled>
          </Card>

          {post.id && (
            <form action={deletePost} className="rounded-2xl border border-dashed border-border-strong p-4">
              <input type="hidden" name="id" value={post.id} />
              <input type="hidden" name="redirect" value="list" />
              <ConfirmSubmit
                message={`Delete "${post.title || "this post"}"? This can't be undone.`}
                className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-red-600 dark:hover:text-red-400"
              >
                <Trash2 aria-hidden className="size-4" />
                Delete post
              </ConfirmSubmit>
            </form>
          )}
        </aside>
      </div>

      <MediaPicker
        open={coverPicker}
        onClose={() => setCoverPicker(false)}
        title="Cover image"
        onPick={(img) =>
          update({
            coverImage: img.src,
            coverAlt: post.coverAlt || img.alt || null,
            coverWidth: img.width ?? null,
            coverHeight: img.height ?? null,
          })
        }
      />
    </div>
  );
}

function timeLabel(iso: string) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? `at ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`
    : `on ${d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`;
}

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-surface">
      <h2 className="border-b border-border px-4 py-3 font-display text-sm font-bold tracking-tight text-fg">
        {title}
      </h2>
      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

function Labelled({ label, hint, children }: { label: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-fg">{label}</span>
      <div className="mt-2">{children}</div>
      {hint && <span className="mt-1.5 block text-xs leading-relaxed text-muted">{hint}</span>}
    </label>
  );
}

function Counter({ value, max, note }: { value: string; max: number; note: string }) {
  const n = value.length;
  return (
    <span className="flex justify-between gap-3">
      <span>{note}</span>
      <span className={cn("shrink-0 font-mono tabular-nums", n > max && "text-red-600 dark:text-red-400")}>
        {n}/{max}
      </span>
    </span>
  );
}

function TagInput({
  tags,
  onChange,
  suggestions,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}) {
  const [draft, setDraft] = useState("");
  const add = (raw: string) => {
    const next = cleanTags([...tags, ...raw.split(",")]);
    onChange(next);
    setDraft("");
  };
  const unused = suggestions.filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border-strong bg-bg p-2 focus-within:border-accent-ink focus-within:shadow-[0_0_0_4px_var(--accent-glow)]">
        {tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center gap-1 rounded-pill bg-surface-2 py-1 pr-1 pl-2.5 text-xs text-fg"
          >
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={() => onChange(tags.filter((x) => x !== t))}
              className="grid size-4 place-items-center rounded-full text-muted hover:bg-border hover:text-fg"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <input
          value={draft}
          list="tag-suggestions"
          onChange={(e) => {
            const v = e.target.value;
            if (v.includes(",")) add(v);
            else setDraft(v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (draft.trim()) add(draft);
            } else if (e.key === "Backspace" && !draft && tags.length) {
              onChange(tags.slice(0, -1));
            }
          }}
          onBlur={() => draft.trim() && add(draft)}
          placeholder={tags.length ? "" : "e.g. Next.js, Data engineering"}
          aria-label="Add a tag"
          className="min-w-24 flex-1 bg-transparent px-1 py-1 text-sm text-fg outline-none placeholder:text-ghost"
        />
      </div>
      <datalist id="tag-suggestions">
        {unused.map((s) => (
          <option key={s} value={s} />
        ))}
      </datalist>
    </div>
  );
}

/** Roughly how the post shows up in Google. */
function SearchPreview({
  host,
  slug,
  title,
  description,
}: {
  host: string;
  slug: string;
  title: string;
  description: string;
}) {
  const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}...` : s);
  return (
    <div className="rounded-xl border border-border bg-bg p-3.5">
      <p className="font-mono text-[0.65rem] tracking-[0.14em] text-muted uppercase">Search preview</p>
      <p className="mt-2.5 truncate text-xs text-muted">
        {host} › blog › {slug || "..."}
      </p>
      <p className="mt-1 text-[0.95rem] leading-snug font-medium text-accent-ink">{clip(title, 60)}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted">{clip(description, 160)}</p>
    </div>
  );
}
