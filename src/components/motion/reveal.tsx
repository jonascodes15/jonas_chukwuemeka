import type { ComponentProps, CSSProperties } from "react";

/**
 * Scroll reveals, done in CSS. These render plain elements with data attributes; one small
 * observer (RevealObserver, in the site layout) adds `is-revealed` as they scroll into view, and
 * the transitions live in globals.css. Earlier these were one Motion component each, and
 * hydrating fifty of them was most of the page's main-thread work on phones.
 *
 * Without JavaScript, or with reduced motion on, everything simply shows.
 * Above the fold, use <Enter> instead: it doesn't wait for the observer.
 */

type Props = Omit<ComponentProps<"div">, "ref"> & { as?: "div" | "li" | "article" | "ul" | "ol" };

const vars = (style: CSSProperties | undefined, extra: Record<string, string>) =>
  ({ ...extra, ...style }) as CSSProperties;

/** Fades and lifts in the first time it scrolls into view. */
export function Reveal({
  delay = 0,
  y = 28,
  as = "div",
  style,
  ...props
}: Props & { delay?: number; y?: number }) {
  // One element type for TypeScript; the tag itself still changes.
  const El = as as "div";
  return (
    <El
      data-reveal=""
      style={vars(style, { "--reveal-delay": `${delay}s`, "--reveal-y": `${y}px` })}
      {...props}
    />
  );
}

/** Reveals its <RevealItem> descendants one after another as the group enters the view. */
export function RevealGroup({
  stagger = 0.08,
  delay = 0,
  as = "div",
  style,
  ...props
}: Props & { stagger?: number; delay?: number }) {
  const El = as as "div";
  return (
    <El
      data-reveal-group=""
      style={vars(style, { "--reveal-stagger": `${stagger}s`, "--reveal-delay": `${delay}s` })}
      {...props}
    />
  );
}

export function RevealItem({ y = 24, as = "div", style, ...props }: Props & { y?: number }) {
  const El = as as "div";
  return <El data-reveal-item="" style={vars(style, { "--reveal-y": `${y}px` })} {...props} />;
}
