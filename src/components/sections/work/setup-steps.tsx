"use client";

import {
  ArrowUpRight,
  BadgePercent,
  Camera,
  Check,
  Clock,
  Globe,
  Link2,
  MessageCircle,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ButtonAnchor } from "@/components/ui/button";
import { BrowserFrame, PhoneFrame } from "@/components/ui/device-frame";
import type { Screenshot } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * Weblanda's "From your phone to a live shop, in five steps" row: the carousel
 * from weblanda.com's homepage, rebuilt in this site's own design. The original
 * slides are flat orange-and-cream images; here each slide is a card made from
 * the site's tokens, with the same words and the same real app screens
 * (from weblanda/marketing/carousel-5-steps: slides.html for the copy and the
 * highlight positions, screens/ for the screenshots, which are not retouched).
 *
 * Seven cards: a cover, one per step, and a closing "your store is live".
 *
 * Where the screen has room, the section pins and vertical scroll moves the
 * strip sideways, one pixel across per pixel down, so the last card arrives
 * exactly as the section releases. Where it does not (short window, reduced
 * motion, or a screen wide enough to show all seven), it becomes an ordinary
 * horizontal scroller driven by the arrows. Nothing is unreachable either way.
 *
 * **Never put this inside anything with `overflow: hidden`, `transform` or
 * `filter`** (a <Reveal> wrapper, a rounded card that clips). It pins with
 * `position: sticky`, and any of those on an ancestor makes sticky resolve
 * against that ancestor instead of the screen, so it silently stops pinning.
 * Render it outside .container-page too, so the cards slide to the screen edge.
 */

const DIR = "/projects/weblanda/steps";

/** Every screen is a 390x844 CSS-pixel capture at 3x. */
const screen = (name: string, alt: string): Screenshot => ({
  dir: DIR,
  name,
  widths: [400, 560],
  width: 1170,
  height: 2532,
  alt,
  device: "phone",
});

/** A phone is about half a card, and a card is at most 400px wide. */
const PHONE_SIZES = "(min-width: 472px) 190px, 46vw";

/** Highlight on a screen, in the screen's own CSS pixels: [x, y, width, height]. */
type Ring = [number, number, number, number];

interface Step {
  title: ReactNode;
  body: ReactNode;
  shot: Screenshot;
  ring: Ring;
  chip: { icon: LucideIcon; text: ReactNode; style: CSSProperties; className?: string };
}

/**
 * A chip that starts just inside the card's left padding: the phone is 54% of the card's
 * content, so the space beside it is 23% of the content, about 43% of the phone.
 */
const SIDE = "left-[-38%]";

// Copy, screens and rings are the ones on weblanda.com. Chips sit in % of the phone.
const STEPS: Step[] = [
  {
    title: "Name your store",
    body: "Pick a name and get your own link, like yourbrand.weblanda.shop",
    shot: screen(
      "step-name",
      "The Weblanda naming screen with adakicks typed in, which becomes adakicks.weblanda.shop",
    ),
    ring: [41, 381, 308, 50],
    chip: {
      icon: Link2,
      text: "adakicks.weblanda.shop",
      style: { top: "68%" },
      className: "left-1/2 -translate-x-1/2",
    },
  },
  {
    title: "Sign up with Google",
    body: "One tap. No long forms.",
    shot: screen("step-signup", "The Weblanda sign-up screen with the Continue with Google button"),
    ring: [25, 225, 340, 44],
    chip: { icon: Check, text: "One tap", style: { top: "29%" }, className: SIDE },
  },
  {
    title: "Let AI list your product",
    body: "Upload a photo. AI writes the name and description. You add price, stock and sizes.",
    shot: screen(
      "step-ai",
      "The add product form after a photo is uploaded, with the name and description written by AI and the price left empty",
    ),
    ring: [38, 410, 314, 275],
    chip: { icon: Sparkles, text: "AI wrote this", style: { top: "60%" }, className: SIDE },
  },
  {
    title: "Add the rest at once",
    body: "Upload many photos together. AI fills them all in.",
    shot: screen(
      "step-drafts",
      "The products list showing drafts made from photos, each waiting for a price",
    ),
    ring: [25, 318, 340, 232],
    chip: {
      icon: Zap,
      text: (
        <>
          10 products
          <br />
          in about a minute
        </>
      ),
      style: { top: "52%" },
      className: `${SIDE} rounded-2xl`,
    },
  },
  {
    title: "Connect your bank",
    body: "Customers pay online. The money goes straight to your account.",
    shot: screen("step-payouts", "The payouts screen showing Payouts active with a masked account number"),
    ring: [23, 197, 345, 244],
    // Covers the page's "How your money moves" paragraph, as the original slide does: its
    // copy has an em dash (screen y 578 of 844, 68.5%), which this site never shows.
    chip: {
      icon: BadgePercent,
      text: (
        <>
          Weblanda takes
          <br />
          <span className="text-accent-ink">0%</span> of your sales
        </>
      ),
      style: { top: "66%" },
      className:
        "left-1/2 w-[150%] -translate-x-1/2 rounded-2xl px-4 py-3 font-display text-sm font-bold leading-tight whitespace-normal @[20rem]:w-[120%] @[20rem]:text-base [&>span:first-child]:size-8 @[20rem]:[&>span:first-child]:size-9",
    },
  },
];

