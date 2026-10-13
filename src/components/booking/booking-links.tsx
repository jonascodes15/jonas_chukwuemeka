"use client";

import { useEffect } from "react";
import { site } from "@/content/site";
import { openCal, warmUpCal } from "@/lib/cal";

/**
 * Turns every link to the Cal.com booking page into the pop-up calendar, wherever it is on the
 * page (header, contact section, case studies, chat). The links stay ordinary links, so without
 * JavaScript, with a modifier key, or if Cal's script can't load, they open Cal.com as before.
 */
export function BookingLinks() {
  useEffect(() => {
    const link = site.calLink;
    if (!link) return;

    const bookingLink = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLAnchorElement>(`a[href="${CSS.escape(link)}"]`) : null;

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!bookingLink(e.target)) return;
      if (openCal(link)) e.preventDefault();
    };
    // Start loading the calendar as soon as someone shows intent, so it opens quickly.
    const onIntent = (e: Event) => {
      if (bookingLink(e.target)) warmUpCal();
    };

    document.addEventListener("click", onClick, { capture: true });
    document.addEventListener("pointerover", onIntent, { passive: true });
    document.addEventListener("focusin", onIntent);
    document.addEventListener("touchstart", onIntent, { passive: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      document.removeEventListener("pointerover", onIntent);
      document.removeEventListener("focusin", onIntent);
      document.removeEventListener("touchstart", onIntent);
    };
  }, []);

  return null;
}
