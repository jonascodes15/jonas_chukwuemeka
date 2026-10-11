"use client";

import { useEffect, useRef, type ReactNode, type Ref } from "react";
import { RevealGroup } from "@/components/motion/reveal";

/**
 * On phones and tablets (below lg, where the rail scrolls sideways), page scrolling also moves
 * the rail: scrolling down slides the screens right to left, scrolling up slides them back.
 * It moves by the scroll delta rather than to a fixed position, so a manual swipe is kept.
 * Off with reduced motion, and on lg+ where the rail is a static grid.
 */
export function ScrollLinkedRail({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    const small = window.matchMedia("(max-width: 1023.98px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const active = () => small.matches && !reduce.matches;

    // Snapping would pull every small programmatic step back to the nearest screen.
    const syncSnap = () => {
      rail.style.scrollSnapType = active() ? "none" : "";
    };
    syncSnap();

    let lastY = window.scrollY;
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const dy = y - lastY;
        lastY = y;
        if (!dy || !active()) return;

        const rect = rail.getBoundingClientRect();
        const vh = window.innerHeight;
        if (rect.bottom <= 0 || rect.top >= vh) return;

        const max = rail.scrollWidth - rail.clientWidth;
        if (max <= 0) return;
        // Reaches the last screen after about 60% of the rail's pass through the viewport.
        rail.scrollLeft += dy * (max / ((vh + rect.height) * 0.6));
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    small.addEventListener("change", syncSnap);
    reduce.addEventListener("change", syncSnap);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      small.removeEventListener("change", syncSnap);
      reduce.removeEventListener("change", syncSnap);
      rail.style.scrollSnapType = "";
    };
  }, []);

  return (
    // RevealGroup types its props as a div whatever element it renders.
    <RevealGroup as="ul" ref={ref as Ref<HTMLDivElement>} aria-label={label} className={className}>
      {children}
    </RevealGroup>
  );
}
