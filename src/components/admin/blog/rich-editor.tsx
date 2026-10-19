"use client";

import { Extension, type Editor } from "@tiptap/core";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  ExternalLink,
  Highlighter,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Loader2,
  Minus,
  Pencil,
  Quote,
  Redo2,
  RemoveFormatting,
  Replace,
  SquareCode,
  Strikethrough,
  Trash2,
  Underline,
  Undo2,
  Unlink,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SiYoutube } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { inputClasses } from "@/components/ui/field";
import { CODE_LANGUAGES, youtubeId, type DocNode } from "@/lib/blog";
import { cn } from "@/lib/utils";
import { ErrorNote, MediaPicker, type PickedImage } from "./media-picker";
import { Modal } from "./modal";
import type { LinkSuggestion } from "./types";
import { altFromFileName, uploadImage } from "./upload";

/** Images carry a layout too: small, normal (the text column) or wide. */
const PostImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      layout: {
        default: "normal",
        parseHTML: (el) => el.getAttribute("data-layout") ?? "normal",
        renderHTML: (attrs) => ({ "data-layout": attrs.layout }),
      },
    };
  },
});

type Props = {
  initialContent: DocNode;
  onChange: (doc: DocNode) => void;
  linkSuggestions: LinkSuggestion[];
  toolbarEnd?: ReactNode;
  className?: string;
};

export function RichEditor({ initialContent, onChange, linkSuggestions, toolbarEnd, className }: Props) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [picker, setPicker] = useState<null | "insert" | "replace">(null);
  const [uploading, setUploading] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);

  // Called from editor plugins created once, so they reach the latest handlers through refs.
  const openLink = useRef<() => void>(() => {});
  const uploadFiles = useRef<(files: File[], pos?: number) => void>(() => {});

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        codeBlock: { defaultLanguage: "text" },
        dropcursor: { color: "var(--accent-ink)", width: 3 },
        link: {
          openOnClick: false,
          autolink: true,
          linkOnPaste: true,
          defaultProtocol: "https",
          HTMLAttributes: { target: null, rel: null },
        },
      }),
      PostImage.configure({ inline: false, allowBase64: false }),
      Youtube.configure({ nocookie: true, controls: true, width: 640, height: 360 }),
      TextAlign.configure({ types: ["heading", "paragraph"], alignments: ["left", "center", "right"] }),
      Highlight,
      Placeholder.configure({
        placeholder: ({ editor: e, node }) =>
          node.type.name === "heading"
            ? "Heading"
            : e.isEmpty
              ? "Start writing. Type ## for a heading, - for a list, > for a quote, ``` for code. Paste or drop images straight in."
              : "",
      }),
      Extension.create({
        name: "postShortcuts",
        addKeyboardShortcuts: () => ({
          "Mod-k": () => {
            openLink.current();
            return true;
          },
        }),
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: { class: "prose-post", "aria-label": "Post body", spellcheck: "true" },
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData);
        if (!files.length) return false;
        event.preventDefault();
        uploadFiles.current(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = imageFiles(event.dataTransfer);
        if (!files.length) return false;
        event.preventDefault();
        uploadFiles.current(files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos);
        return true;
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getJSON() as DocNode),
  });

  useEffect(() => {
    openLink.current = () => setLinkOpen(true);
    uploadFiles.current = async (files, pos) => {
      if (!editor) return;
      setNotice(null);
      for (const file of files) {
        setUploading((n) => n + 1);
        const res = await uploadImage(file, altFromFileName(file.name));
        setUploading((n) => n - 1);
        if (!res.ok) {
          setNotice(res.message);
          continue;
        }
        const node = {
          type: "image",
          attrs: { src: res.item.url, alt: res.item.alt, width: res.item.width, height: res.item.height },
        };
        if (pos !== undefined) editor.chain().focus().insertContentAt(pos, node).run();
        else editor.chain().focus().insertContent(node).run();
      }
    };
  }, [editor]);

  const insertImage = (img: PickedImage) => {
    if (!editor) return;
    const attrs = { src: img.src, alt: img.alt, width: img.width ?? null, height: img.height ?? null };
    if (picker === "replace") editor.chain().focus().updateAttributes("image", attrs).run();
    else editor.chain().focus().insertContent({ type: "image", attrs }).run();
  };

  return (
    <div className={cn("post-editor", className)}>
      <Toolbar
        editor={editor}
        onLink={() => setLinkOpen(true)}
        onImage={() => setPicker("insert")}
        onVideo={() => setVideoOpen(true)}
        end={toolbarEnd}
      />

      {(uploading > 0 || notice) && (
        <div aria-live="polite" className="mt-3">
          {uploading > 0 ? (
            <p className="inline-flex items-center gap-2 rounded-pill border border-border bg-surface px-3 py-1.5 text-sm text-muted">
              <Loader2 aria-hidden className="size-4 animate-spin text-accent-ink" />
              Uploading {uploading > 1 ? `${uploading} images` : "image"}...
            </p>
          ) : (
            notice && <ErrorNote message={notice} />
          )}
        </div>
      )}

      <div className="mt-6">
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="min-h-[28rem] animate-pulse rounded-2xl bg-surface-2/40" />
        )}
      </div>

      {editor && (
        <>
          <TextBubble editor={editor} onLink={() => setLinkOpen(true)} />
          <ImageBubble editor={editor} onReplace={() => setPicker("replace")} />
          <VideoBubble editor={editor} />
        </>
      )}

      {editor && (
        <LinkDialog
          open={linkOpen}
          onClose={() => setLinkOpen(false)}
          editor={editor}
          suggestions={linkSuggestions}
        />
      )}
      {editor && <VideoDialog open={videoOpen} onClose={() => setVideoOpen(false)} editor={editor} />}
      <MediaPicker
        open={picker !== null}
        onClose={() => setPicker(null)}
        onPick={insertImage}
        title={picker === "replace" ? "Replace image" : "Add an image"}
      />
    </div>
  );
}

