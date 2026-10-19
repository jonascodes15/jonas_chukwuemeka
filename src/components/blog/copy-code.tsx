"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard
          ?.writeText(code)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          })
          .catch(() => {});
      }}
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors hover:bg-surface-2 hover:text-fg"
      data-track="blog:copy-code"
    >
      {copied ? (
        <Check aria-hidden className="size-3.5 text-accent-ink" />
      ) : (
        <Copy aria-hidden className="size-3.5" />
      )}
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
