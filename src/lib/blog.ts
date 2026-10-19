/**
 * Helpers for blog posts, shared by the admin editor (browser) and the public pages (server).
 * A post body is the editor's document: Tiptap/ProseMirror JSON, a tree of typed nodes.
 */

export type DocMark = { type: string; attrs?: Record<string, unknown> };
export type DocNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  marks?: DocMark[];
  text?: string;
};

export const emptyDoc: DocNode = { type: "doc", content: [{ type: "paragraph" }] };

export function isDoc(value: unknown): value is DocNode {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as DocNode).type === "doc" &&
    Array.isArray((value as DocNode).content ?? [])
  );
}

/** "Hello, World! 2026" -> "hello-world-2026". */
export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

export function nodeText(node: DocNode): string {
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return " ";
  return (node.content ?? []).map(nodeText).join(node.type === "doc" ? "\n" : "");
}

/** Words across every text block, code included. */
export function wordCount(doc: DocNode) {
  const words = (node: DocNode): number => {
    if (node.type === "text") return (node.text ?? "").split(/\s+/).filter(Boolean).length;
    return (node.content ?? []).reduce((n, c) => n + words(c), 0);
  };
  return words(doc);
}

/** At about 225 words a minute, with images adding a few seconds each. Never under a minute. */
export function readingMinutes(doc: DocNode) {
  let images = 0;
  const walk = (n: DocNode) => {
    if (n.type === "image") images++;
    n.content?.forEach(walk);
  };
  walk(doc);
  return Math.max(1, Math.round(wordCount(doc) / 225 + images * (10 / 60)));
}

export type Heading = { id: string; text: string; level: number };

/**
 * Top-level section headings in order, each with a unique id. The renderer uses the same map
 * for the anchors that the table of contents links to, so the two always match.
 */
export function headingMap(doc: DocNode): Map<DocNode, Heading> {
  const used = new Map<string, number>();
  const out = new Map<DocNode, Heading>();
  for (const node of doc.content ?? []) {
    if (node.type !== "heading") continue;
    const text = nodeText(node).trim();
    if (!text) continue;
    const base = slugify(text) || "section";
    const n = used.get(base) ?? 0;
    used.set(base, n + 1);
    out.set(node, { id: n ? `${base}-${n + 1}` : base, text, level: Number(node.attrs?.level ?? 2) });
  }
  return out;
}

export const headings = (doc: DocNode): Heading[] => [...headingMap(doc).values()];

/** First image in the body, used as a fallback cover. */
export function firstImage(doc: DocNode): { src: string; alt: string } | null {
  for (const node of doc.content ?? []) {
    if (node.type === "image" && typeof node.attrs?.src === "string") {
      return { src: node.attrs.src, alt: String(node.attrs.alt ?? "") };
    }
  }
  return null;
}

/**
 * Only links a reader can safely follow: web, email, phone, and paths or anchors on this site.
 * Anything else (javascript:, data: and so on) returns null and renders as plain text.
 */
export function safeHref(href: unknown): string | null {
  if (typeof href !== "string") return null;
  const value = href.trim();
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  if (value.startsWith("#")) return value;
  try {
    const url = new URL(value);
    return ["http:", "https:", "mailto:", "tel:"].includes(url.protocol) ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Images from the media library (/media/...) or any https address. */
export function safeImageSrc(src: unknown): string | null {
  if (typeof src !== "string") return null;
  if (/^\/media\/[\w-]+\.\w+$/.test(src)) return src;
  try {
    const url = new URL(src);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** The video id from any common YouTube address, or null. */
export function youtubeId(src: unknown): string | null {
  if (typeof src !== "string") return null;
  try {
    const url = new URL(src);
    const host = url.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = url.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id =
        url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)?.[1] ?? null;
    }
    return id && /^[\w-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

/** Languages offered for code blocks in the editor. Values are Shiki language ids. */
export const CODE_LANGUAGES = [
  { value: "text", label: "Plain text" },
  { value: "bash", label: "Bash / shell" },
  { value: "typescript", label: "TypeScript" },
  { value: "tsx", label: "TSX" },
  { value: "javascript", label: "JavaScript" },
  { value: "jsx", label: "JSX" },
  { value: "json", label: "JSON" },
  { value: "python", label: "Python" },
  { value: "sql", label: "SQL" },
  { value: "r", label: "R" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "yaml", label: "YAML" },
  { value: "markdown", label: "Markdown" },
  { value: "diff", label: "Diff" },
  { value: "dockerfile", label: "Dockerfile" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "java", label: "Java" },
  { value: "php", label: "PHP" },
] as const;

/** Tags as typed: trimmed, de-duplicated (case-insensitively), at most 8. */
export function cleanTags(tags: string[]) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of tags) {
    const tag = raw.trim().replace(/\s+/g, " ").slice(0, 32);
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
  }
  return out.slice(0, 8);
}

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  day: "numeric",
  month: "long",
  year: "numeric",
});
const shortFmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** "19 October 2026", in Lagos time. */
export const formatPostDate = (d: Date | string) => dateFmt.format(new Date(d));
/** "19 Oct 2026". */
export const formatPostDateShort = (d: Date | string) => shortFmt.format(new Date(d));