function imageFiles(data: DataTransfer | null) {
  return Array.from(data?.files ?? []).filter((f) => f.type.startsWith("image/"));
}

// --- Toolbar ----------------------------------------------------------------

function Tool({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      // Keeps the text selection in the editor while clicking.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg transition-colors disabled:opacity-35 [&_svg]:size-4",
        active ? "bg-fg text-bg" : "text-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      {children}
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />;

const selectClasses =
  "h-8 shrink-0 rounded-lg border border-border bg-bg px-2 text-sm text-fg outline-none hover:border-border-strong focus-visible:border-accent-ink";

function Toolbar({
  editor,
  onLink,
  onImage,
  onVideo,
  end,
}: {
  editor: Editor | null;
  onLink: () => void;
  onImage: () => void;
  onVideo: () => void;
  end?: ReactNode;
}) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            block: e.isActive("heading", { level: 2 })
              ? "h2"
              : e.isActive("heading", { level: 3 })
                ? "h3"
                : e.isActive("heading", { level: 4 })
                  ? "h4"
                  : "p",
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            strike: e.isActive("strike"),
            code: e.isActive("code"),
            highlight: e.isActive("highlight"),
            link: e.isActive("link"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            codeBlock: e.isActive("codeBlock"),
            codeLang: e.isActive("codeBlock")
              ? String(e.getAttributes("codeBlock").language ?? "text")
              : null,
            center: e.isActive({ textAlign: "center" }),
            right: e.isActive({ textAlign: "right" }),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  const run = (fn: (e: Editor) => void) => () => editor && fn(editor);
  const off = !editor || !s;

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="z-20 flex flex-wrap items-center gap-0.5 rounded-2xl border border-border bg-surface/95 p-1.5 shadow-sm backdrop-blur lg:sticky lg:top-4"
    >
      <Tool
        label="Undo (Ctrl+Z)"
        disabled={off || !s?.canUndo}
        onClick={run((e) => e.chain().focus().undo().run())}
      >
        <Undo2 />
      </Tool>
      <Tool
        label="Redo (Ctrl+Shift+Z)"
        disabled={off || !s?.canRedo}
        onClick={run((e) => e.chain().focus().redo().run())}
      >
        <Redo2 />
      </Tool>
      <Divider />
      <select
        aria-label="Text style"
        value={s?.block ?? "p"}
        disabled={off}
        onChange={(ev) => {
          if (!editor) return;
          const v = ev.target.value;
          const c = editor.chain().focus();
          if (v === "p") c.setParagraph().run();
          else c.setHeading({ level: Number(v.slice(1)) as 2 | 3 | 4 }).run();
        }}
        className={cn(selectClasses, "w-32")}
      >
        <option value="p">Paragraph</option>
        <option value="h2">Heading</option>
        <option value="h3">Subheading</option>
        <option value="h4">Small heading</option>
      </select>
      <Divider />
      <Tool
        label="Bold (Ctrl+B)"
        active={s?.bold}
        disabled={off}
        onClick={run((e) => e.chain().focus().toggleBold().run())}
      >
        <Bold />
      </Tool>
      <Tool
        label="Italic (Ctrl+I)"
        active={s?.italic}
        disabled={off}
        onClick={run((e) => e.chain().focus().toggleItalic().run())}
      >
        <Italic />
      </Tool>
      <Tool
        label="Underline (Ctrl+U)"
        active={s?.underline}
        disabled={off}
        onClick={run((e) => e.chain().focus().toggleUnderline().run())}
      >
        <Underline />
      </Tool>
      <Tool
        label="Strikethrough"
        active={s?.strike}
        disabled={off}
        onClick={run((e) => e.chain().focus().toggleStrike().run())}
      >
        <Strikethrough />
      </Tool>
      <Tool
        label="Inline code (Ctrl+E)"
        active={s?.code}
        disabled={off}
        onClick={run((e) => e.chain().focus().toggleCode().run())}
      >
        <Code />
      </Tool>
      <Tool
        label="Highlight"
        active={s?.highlight}
        disabled={off}
        onClick={run((e) => e.chain().focus().toggleHighlight().run())}
      >
        <Highlighter />
      </Tool>
      <Divider />
      <Tool label="Link (Ctrl+K)" active={s?.link} disabled={off} onClick={onLink}>
        <LinkIcon />
      </Tool>
      <Tool
        label="Remove link"
        disabled={off || !s?.link}
        onClick={run((e) => e.chain().focus().extendMarkRange("link").unsetLink().run())}
      >
        <Unlink />
      </Tool>
      <Divider />
      <Tool
        label="Align left"
        active={!!s && !s.center && !s.right}
        disabled={off}
        onClick={run((e) => e.chain().focus().unsetTextAlign().run())}
      >
        <AlignLeft />
      </Tool>
      <Tool
        label="Centre"
        active={s?.center}
        disabled={off}
        onClick={run((e) => e.chain().focus().setTextAlign("center").run())}
      >
        <AlignCenter />
      </Tool>
      <Tool
        label="Align right"
        active={s?.right}
        disabled={off}
        onClick={run((e) => e.chain().focus().setTextAlign("right").run())}
      >
        <AlignRight />
      </Tool>
      <Divider />
      <Tool
        label="Bulleted list"
        active={s?.bullet}
        disabled={off}
        onClick={run((e) => e.chain().focus().toggleBulletList().run())}
      >
        <List />
      </Tool>
      <Tool
        label="Numbered list"
        active={s?.ordered}
        disabled={off}
        onClick={run((e) => e.chain().focus().toggleOrderedList().run())}
      >
        <ListOrdered />
      </Tool>
      <Tool
        label="Quote"
        active={s?.quote}
        disabled={off}
        onClick={run((e) => e.chain().focus().toggleBlockquote().run())}
      >
        <Quote />
      </Tool>
      <Tool
        label="Code block"
        active={s?.codeBlock}
        disabled={off}
        onClick={run((e) => e.chain().focus().toggleCodeBlock().run())}
      >
        <SquareCode />
      </Tool>
      {s?.codeLang !== null && s?.codeLang !== undefined && (
        <select
          aria-label="Code language"
          value={s.codeLang}
          onChange={(ev) =>
            editor?.chain().focus().updateAttributes("codeBlock", { language: ev.target.value }).run()
          }
          className={cn(selectClasses, "w-32")}
        >
          {CODE_LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      )}
      <Tool
        label="Divider line"
        disabled={off}
        onClick={run((e) => e.chain().focus().setHorizontalRule().run())}
      >
        <Minus />
      </Tool>
      <Divider />
      <Tool label="Image" disabled={off} onClick={onImage}>
        <ImagePlus />
      </Tool>
      <Tool label="YouTube video" disabled={off} onClick={onVideo}>
        <SiYoutube />
      </Tool>
      <Tool
        label="Clear formatting"
        disabled={off}
        onClick={run((e) => e.chain().focus().unsetAllMarks().clearNodes().run())}
      >
        <RemoveFormatting />
      </Tool>
      {end && <div className="ml-auto flex items-center gap-0.5">{end}</div>}
    </div>
  );
}

// --- Bubble menus -----------------------------------------------------------

const bubbleClasses =
  "flex items-center gap-0.5 rounded-xl border border-border bg-surface p-1 shadow-xl shadow-black/10";

/** Over selected text, or with the cursor in a link: quick formatting and the link's address. */
function TextBubble({ editor, onLink }: { editor: Editor; onLink: () => void }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      highlight: e.isActive("highlight"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      href: String(e.getAttributes("link").href ?? ""),
    }),
  });
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="textBubble"
      shouldShow={({ editor: e, from, to }) =>
        !e.isActive("image") &&
        !e.isActive("youtube") &&
        !e.isActive("codeBlock") &&
        (from !== to || e.isActive("link"))
      }
      options={{ placement: "top", offset: 8 }}
      className={bubbleClasses}
    >
      {s.link && (
        <>
          <a
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex max-w-56 items-center gap-1.5 truncate rounded-lg px-2 py-1 text-xs text-accent-ink hover:bg-surface-2"
          >
            <ExternalLink aria-hidden className="size-3.5 shrink-0" />
            <span className="truncate">{s.href}</span>
          </a>
          <Tool label="Edit link" onClick={onLink}>
            <Pencil />
          </Tool>
          <Tool
            label="Remove link"
            onClick={() => editor.chain().focus().extendMarkRange("link").unsetLink().run()}
          >
            <Unlink />
          </Tool>
          <Divider />
        </>
      )}
      <Tool label="Bold" active={s.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold />
      </Tool>
      <Tool label="Italic" active={s.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic />
      </Tool>
      <Tool
        label="Highlight"
        active={s.highlight}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        <Highlighter />
      </Tool>
      <Tool label="Inline code" active={s.code} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code />
      </Tool>
      {!s.link && (
        <Tool label="Add link (Ctrl+K)" onClick={onLink}>
          <LinkIcon />
        </Tool>
      )}
    </BubbleMenu>
  );
}

