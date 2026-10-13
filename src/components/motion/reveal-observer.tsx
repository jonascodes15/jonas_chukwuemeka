"use client";

import { useEffect } from "react";

const TARGETS = "[data-reveal]:not(.is-revealed), [data-reveal-group]:not(.is-revealed)";

/**
 * The one observer behind every <Reveal> and <RevealGroup>: marks each `is-revealed` the first
 * time it scrolls into view, which starts its CSS transition. It also picks up elements that
 * appear later, after a page change or when streamed content arrives.
 */
export function RevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );

    let frame = 0;
    const scan = () => {
      frame = 0;
      document.querySelectorAll(TARGETS).forEach((el) => io.observe(el));
    };
    scan();

    const mo = new MutationObserver(() => {
      if (!frame) frame = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
