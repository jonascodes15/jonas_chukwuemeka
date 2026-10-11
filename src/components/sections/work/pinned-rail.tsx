"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Scroll distance (px) the panel stays pinned without sliding, before the first and after the last screen. */
const HOLD = 90;

/**
 * On phones and tablets (below lg, where the screen rail scrolls sideways), this panel pins
 * below the nav once it is fully in view. While pinned, scrolling down slides the rail from the
 * first screen to the last, and scrolling up slides it back; then the page carries on.
 * The wrapper is made taller by the rail's sideways distance (plus a short hold at each end),
 * which is what pays for the pin.
 * Off with reduced motion, and on lg+ where the rail is a static grid.
 */
export function PinnedRail({ className, children }: { className?: string; children: ReactNode }) {
  const outerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const outer = outerRef.current;
    const panel = panelRef.current;
    const rail = panel?.querySelector<HTMLElement>("[data-scroll-rail]");
    if (!outer || !panel || !rail) return;

    const small = window.matchMedia("(max-width: 1023.98px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = false;
    let distance = 0;
    let pinTop = 0;

    const reset = () => {
      outer.style.height = "";
      panel.style.position = "";
      panel.style.top = "";
      rail.style.scrollSnapType = "";
    };

    const sync = () => {
      if (!active) return;
      const scrolled = pinTop - outer.getBoundingClientRect().top - HOLD;
      const progress = Math.min(Math.max(scrolled / distance, 0), 1);
      rail.scrollLeft = progress * distance;
    };

    const measure = () => {
      active = small.matches && !reduce.matches;
      distance = rail.scrollWidth - rail.clientWidth;
      if (!active || distance <= 0) {
        active = false;
        reset();
        return;
      }
      const navHeight = document.querySelector<HTMLElement>('nav[aria-label="Main"]')?.offsetHeight ?? 64;
      // Pin just under the nav; if the panel is taller than the space left, pin it lower so
      // the screens and captions stay in view.
      pinTop = Math.min(navHeight + 12, window.innerHeight - panel.offsetHeight - 12);
      outer.style.height = `${panel.offsetHeight + distance + HOLD * 2}px`;
      panel.style.position = "sticky";
      panel.style.top = `${pinTop}px`;
      // Snapping would fight the scroll-driven position.
      rail.style.scrollSnapType = "none";
      sync();
    };

    measure();
    // Screens load in and change the panel's size; the URL bar on phones changes the viewport.
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    observer.observe(rail);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", sync, { passive: true });
    small.addEventListener("change", measure);
    reduce.addEventListener("change", measure);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", sync);
      small.removeEventListener("change", measure);
      reduce.removeEventListener("change", measure);
      reset();
    };
  }, []);

  return (
    <div ref={outerRef}>
      <div ref={panelRef} className={className}>
        {children}
      </div>
    </div>
  );
}
