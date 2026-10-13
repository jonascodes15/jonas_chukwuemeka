import { ViewTransition, type ReactNode } from "react";

const DIRECTIONS = { "nav-forward": "nav-forward", "nav-back": "nav-back", default: "none" };

/**
 * Slides page content between the homepage and the case studies. Links opt in with
 * transitionTypes={["nav-forward"]} or ["nav-back"]; anything else (browser back, refreshes)
 * swaps instantly. The animations live in globals.css. Must wrap a page, not a layout:
 * layouts persist across navigations, so they never enter or exit.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter={DIRECTIONS} exit={DIRECTIONS} default="none">
      {children}
    </ViewTransition>
  );
}
