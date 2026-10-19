import { emptyDoc, type DocNode } from "@/lib/blog";

/** A post as the editor holds it. Plain module, so server pages can build one too. */
export type EditorPost = {
  id: string | null;
  title: string;
  slug: string;
  excerpt: string;
  content: DocNode;
  coverImage: string | null;
  coverAlt: string | null;
  coverWidth: number | null;
  coverHeight: number | null;
  tags: string[];
  status: "draft" | "published";
  publishedAt: string | null;
  featured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  updatedAt: string | null;
};

export const newPost: EditorPost = {
  id: null,
  title: "",
  slug: "",
  excerpt: "",
  content: emptyDoc,
  coverImage: null,
  coverAlt: null,
  coverWidth: null,
  coverHeight: null,
  tags: [],
  status: "draft",
  publishedAt: null,
  featured: false,
  seoTitle: null,
  seoDescription: null,
  canonicalUrl: null,
  updatedAt: null,
};

export type LinkSuggestion = { label: string; href: string; group: string };
