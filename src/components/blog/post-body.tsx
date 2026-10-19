import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { bundledLanguages, codeToHtml } from "shiki";
import {
  CODE_LANGUAGES,
  headingMap,
  nodeText,
  safeHref,
  safeImageSrc,
  youtubeId,
  type DocMark,
  type DocNode,
  type Heading,
} from "@/lib/blog";
import { CopyCode } from "./copy-code";

/**
 * Renders a post's document on the server. Nothing from the post is ever inserted as raw HTML:
 * each node type maps to a React element, links and images are checked (src/lib/blog.ts), and
 * unknown node types are skipped. The one exception is code, which Shiki escapes itself.
 */

type Ctx = { ids: Map<DocNode, Heading>; code: Map<DocNode, string> };

const ALIGN = new Set(["left", "center", "right", "justify"]);

function alignStyle(node: DocNode): CSSProperties | undefined {
  const a = node.attrs?.textAlign;
  return typeof a === "string" && ALIGN.has(a) && a !== "left" ? { textAlign: a as "center" } : undefined;
}

const languageLabel = (lang: string) =>
  CODE_LANGUAGES.find((l) => l.value === lang)?.label ?? (lang === "text" ? "Plain text" : lang);

function codeLanguage(node: DocNode) {
  const lang = String(node.attrs?.language ?? "text").toLowerCase();
  return lang in bundledLanguages ? lang : "text";
}

/**
 * Cached by code and language. Shiki reads the clock while it works, which a static render
 * doesn't allow outside a cache, and the same block never needs highlighting twice anyway.
 */
async function highlight(code: string, lang: string) {
  "use cache";
  cacheLife("max");
  try {
    return await codeToHtml(code, {
      lang,
      themes: { light: "github-light", dark: "github-dark-default" },
      // Colours come out as CSS variables; globals.css picks the set for the current theme.
      defaultColor: false,
    });
  } catch {
    return "";
  }
}

/** Highlights every code block up front, since rendering below is synchronous. */
async function highlightAll(doc: DocNode) {
  const blocks: DocNode[] = [];
  const walk = (n: DocNode) => {
    if (n.type === "codeBlock") blocks.push(n);
    else n.content?.forEach(walk);
  };
  walk(doc);
  const html = await Promise.all(blocks.map((b) => highlight(nodeText(b), codeLanguage(b))));
  return new Map(blocks.map((b, i) => [b, html[i]]));
}

function renderMarks(text: ReactNode, marks: DocMark[] = [], key: string): ReactNode {
  // Links wrap everything else, so a bold word inside a link stays one link.
  const ordered = [...marks].sort((a, b) => Number(a.type === "link") - Number(b.type === "link"));
  return ordered.reduce<ReactNode>((child, mark, i) => {
    const k = `${key}-${i}`;
    switch (mark.type) {
      case "bold":
        return <strong key={k}>{child}</strong>;
      case "italic":
        return <em key={k}>{child}</em>;
      case "underline":
        return <u key={k}>{child}</u>;
      case "strike":
        return <s key={k}>{child}</s>;
      case "code":
        return <code key={k}>{child}</code>;
      case "highlight":
        return <mark key={k}>{child}</mark>;
      case "link":
        return (
          <PostLink key={k} attrs={mark.attrs}>
            {child}
          </PostLink>
        );
      default:
        return child;
    }
  }, text);
}

function PostLink({ attrs, children }: { attrs?: Record<string, unknown>; children: ReactNode }) {
  const href = safeHref(attrs?.href);
  if (!href) return <>{children}</>;
  const newTab = attrs?.target === "_blank";
  if (href.startsWith("/") && !newTab) return <Link href={href}>{children}</Link>;

  const rel = new Set(
    String(attrs?.rel ?? "")
      .split(/\s+/)
      .filter((r) => ["nofollow", "sponsored", "ugc"].includes(r)),
  );
  if (newTab) {
    rel.add("noopener");
    rel.add("noreferrer");
  }
  return (
    <a href={href} target={newTab ? "_blank" : undefined} rel={rel.size ? [...rel].join(" ") : undefined}>
      {children}
      {newTab && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

function PostImage({ node }: { node: DocNode }) {
  const src = safeImageSrc(node.attrs?.src);
  if (!src) return null;
  const alt = String(node.attrs?.alt ?? "");
  const caption = typeof node.attrs?.title === "string" ? node.attrs.title.trim() : "";
  const width = Number(node.attrs?.width) || 0;
  const height = Number(node.attrs?.height) || 0;
  const layout =
    node.attrs?.layout === "wide" || node.attrs?.layout === "small" ? node.attrs.layout : "normal";

  return (
    <figure data-layout={layout}>
      {src.startsWith("/media/") && width && height ? (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={layout === "wide" ? "(min-width: 1024px) 960px, 100vw" : "(min-width: 768px) 720px, 100vw"}
        />
      ) : (
        // Images linked from other sites have no known size, so next/image can't reserve space for them.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}

function YouTube({ node }: { node: DocNode }) {
  const id = youtubeId(node.attrs?.src);
  if (!id) return null;
  const start = Number(node.attrs?.start) || 0;
  return (
    <figure data-layout="normal">
      <div className="video">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}${start ? `?start=${start}` : ""}`}
          title="YouTube video"
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      </div>
    </figure>
  );
}

function renderNode(node: DocNode, key: string, ctx: Ctx): ReactNode {
  const children = () => node.content?.map((c, i) => renderNode(c, `${key}-${i}`, ctx));

  switch (node.type) {
    case "text":
      return renderMarks(node.text ?? "", node.marks, key);
    case "hardBreak":
      return <br key={key} />;
    case "paragraph":
      if (!node.content?.length) return null;
      return (
        <p key={key} style={alignStyle(node)}>
          {children()}
        </p>
      );
    case "heading": {
      const level = Math.min(4, Math.max(2, Number(node.attrs?.level ?? 2)));
      const Tag = `h${level}` as "h2" | "h3" | "h4";
      const heading = ctx.ids.get(node);
      return (
        <Tag key={key} id={heading?.id} style={alignStyle(node)}>
          {heading ? (
            <a href={`#${heading.id}`} className="heading-anchor">
              {children()}
            </a>
          ) : (
            children()
          )}
        </Tag>
      );
    }
    case "bulletList":
      return <ul key={key}>{children()}</ul>;
    case "orderedList": {
      const start = Number(node.attrs?.start ?? 1);
      return (
        <ol key={key} start={start !== 1 ? start : undefined}>
          {children()}
        </ol>
      );
    }
    case "listItem":
      return <li key={key}>{children()}</li>;
    case "blockquote":
      return <blockquote key={key}>{children()}</blockquote>;
    case "horizontalRule":
      return <hr key={key} />;
    case "image":
      return <PostImage key={key} node={node} />;
    case "youtube":
      return <YouTube key={key} node={node} />;
    case "codeBlock": {
      const lang = codeLanguage(node);
      const html = ctx.code.get(node);
      const code = nodeText(node);
      return (
        <div key={key} className="code-block">
          <div className="code-block-bar">
            <span>{languageLabel(lang)}</span>
            <CopyCode code={code} />
          </div>
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <pre>
              <code>{code}</code>
            </pre>
          )}
        </div>
      );
    }
    default:
      return null;
  }
}

export async function PostBody({ doc }: { doc: DocNode }) {
  const ctx: Ctx = { ids: headingMap(doc), code: await highlightAll(doc) };
  return <div className="prose-post">{doc.content?.map((n, i) => renderNode(n, String(i), ctx))}</div>;
}
