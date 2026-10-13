"use client";

import { useEffect } from "react";

/**
 * Scrolls "/#section" links to their section on the current page. Left to the router, a click
 * on a link whose hash is already in the URL does nothing, so "Get in touch" worked once and
 * then stuck until a refresh. Runs in the capture phase so next/link sees defaultPrevented
 * and stays out of it. CSS scroll-behavior and scroll-padding-top still apply.
 */
export function SectionLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {
        return;
      }
      if (!(e.target instanceof Element)) return;
      const link = e.target.closest<HTMLAnchorElement>('a[href^="/#"]');
      if (!link || link.target === "_blank") return;

      const url = new URL(link.href);
      if (url.pathname !== location.pathname) return;
      const section = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!section) return;

      e.preventDefault();
      section.scrollIntoView({ block: "start" });
      // Keep the router's state object so back/forward still work.
      history.replaceState(history.state, "", url.hash);
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
