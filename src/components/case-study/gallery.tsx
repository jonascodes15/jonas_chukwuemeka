"use client";

import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import { BrowserFrame, PhoneFrame } from "@/components/ui/device-frame";
import { Picture } from "@/components/ui/picture";
import type { Screenshot } from "@/content/types";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Screenshot grid with a full-screen lightbox. Desktop screens come first in browser frames,
 * phone screens after them. The lightbox is a native <dialog>, so Escape, focus trapping and
 * returning focus to the thumbnail come for free. Arrow keys and swipes move between shots.
 */
export function Gallery({ shots, name }: { shots: Screenshot[]; name: string }) {
  const desktops = shots.filter((s) => s.device === "desktop");
  const phones = shots.filter((s) => s.device === "phone");
  // Lightbox order matches the order on screen.
  const ordered = [...desktops, ...phones];

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const swipeStart = useRef<number | null>(null);

  const show = (i: number) => {
    setDirection(1);
    setIndex(i);
    setOpen(true);
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const go = (step: number) => {
    setDirection(step);
    setIndex((i) => (i + step + ordered.length) % ordered.length);
  };

  // Keep the page behind still while the lightbox is open.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  const onPointerDown = (e: PointerEvent) => {
    swipeStart.current = e.clientX;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  const current = ordered[index];
  const many = ordered.length > 1;

  return (
    <>
      {desktops.length > 0 && (
        <RevealGroup as="ul" className={cn("grid gap-6", desktops.length > 1 && "md:grid-cols-2")}>
          {desktops.map((shot, i) => (
            <RevealItem as="li" key={shot.name}>
              <Thumb label={shot.alt} onOpen={() => show(i)}>
                <BrowserFrame
                  shot={shot}
                  sizes={
                    desktops.length > 1
                      ? "(min-width: 1024px) 440px, (min-width: 768px) 45vw, 92vw"
                      : "(min-width: 1024px) 900px, 92vw"
                  }
                  className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-1"
                />
              </Thumb>
              {shot.caption && <p className="mt-3 text-sm leading-relaxed text-muted">{shot.caption}</p>}
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      {phones.length > 0 && (
        <RevealGroup
          as="ul"
          className={cn(
            "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4",
            desktops.length > 0 && "mt-12",
          )}
        >
          {phones.map((shot, i) => (
            <RevealItem as="li" key={shot.name}>
              <Thumb label={shot.alt} onOpen={() => show(desktops.length + i)}>
                <PhoneFrame
                  shot={shot}
                  sizes="(min-width: 1280px) 200px, (min-width: 640px) 28vw, 45vw"
                  className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-1.5"
                />
              </Thumb>
              <p className="mt-3 text-sm leading-snug text-muted">{shot.title ?? shot.caption}</p>
            </RevealItem>
          ))}
        </RevealGroup>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${name} screenshots`}
        onClose={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 text-white backdrop:bg-black/90 backdrop:backdrop-blur-sm open:flex open:flex-col"
      >
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="min-w-0 truncate text-sm">
            <span className="mr-3 font-mono text-xs text-white/60" aria-live="polite">
              {index + 1} / {ordered.length}
            </span>
            {current?.title ?? name}
          </p>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="grid size-10 shrink-0 place-items-center rounded-full border border-white/20 transition-colors hover:bg-white/10"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        <div
          className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center overflow-hidden px-4 sm:px-20"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipeStart.current = null)}
          // Stops a mouse drag from picking up the image, so dragging works as a swipe.
          onDragStart={(e) => e.preventDefault()}
          onClick={(e) => {
            // A tap on the empty area around the image closes the lightbox.
            if (e.target === e.currentTarget) close();
          }}
        >
          {open && current && (
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={current.name}
                custom={direction}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: d * 48 }),
                  center: { opacity: 1, x: 0 },
                  exit: (d: number) => ({ opacity: 0, x: d * -48 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.45, ease: EASE }}
                className="flex max-h-full justify-center"
              >
                <Picture
                  base={`${current.dir}/${current.name}`}
                  widths={current.widths}
                  width={current.width}
                  height={current.height}
                  alt={current.alt}
                  sizes={
                    current.device === "phone"
                      ? "(min-width: 640px) 440px, 80vw"
                      : "(min-width: 1024px) 1280px, 100vw"
                  }
                  eager
                  className="flex max-h-full justify-center"
                  imgClassName={cn(
                    "max-h-[calc(100dvh-9.5rem)] w-auto max-w-full object-contain shadow-2xl",
                    current.device === "phone" ? "rounded-[1.4rem]" : "rounded-lg",
                  )}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {many && (
            <>
              <NavButton side="left" onClick={() => go(-1)} />
              <NavButton side="right" onClick={() => go(1)} />
            </>
          )}
        </div>

        <div className="flex min-h-16 items-center justify-center gap-4 px-4 pt-2 pb-4 sm:px-6">
          {many && <NavButton side="left" onClick={() => go(-1)} inline />}
          <p className="max-w-2xl text-center text-sm leading-relaxed text-white/75">{current?.caption}</p>
          {many && <NavButton side="right" onClick={() => go(1)} inline />}
        </div>
      </dialog>
    </>
  );
}

function Thumb({ label, onOpen, children }: { label: string; onOpen: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={`View larger: ${label}`}
      className="group relative block w-full cursor-zoom-in rounded-xl text-left"
    >
      {children}
      <span
        aria-hidden
        className="absolute top-3 right-3 grid size-9 scale-90 place-items-center rounded-full bg-accent text-accent-contrast opacity-0 shadow-lg transition duration-300 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:scale-100 group-focus-visible:opacity-100"
      >
        <Maximize2 className="size-4" />
      </span>
    </button>
  );
}

/** Side arrows on larger screens; `inline` versions sit beside the caption on phones. */
function NavButton({
  side,
  onClick,
  inline = false,
}: {
  side: "left" | "right";
  onClick: () => void;
  inline?: boolean;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous screenshot" : "Next screenshot"}
      className={cn(
        "grid size-11 shrink-0 place-items-center rounded-full border border-white/20 bg-black/40 transition-colors hover:bg-white/10",
        inline
          ? "sm:hidden"
          : cn("absolute top-1/2 hidden -translate-y-1/2 sm:grid", side === "left" ? "left-4" : "right-4"),
      )}
    >
      <Icon aria-hidden className="size-5" />
    </button>
  );
}
