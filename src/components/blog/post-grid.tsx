"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { PostSummary } from "@/server/blog";
import { PostCard } from "./post-card";

/** Every post as cards, with tag filters above. Filtering happens here, so the page stays static. */
export function PostGrid({ posts, tags }: { posts: PostSummary[]; tags: { tag: string; count: number }[] }) {
  const [active, setActive] = useState<string | null>(null);
  const shown = active ? posts.filter((p) => p.tags.includes(active)) : posts;

  return (
    <>
      {tags.length > 1 && (
        <div
          role="group"
          aria-label="Filter by topic"
          className="no-scrollbar -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1"
        >
          {[{ tag: null, count: posts.length }, ...tags].map(({ tag, count }) => {
            const on = active === tag;
            return (
              <button
                key={tag ?? "all"}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(tag)}
                className={cn(
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-pill border px-4 text-sm transition-colors",
                  on
                    ? "border-fg bg-fg text-bg"
                    : "border-border text-muted hover:border-border-strong hover:text-fg",
                )}
              >
                {tag ?? "All posts"}
                <span className="font-mono text-xs opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((p) => (
          <li key={p.id}>
            <PostCard post={p} headingLevel="h3" />
          </li>
        ))}
      </ul>
    </>
  );
}
