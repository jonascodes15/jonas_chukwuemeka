"use client";

import { MessageCircle } from "lucide-react";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { SocialIcon } from "@/components/icons/social-icon";
import { whatsappHref } from "@/content/site";
import { cn } from "@/lib/utils";

// The chat's code only downloads when someone shows interest in it.
const loadPanel = () => import("./chat-panel");
const ChatPanel = lazy(loadPanel);

/**
 * WhatsApp and "Ask Jay" buttons, stacked in the bottom-right corner. They appear once the
 * visitor scrolls past the top of the page, so the hero stays clean.
 */
export function FloatingActions({
  available,
  availabilityLabel,
}: {
  available: boolean;
  availabilityLabel: string;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const bubbleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The open chat sits in the same corner and has its own close button, so the buttons step aside.
  const visible = scrolled && !open;

  return (
    <>
      <div
        inert={!visible}
        className={cn(
          "fixed right-4 bottom-4 z-30 flex flex-col items-end gap-3 transition-[opacity,translate] duration-500 ease-out-expo sm:right-6 sm:bottom-6",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <a
          href={whatsappHref()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp (opens in a new tab)"
          data-track="float:whatsapp"
          className="grid size-12 place-items-center rounded-full border border-border-strong bg-surface text-fg shadow-lg transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-fg"
        >
          <SocialIcon name="whatsapp" className="size-5" />
        </a>
        <button
          ref={bubbleRef}
          type="button"
          onClick={() => {
            setMounted(true);
            setOpen(true);
          }}
          onPointerEnter={() => void loadPanel()}
          onFocus={() => void loadPanel()}
          aria-expanded={open}
          aria-controls={mounted ? "chat-panel" : undefined}
          aria-label="Ask Jay a question"
          data-track="float:chat"
          className="grid size-14 place-items-center rounded-full bg-accent text-accent-contrast shadow-[0_12px_40px_-8px_var(--accent-glow)] transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          <MessageCircle aria-hidden className="size-6" />
        </button>
      </div>

      {mounted && (
        <Suspense fallback={null}>
          <ChatPanel
            open={open}
            onClose={() => {
              setOpen(false);
              // The bubble is inert until this render lands, so focus it on the next frame.
              requestAnimationFrame(() => bubbleRef.current?.focus({ preventScroll: true }));
            }}
            available={available}
            availabilityLabel={availabilityLabel}
          />
        </Suspense>
      )}
    </>
  );
}
