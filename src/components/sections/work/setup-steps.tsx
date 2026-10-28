"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Weblanda's "From your phone to a live shop, in five steps" row, lifted out of
 * the Weblanda repo (components/home/SetupSteps.tsx) for the Work section.
 *
 * Seven slides (a cover, one per step, a closing "your store is live") in one
 * edge-to-edge strip. The slides were designed to be swiped: the orange circles
 * run across the seams from one slide into the next, so the cards have no gap
 * and only the two ends of the strip are rounded.
 *
 * Where the screen has room, the section pins and vertical scroll moves the
 * strip sideways, one pixel across per pixel down, so the last slide arrives
 * exactly as the section releases. Where it does not (short window, reduced
 * motion, or a screen wide enough to show all seven), it becomes an ordinary
 * horizontal scroller driven by the arrows. Nothing is unreachable either way.
 *
 * Differences from the Weblanda original:
 *   - The last slide links to weblanda.com instead of opening the shop-naming
 *     dialog, which does not exist outside the Weblanda app.
 *   - The arrows, counter and focus rings use this site's colour tokens, and
 *     the strip's inner column matches .container-page.
 *   - Image folder, link and nav height are props.
 *   - Heights use `dvh` outright (no `vh` fallback check), like the rest of the site.
 *
 * **Never put this inside anything with `overflow: hidden`, `transform` or
 * `filter`** (a <Reveal> wrapper, a rounded card that clips). It pins with
 * `position: sticky`, and any of those on an ancestor makes sticky resolve
 * against that ancestor instead of the screen, so it silently stops pinning.
 * Render it outside .container-page too, so the cards slide to the screen edge.
 */

/** Cache-buster for the slides. Bump it whenever they are replaced. */
const VERSION = "1";

/** The widths each slide exists in, as avif and webp. */
const WIDTHS = [400, 560, 800, 1024];

/** A card is the screen less a peek of the next one on a phone, and 400px above that. */
const SIZES = "(min-width: 472px) 400px, calc(100vw - 72px)";

const SLIDES = [
  {
    file: "steps-01-cover",
    alt: "Your online store in 5 simple steps. No coding. No developer. Just your phone. Two phones show the Vyro shoe store built on Weblanda.",
  },
  {
    file: "steps-02-step-1",
    alt: "Step 1, name your store: the Weblanda naming screen with adakicks typed in, which becomes adakicks.weblanda.shop.",
  },
  {
    file: "steps-03-step-2",
    alt: "Step 2, sign up with Google: the Weblanda sign-up screen with the Continue with Google button.",
  },
  {
    file: "steps-04-step-3",
    alt: "Step 3, let AI list your product: the add product form after a photo is uploaded, with the name and description written by AI and the price left for the seller.",
  },
  {
    file: "steps-05-step-4",
    alt: "Step 4, add the rest at once: the products list showing drafts made from photos, each waiting for a price.",
  },
  {
    file: "steps-06-step-5",
    alt: "Step 5, connect your bank: the payouts screen showing Payouts active with a masked account number. Weblanda takes 0% of your sales.",
  },
  {
    file: "steps-07-cta",
    alt: "Your store is live. Share your link: two real Weblanda stores on a laptop and two phones. Start free on weblanda.com.",
  },
];

/**
 * Smallest the strip may be shrunk to keep sliding; below this it hands over
 * to the arrows. High on purpose: the smallest text is the phone screen inside
 * each slide, and under about 0.8 it turns to mush.
 */
const MIN_SCALE = 0.8;

/** Space under the pinned strip for the counter, plus air. */
const COUNTER_SPACE = 56;

type Slide = (typeof SLIDES)[number];

function Shot({ s, base }: { s: Slide; base: string }) {
  const srcSet = (ext: string) =>
    WIDTHS.map((w) => `${base}/${s.file}-${w}.${ext}?v=${VERSION} ${w}w`).join(", ");
  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={SIZES} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={SIZES} />
      <img
        src={`${base}/${s.file}-560.webp?v=${VERSION}`}
        alt={s.alt}
        width={1080}
        height={1350}
        loading="lazy"
        decoding="async"
        className="block h-auto w-full"
      />
    </picture>
  );
}

