import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Fades and lifts its children in on page load, in CSS only (the `enter` keyframes in
 * globals.css). Use it above the fold instead of <Reveal>: Reveal waits for JavaScript, which
 * holds back the page's largest text on slow phones. Reduced motion is handled globally.
 */
export function Enter({
  delay = 0,
  y = 16,
  className,
  children,
}: {
  delay?: number;
  y?: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("animate-enter", className)}
      style={{ "--enter-delay": `${delay}s`, "--enter-y": `${y}px` } as CSSProperties}
    >
      {children}
    </div>
  );
}