/** With an image selected: alt text, caption, size, replace and remove. */
function ImageBubble({ editor, onReplace }: { editor: Editor; onReplace: () => void }) {
  const a = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      const attrs = e.getAttributes("image");
      return {
        alt: String(attrs.alt ?? ""),
        title: String(attrs.title ?? ""),
        layout: String(attrs.layout ?? "normal"),
      };
    },
  });
  // No focus() here: typing stays in the field while the image stays selected.
  const set = (attrs: Record<string, string>) => editor.chain().updateAttributes("image", attrs).run();
  const small =
    "h-8 rounded-lg border border-border bg-bg px-2.5 text-sm text-fg outline-none focus-visible:border-accent-ink";

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageBubble"
      shouldShow={({ editor: e }) => e.isActive("image")}
      options={{ placement: "bottom", offset: 10 }}
      className="w-[min(30rem,calc(100vw-2rem))] space-y-2 rounded-xl border border-border bg-surface p-3 shadow-xl shadow-black/10"
    >
      <label className="flex items-center gap-2 text-xs text-muted">
        <span className="w-14 shrink-0">Alt text</span>
        <input
          value={a.alt}
          onChange={(e) => set({ alt: e.target.value })}
          placeholder="What the image shows"
          className={cn(small, "min-w-0 flex-1")}
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-muted">
        <span className="w-14 shrink-0">Caption</span>
        <input
          value={a.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="Shown under the image (optional)"
          className={cn(small, "min-w-0 flex-1")}
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex gap-1" role="group" aria-label="Image size">
          {(["small", "normal", "wide"] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={a.layout === l}
              onClick={() => set({ layout: l })}
              className={cn(
                "h-8 rounded-lg px-2.5 text-xs capitalize transition-colors",
                a.layout === l ? "bg-fg text-bg" : "border border-border text-muted hover:text-fg",
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          <Tool label="Replace image" onClick={onReplace}>
            <Replace />
          </Tool>
          <Tool label="Remove image" onClick={() => editor.chain().focus().deleteSelection().run()}>
            <Trash2 />
          </Tool>
        </div>
      </div>
    </BubbleMenu>
  );
}

function VideoBubble({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="videoBubble"
      shouldShow={({ editor: e }) => e.isActive("youtube")}
      options={{ placement: "bottom", offset: 10 }}
      className={bubbleClasses}
    >
      <Tool label="Remove video" onClick={() => editor.chain().focus().deleteSelection().run()}>
        <Trash2 />
      </Tool>
    </BubbleMenu>
  );
}

// --- Dialogs ----------------------------------------------------------------

/** "example.com" -> "https://example.com"; paths, anchors, email and phone links stay as typed. */
function normaliseHref(raw: string) {
  const v = raw.trim();
  if (!v) return "";
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(v)) return v;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return `mailto:${v}`;
  return `https://${v}`;
}

function LinkDialog({
  open,
  onClose,
  editor,
  suggestions,
}: {
  open: boolean;
  onClose: () => void;
  editor: Editor;
  suggestions: LinkSuggestion[];
}) {
  return (
    <Modal open={open} onClose={onClose} title="Link">
      {/* Mounted fresh on each open, so the fields start from the current selection. */}
      {open && <LinkForm editor={editor} suggestions={suggestions} onDone={onClose} />}
    </Modal>
  );
}

function LinkForm({
  editor,
  suggestions,
  onDone,
}: {
  editor: Editor;
  suggestions: LinkSuggestion[];
  onDone: () => void;
}) {
  const current = editor.getAttributes("link");
  const hasSelection = !editor.state.selection.empty || editor.isActive("link");
  const [href, setHref] = useState(String(current.href ?? ""));
  const [text, setText] = useState("");
  const [newTab, setNewTab] = useState(current.target === "_blank");
  const [nofollow, setNofollow] = useState(String(current.rel ?? "").includes("nofollow"));
  const [error, setError] = useState<string | null>(null);

  const q = href.trim().toLowerCase();
  const matches = suggestions
    .filter((s) => !q || s.label.toLowerCase().includes(q) || s.href.toLowerCase().includes(q))
    .slice(0, 8);
  const isExternal = /^https?:/i.test(normaliseHref(href));

  const apply = () => {
    const url = normaliseHref(href);
    if (!url) return setError("Add a web address, a page on this site, or an email.");
    const attrs = {
      href: url,
      target: newTab ? "_blank" : null,
      rel: nofollow ? "nofollow" : null,
    };
    if (hasSelection) {
      editor.chain().focus().extendMarkRange("link").setLink(attrs).run();
    } else {
      editor
        .chain()
        .focus()
        .insertContent({ type: "text", text: text.trim() || url, marks: [{ type: "link", attrs }] })
        .insertContent(" ")
        .run();
    }
    onDone();
  };

  return (
    <div
      className="space-y-4"
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          apply();
        }
      }}
    >
      {!hasSelection && (
        <label className="block">
          <span className="text-sm font-medium text-fg">Text to show</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Defaults to the address"
            className={cn(inputClasses, "mt-2")}
          />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-medium text-fg">Address</span>
        <input
          value={href}
          onChange={(e) => {
            setHref(e.target.value);
            setError(null);
          }}
          placeholder="https://..., /blog/a-post, or search this site"
          className={cn(inputClasses, "mt-2")}
          data-autofocus
        />
      </label>

      {matches.length > 0 && (
        <div>
          <p className="mb-2 font-mono text-[0.68rem] tracking-[0.14em] text-muted uppercase">On this site</p>
          <ul className="max-h-48 overflow-y-auto rounded-xl border border-border">
            {matches.map((m) => (
              <li key={m.href} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => {
                    setHref(m.href);
                    setNewTab(false);
                  }}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm hover:bg-surface-2"
                >
                  <span className="truncate text-fg">{m.label}</span>
                  <span className="shrink-0 font-mono text-[0.68rem] text-muted">{m.group}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        <label className="flex items-center gap-2.5 text-sm text-fg">
          <input
            type="checkbox"
            checked={newTab}
            onChange={(e) => setNewTab(e.target.checked)}
            className="size-4 accent-accent-ink"
          />
          Open in a new tab
        </label>
        {isExternal && (
          <label className="flex items-center gap-2.5 text-sm text-fg">
            <input
              type="checkbox"
              checked={nofollow}
              onChange={(e) => setNofollow(e.target.checked)}
              className="size-4 accent-accent-ink"
            />
            <span>
              Nofollow <span className="text-muted">(for sponsored or untrusted links)</span>
            </span>
          </label>
        )}
      </div>

      {error && <ErrorNote message={error} />}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={apply}>
          {current.href ? "Update link" : "Add link"}
        </Button>
        {current.href && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              editor.chain().focus().extendMarkRange("link").unsetLink().run();
              onDone();
            }}
          >
            Remove link
          </Button>
        )}
      </div>
    </div>
  );
}

function VideoDialog({ open, onClose, editor }: { open: boolean; onClose: () => void; editor: Editor }) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const close = () => {
    setUrl("");
    setError(null);
    onClose();
  };
  const apply = () => {
    if (!youtubeId(url)) return setError("That doesn't look like a YouTube video address.");
    editor.chain().focus().setYoutubeVideo({ src: url.trim() }).run();
    close();
  };
  return (
    <Modal open={open} onClose={close} title="Embed a YouTube video">
      <div
        className="space-y-4"
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply();
          }
        }}
      >
        <label className="block">
          <span className="text-sm font-medium text-fg">Video address</span>
          <input
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setError(null);
            }}
            placeholder="https://www.youtube.com/watch?v=..."
            className={cn(inputClasses, "mt-2")}
            data-autofocus
          />
        </label>
        <p className="text-xs text-muted">
          Embedded in privacy-enhanced mode: YouTube sets no cookies until the reader presses play.
        </p>
        {error && <ErrorNote message={error} />}
        <Button type="button" onClick={apply}>
          Embed video
        </Button>
      </div>
    </Modal>
  );
}