export function SetupSteps({
  imageBase = "/weblanda-steps",
  ctaHref = "https://weblanda.com",
  navHeight = 56,
}: {
  /** Public folder holding the 56 slide files, no trailing slash. */
  imageBase?: string;
  /** Where the closing slide's drawn-in "Start free" goes. */
  ctaHref?: string;
  /**
   * Height of the site's sticky/fixed header in px. The pinned strip is pushed
   * down by this much so the header never covers the tops of the slides.
   */
  navHeight?: number;
}) {
  const section = useRef<HTMLDivElement>(null);
  const pinned = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);
  const travelRef = useRef(0);
  const scaleRef = useRef(1);
  /**
   * Written straight into the DOM rather than held in state: it changes on
   * every frame of a scroll, and setState there would re-render seven images
   * sixty times a second to change two characters.
   */
  const counter = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(false);

  const [active, setActive] = useState(false);
  const [travel, setTravel] = useState(0);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reserved = navHeight + COUNTER_SPACE;
    let frame = 0;

    /** Unscaled sizes. Transforms do not change layout, so these hold while scaled. */
    function measure() {
      const t = track.current,
        v = viewport.current;
      if (!t || !v) return null;
      const cs = getComputedStyle(v);
      const inner = v.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
      let tallest = 0;
      for (const li of Array.from(t.children)) tallest = Math.max(tallest, (li as HTMLElement).offsetHeight);
      return { inner, width: t.scrollWidth, tallest };
    }

    function decide() {
      const m = measure();
      if (!m || m.tallest === 0) return;
      const visible = window.visualViewport?.height ?? window.innerHeight;
      const fit = Math.min(1, (visible - reserved) / m.tallest);
      // How far the shrunk strip has to travel for its last card to arrive.
      const shift = Math.max(0, Math.ceil(m.width * fit - m.inner));
      const on = !still.matches && shift > 0 && fit >= MIN_SCALE;
      scaleRef.current = on ? fit : 1;
      travelRef.current = on ? shift : 0;
      setScale(scaleRef.current);
      setTravel(travelRef.current);
      setActive(on);
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const el = section.current,
          t = track.current;
        if (!el || !t || !travelRef.current) return;
        const run = el.offsetHeight - (pinned.current?.offsetHeight ?? 0);
        if (run <= 0) return;
        const progress = Math.min(Math.max(-el.getBoundingClientRect().top / run, 0), 1);
        t.style.transform = `translate3d(${-progress * travelRef.current}px, 0, 0) scale(${scaleRef.current})`;
        if (counter.current) {
          counter.current.textContent = `${Math.round(progress * (SLIDES.length - 1)) + 1} / ${SLIDES.length}`;
        }
      });
    }

    decide();
    // Card height comes from the images' width/height attributes, so it is
    // right before they load; the fonts are for the counter.
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) decide();
    });

    // Only a width change re-decides the layout. iOS fires `resize` while
    // scrolling as the address bar collapses, and re-deciding on height tears
    // the pinned layout down mid-gesture.
    let lastWidth = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        decide();
      }
      onScroll();
    };

    still.addEventListener("change", decide);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      still.removeEventListener("change", decide);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, [navHeight]);

  // A strip that stops sliding must not keep its last shift and scale; one that
  // starts, or changes size, is placed again straight away.
  useEffect(() => {
    activeRef.current = active;
    if (!track.current) return;
    if (!active) track.current.style.transform = "";
    else window.dispatchEvent(new Event("scroll"));
  }, [active, travel, scale]);

  /** One card's on-screen width. */
  function stepPx() {
    const first = track.current?.children[0] as HTMLElement | undefined;
    if (!first) return 0;
    return first.offsetWidth * (activeRef.current ? scaleRef.current : 1);
  }

  /**
   * While pinned, one pixel of page scroll is one pixel of sideways travel, so
   * moving one card is scrolling the page by one card's width. Unpinned, the
   * strip is a real horizontal scroller and scrolls itself.
   */
  function go(dir: 1 | -1) {
    const step = stepPx();
    if (!step) return;
    if (activeRef.current) {
      window.scrollBy({ top: dir * step, behavior: "smooth" });
    } else {
      viewport.current?.scrollBy({ left: dir * step, behavior: "smooth" });
    }
  }

  /** Keeps the counter honest while somebody swipes the unpinned strip. */
  function onRowScroll() {
    const v = viewport.current;
    const step = stepPx();
    if (!v || activeRef.current || !step || !counter.current) return;
    const i = Math.min(SLIDES.length - 1, Math.round(v.scrollLeft / step));
    counter.current.textContent = `${i + 1} / ${SLIDES.length}`;
  }

  return (
    <div
      ref={section}
      className={active ? "relative" : undefined}
      // `dvh`, as elsewhere on the site: `100vh` on a phone includes the hidden address bar.
      style={active ? { height: `calc(100dvh + ${travel}px)` } : undefined}
    >
      <div
        ref={pinned}
        // Full width with overflow hidden, so cards slide out to the edge of
        // the screen rather than vanishing at the page's gutter.
        className={active ? "sticky top-0 flex flex-col justify-center overflow-hidden" : undefined}
        style={active ? { height: "100dvh", paddingTop: navHeight } : undefined}
      >
        {/* Arrows sit on the strip itself: on a short screen they are how you
            get through the seven. `md:` only, a phone swipes. */}
        <div className="relative mx-auto w-full max-w-7xl">
          {([-1, 1] as const).map((dir) => (
            <button
              key={dir}
              type="button"
              onClick={() => go(dir)}
              aria-label={dir === -1 ? "Previous step" : "Next step"}
              className={`absolute top-1/2 z-20 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-border-strong bg-surface/90 text-fg shadow-[0_12px_30px_-12px_rgb(var(--shadow-color)/0.5)] backdrop-blur-md transition-colors hover:border-accent hover:bg-accent hover:text-accent-contrast md:grid ${
                dir === -1 ? "left-1 lg:left-3" : "right-1 lg:right-3"
              }`}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d={dir === -1 ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ))}

          {/* Same gutters as .container-page, so the first card lines up with the heading. */}
          <div
            ref={viewport}
            onScroll={onRowScroll}
            className={`w-full px-4 sm:px-6 lg:px-8 ${
              active
                ? ""
                : "no-scrollbar snap-x snap-mandatory scroll-px-4 overflow-x-auto pb-2 sm:scroll-px-6 lg:scroll-px-8"
            }`}
            tabIndex={active ? undefined : 0}
            role="region"
            aria-label="The five steps to a Weblanda shop"
          >
            {/* `origin-left`, so a shrunk strip keeps its left edge in line
                with the heading above it. */}
            <ul ref={track} className={`flex ${active ? "origin-left will-change-transform" : ""}`}>
              {SLIDES.map((s, i) => (
                <li
                  key={s.file}
                  className="w-[calc(100vw_-_4.5rem)] max-w-[400px] shrink-0 snap-start overflow-hidden first:rounded-l-[1.75rem] last:rounded-r-[1.75rem]"
                >
                  {i === SLIDES.length - 1 ? (
                    <a
                      href={ctaHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      // Inset ring: the card clips anything drawn outside it.
                      className="block w-full transition-[filter] hover:brightness-[1.03] focus-visible:-outline-offset-4"
                    >
                      <Shot s={s} base={imageBase} />
                    </a>
                  ) : (
                    <Shot s={s} base={imageBase} />
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-4 hidden text-center font-mono text-xs text-muted md:block">
          <span ref={counter}>1 / {SLIDES.length}</span>
        </p>
      </div>
    </div>
  );
}
