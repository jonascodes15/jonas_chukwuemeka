"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";
import { FaLinkedin } from "react-icons/fa6";
import { SiWhatsapp, SiX } from "react-icons/si";
import { cn } from "@/lib/utils";

/** Plain share links (no third-party scripts), plus copy link and the phone's own share sheet. */
export function ShareButtons({
  url,
  title,
  className,
  vertical,
}: {
  url: string;
  title: string;
  className?: string;
  vertical?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);
  const item =
    "grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-fg hover:text-fg";

  const targets = [
    {
      label: "Share on X",
      href: `https://x.com/intent/post?text=${text}&url=${link}&via=JCK_ng`,
      icon: SiX,
      key: "x",
    },
    {
      label: "Share on LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
      icon: FaLinkedin,
      key: "linkedin",
    },
    {
      label: "Share on WhatsApp",
      href: `https://wa.me/?text=${text}%20${link}`,
      icon: SiWhatsapp,
      key: "whatsapp",
    },
  ];

  return (
    <ul className={cn("flex gap-2", vertical && "flex-col", className)} aria-label="Share this post">
      {targets.map((t) => (
        <li key={t.key}>
          <a
            href={t.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${t.label} (opens in a new tab)`}
            data-track={`blog:share-${t.key}`}
            className={item}
          >
            <t.icon className="size-4" />
          </a>
        </li>
      ))}
      <li>
        <button
          type="button"
          aria-label={copied ? "Link copied" : "Copy link"}
          data-track="blog:share-copy"
          onClick={() => {
            navigator.clipboard
              ?.writeText(url)
              .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 1800);
              })
              .catch(() => {});
          }}
          className={item}
        >
          {copied ? <Check className="size-4 text-accent-ink" /> : <Link2 className="size-4" />}
        </button>
      </li>
      <li className="sm:hidden">
        <button
          type="button"
          aria-label="More ways to share"
          data-track="blog:share-native"
          onClick={() => navigator.share?.({ title, url }).catch(() => {})}
          className={item}
        >
          <Share2 className="size-4" />
        </button>
      </li>
    </ul>
  );
}
