"use client";

import Image from "next/image";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// The chat's code only downloads when someone shows interest in it.
const loadPanel = () => import("./chat-panel");
const ChatPanel = lazy(loadPanel);

/**
 * The "Ask Jay" launcher in the bottom-right corner. It appears once the visitor scrolls past
 * the top of the page, so the hero stays clean.
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
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 240);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The open chat sits in the same corner and has its own close button, so the launcher steps aside.
  const visible = scrolled && !open;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        inert={!visible}
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
        className={cn(
          "group fixed right-4 bottom-4 z-30 flex items-center gap-3 rounded-pill border border-border-strong bg-surface/80 py-1.5 pr-5 pl-1.5 shadow-[0_18px_50px_-12px_rgb(var(--shadow-color)/0.55)] backdrop-blur-xl backdrop-saturate-150 sm:right-6 sm:bottom-6",
          "transition-[opacity,translate,border-color] duration-500 ease-out-expo hover:-translate-y-0.5 hover:border-accent-ink",
          visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        )}
      >
        <span aria-hidden className="relative grid size-11 shrink-0 place-items-center">
          {/* A slowly turning lime ring around the photo. */}
          <span className="absolute inset-0 animate-[spin_6s_linear_infinite] rounded-full bg-[conic-gradient(from_0deg,var(--accent),transparent_35%,transparent_65%,var(--accent))] motion-reduce:animate-none" />
          <Image
            src="/images/me.jpg"
            alt=""
            width={40}
            height={40}
            sizes="40px"
            className="relative size-9.5 rounded-full border-2 border-surface object-cover object-top"
          />
          {available && (
            <span className="absolute right-0 bottom-0 size-3 rounded-full border-2 border-surface bg-accent" />
          )}
        </span>
        <span className="text-sm leading-tight font-semibold tracking-tight text-fg">Ask Jay</span>
      </button>

      {mounted && (
        <Suspense fallback={null}>
          <ChatPanel
            open={open}
            onClose={() => {
              setOpen(false);
              // The launcher is inert until this render lands, so focus it on the next frame.
              requestAnimationFrame(() => buttonRef.current?.focus({ preventScroll: true }));
            }}
            available={available}
            availabilityLabel={availabilityLabel}
          />
        </Suspense>
      )}
    </>
  );
}