const SLIDE_COUNT = STEPS.length + 2;

/**
 * Smallest the strip may be shrunk to keep sliding; below this it hands over
 * to the arrows. High on purpose: the smallest text is the phone screen inside
 * each card, and under about 0.8 it turns to mush.
 */
const MIN_SCALE = 0.8;

/** Space under the pinned strip for the counter, plus air. */
const COUNTER_SPACE = 56;

/** A card's frame: the site's surface card with the dotted grid behind the devices. */
function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "@container relative isolate flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface p-5 sm:p-6",
        className,
      )}
    >
      <div
        aria-hidden
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_50%_85%,black_15%,transparent_70%)]"
      />
      {children}
    </div>
  );
}

/** Same pill as the floating chips on the hero portrait, with the icon in a lime dot. */
function Chip({
  icon: Icon,
  children,
  className,
  style,
}: {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-pill border border-border bg-surface/90 py-1.5 pr-3 pl-1.5 text-[0.75rem] leading-tight font-medium whitespace-nowrap text-fg shadow-[0_12px_30px_-12px_rgb(var(--shadow-color)/0.5)] backdrop-blur-md",
        className,
      )}
    >
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-accent text-accent-contrast">
        <Icon aria-hidden className="size-3.5" strokeWidth={2.5} />
      </span>
      <span>{children}</span>
    </p>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="relative size-6 overflow-hidden rounded-md border border-border">
        <Image src="/logos/weblanda-mark.jpg" alt="" fill sizes="24px" className="object-cover" />
      </span>
      <p className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">Weblanda</p>
    </div>
  );
}

function CoverCard() {
  return (
    <Card>
      <Brand />
      <h4 className="mt-5 font-display text-[1.75rem] leading-[1.05] font-bold tracking-tight text-fg">
        Your online store <span className="text-ghost">in 5 simple steps.</span>
      </h4>
      <p className="mt-2 text-sm text-muted">No coding. No developer. Just your phone.</p>

      <div className="relative mt-auto h-[58%]">
        <PhoneFrame
          shot={screen("vyro-product", "A Vyro product page on a phone: olive green outdoor shoes")}
          sizes={PHONE_SIZES}
          className="absolute top-[14%] left-[8%] w-[40%] -rotate-6"
        />
        <PhoneFrame
          shot={screen("vyro-home", "The Vyro shoe store's home page on a phone, built on Weblanda")}
          sizes={PHONE_SIZES}
          className="absolute top-[4%] right-[6%] w-[45%] rotate-3"
        />
        <Chip icon={Clock} className="absolute top-0 left-0 z-10 rounded-2xl">
          Takes under
          <br />5 minutes
        </Chip>
      </div>
    </Card>
  );
}

function StepCard({ step, n }: { step: Step; n: number }) {
  const [x, y, w, h] = step.ring;
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[0.68rem] tracking-[0.18em] text-muted uppercase">
          Step {n} of {STEPS.length}
        </p>
        <span aria-hidden className="flex gap-1">
          {STEPS.map((_, i) => (
            <i
              key={i}
              className={cn(
                "block h-1 w-4 rounded-full",
                i + 1 === n ? "bg-accent" : i + 1 < n ? "bg-accent/40" : "bg-border-strong",
              )}
            />
          ))}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-[auto_1fr] gap-x-3">
        <span
          aria-hidden
          className="row-span-2 font-display text-[3.75rem] leading-[0.8] font-extrabold tracking-tight text-accent-ink"
        >
          {n}
        </span>
        <h4 className="font-display text-[1.45rem] leading-[1.05] font-bold tracking-tight text-fg">
          <span className="sr-only">Step {n}: </span>
          {step.title}
        </h4>
        <p className="mt-1.5 text-[0.8rem] leading-snug text-muted">{step.body}</p>
      </div>

      {/* Runs off the bottom of the card, so the screen fills the space under the text. */}
      <div className="relative mx-auto mt-5 w-[54%]">
        <PhoneFrame shot={step.shot} sizes={PHONE_SIZES}>
          <span
            aria-hidden
            className="absolute rounded-lg border-2 border-accent-ink shadow-[0_0_0_4px_var(--accent-glow)]"
            style={{
              left: `${(x / 390) * 100}%`,
              top: `${(y / 844) * 100}%`,
              width: `${(w / 390) * 100}%`,
              height: `${(h / 844) * 100}%`,
            }}
          />
        </PhoneFrame>
        <Chip
          icon={step.chip.icon}
          style={step.chip.style}
          className={cn("absolute z-10 -translate-y-1/2", step.chip.className)}
        >
          {step.chip.text}
        </Chip>
      </div>
    </Card>
  );
}

function LiveCard({ ctaHref }: { ctaHref: string }) {
  return (
    <Card>
      <Brand />
      <h4 className="mt-5 font-display text-[1.75rem] leading-[1.05] font-bold tracking-tight text-fg">
        Your store is live. <span className="text-ghost">Share your link.</span>
      </h4>

      <div className="relative mt-6 px-[14%]">
        <BrowserFrame
          shot={{
            dir: DIR,
            name: "vyro-desktop-grid",
            widths: [400, 560, 800],
            width: 1878,
            height: 871,
            alt: "The Vyro shoe store on a laptop, showing its product grid",
            device: "desktop",
          }}
          url="vyro.weblanda.shop"
          sizes="(min-width: 472px) 260px, 60vw"
          className="rounded-lg [&>div]:h-5"
        />
        <PhoneFrame
          shot={screen(
            "veek3footies-home",
            "The Veek3Footies store's home page on a phone, built on Weblanda",
          )}
          sizes="(min-width: 472px) 90px, 22vw"
          className="absolute top-[18%] left-0 w-[24%] -rotate-6 rounded-[1.1rem] p-1 [&>div]:rounded-[0.8rem]"
        />
        <PhoneFrame
          shot={screen("vyro-product", "A Vyro product page on a phone")}
          sizes="(min-width: 472px) 90px, 22vw"
          className="absolute top-[18%] right-0 w-[24%] rotate-6 rounded-[1.1rem] p-1 [&>div]:rounded-[0.8rem]"
        />
      </div>

      <div className="mt-auto">
        {/* Only where the card is full size: on a phone-width card they'd push the button out. */}
        <ul className="hidden flex-wrap justify-center gap-1.5 @[20rem]:flex">
          {(
            [
              [MessageCircle, "WhatsApp Status"],
              [Camera, "Instagram bio"],
              [Globe, "Anywhere"],
            ] as const
          ).map(([icon, label]) => (
            <li key={label}>
              <Chip icon={icon} className="pr-2.5 text-[0.7rem] shadow-none [&>span:first-child]:size-5">
                {label}
              </Chip>
            </li>
          ))}
        </ul>
        <ButtonAnchor href={ctaHref} external className="mt-4 w-full">
          Start free at weblanda.com
          <ArrowUpRight aria-hidden className="size-4" />
        </ButtonAnchor>
        <p className="mt-2 text-center text-xs text-muted">Free for 14 days. No card needed.</p>
      </div>
    </Card>
  );
}

export function SetupSteps({
  ctaHref = "https://weblanda.com",
  navHeight = 56,
}: {
  /** Where the closing card's "Start free" button goes. */
  ctaHref?: string;
  /**
   * Height of the site's sticky/fixed header in px. The pinned strip is pushed
   * down by this much so the header never covers the tops of the cards.
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
   * every frame of a scroll, and setState there would re-render seven cards
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
          counter.current.textContent = `${Math.round(progress * (SLIDE_COUNT - 1)) + 1} / ${SLIDE_COUNT}`;
        }
      });
    }

    decide();
    // Card height comes from the cards' aspect ratio, so it is right before the
    // screens load; the fonts are for the text inside the cards.
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

  /** One card's on-screen width, plus the gap after it. */
  function stepPx() {
    const [a, b] = Array.from(track.current?.children ?? []) as HTMLElement[];
    if (!a || !b) return 0;
    return (b.offsetLeft - a.offsetLeft) * (activeRef.current ? scaleRef.current : 1);
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
    const i = Math.min(SLIDE_COUNT - 1, Math.round(v.scrollLeft / step));
    counter.current.textContent = `${i + 1} / ${SLIDE_COUNT}`;
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
            <ul ref={track} className={`flex gap-4 ${active ? "origin-left will-change-transform" : ""}`}>
              <li className="aspect-[4/5] w-[calc(100vw_-_4.5rem)] max-w-[400px] shrink-0 snap-start">
                <CoverCard />
              </li>
              {STEPS.map((step, i) => (
                <li
                  key={i}
                  className="aspect-[4/5] w-[calc(100vw_-_4.5rem)] max-w-[400px] shrink-0 snap-start"
                >
                  <StepCard step={step} n={i + 1} />
                </li>
              ))}
              <li className="aspect-[4/5] w-[calc(100vw_-_4.5rem)] max-w-[400px] shrink-0 snap-start">
                <LiveCard ctaHref={ctaHref} />
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-4 hidden text-center font-mono text-xs text-muted md:block">
          <span ref={counter}>1 / {SLIDE_COUNT}</span>
        </p>
      </div>
    </div>
  );
}
