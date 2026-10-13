"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { CalendarDays, Download, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { navLinks, site } from "@/content/site";
import { activeSocials } from "@/content/socials";
import { SocialIcon } from "@/components/icons/social-icon";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ButtonAnchor } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Tracks which homepage section is currently in view, for the active link indicator. */
function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const sections = navLinks
      .map((l) => document.getElementById(l.id))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // A thin band across the upper middle of the viewport decides the active section.
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [enabled]);

  return enabled ? active : null;
}

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const active = useActiveSection(isHome);

  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  // Blur after leaving the top; hide while scrolling down, reveal on scroll up.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 12);
    setHidden(y > 480 && y > prev + 4);
    if (y < prev - 4) setHidden(false);
  });

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden && !open ? "-110%" : "0%" }}
        transition={{ duration: 0.35, ease: EASE }}
        className="fixed inset-x-0 top-0 z-50"
      >
        <div
          className={cn(
            "border-b transition-[background-color,border-color,backdrop-filter] duration-300",
            scrolled || open
              ? "border-border bg-bg/75 backdrop-blur-xl backdrop-saturate-150"
              : "border-transparent bg-transparent",
          )}
        >
          <nav
            aria-label="Main"
            className="container-page flex h-16 items-center justify-between gap-2 sm:gap-4 md:h-18"
          >
            <Logo onClick={close} />

            {/* Inline links from lg up; below that the menu button carries them, which leaves
                room for "Book a call" on tablets too. */}
            <ul className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => {
                const isActive = active === link.id;
                return (
                  <li key={link.id} className="relative">
                    <Link
                      href={`/#${link.id}`}
                      data-track={`nav:${link.id}`}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "relative z-10 block rounded-pill px-4 py-2 text-sm font-medium transition-colors",
                        isActive ? "text-fg" : "text-muted hover:text-fg",
                      )}
                    >
                      {link.label}
                    </Link>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        aria-hidden
                        className="absolute inset-0 rounded-pill bg-surface-2"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Smaller on phones so "Book a call" fits; hidden below 360px where it can't. */}
              <ThemeToggle className="size-8 max-[359px]:hidden sm:size-10" />
              <ButtonAnchor
                href={site.cv.href}
                download={site.cv.fileName}
                size="sm"
                variant={site.calLink ? "secondary" : "primary"}
                className="hidden lg:inline-flex"
              >
                <Download
                  aria-hidden
                  className="size-4 transition-transform group-hover/btn:translate-y-0.5"
                />
                Download CV
              </ButtonAnchor>
              {site.calLink && (
                <ButtonAnchor
                  href={site.calLink}
                  external
                  size="sm"
                  data-track="nav:book-call"
                  className="h-8 gap-1.5 px-3 text-[0.8rem] sm:h-9 sm:gap-2 sm:px-4 sm:text-sm"
                >
                  <CalendarDays aria-hidden className="hidden size-3.5 min-[384px]:block sm:size-4" />
                  Book a call
                </ButtonAnchor>
              )}
              <button
                ref={menuButtonRef}
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-controls="mobile-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                className="grid size-9 place-items-center rounded-full border border-border text-fg sm:size-10 lg:hidden"
              >
                {open ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      <MobileMenu open={open} onClose={close} returnFocusRef={menuButtonRef} active={active} />
    </>
  );
}

function MobileMenu({
  open,
  onClose,
  returnFocusRef,
  active,
}: {
  open: boolean;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  active: string | null;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock page scroll, close on Escape, keep Tab inside the menu, restore focus on close.
  useEffect(() => {
    if (!open) return;
    const returnTo = returnFocusRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(panelRef.current?.querySelectorAll<HTMLElement>("a[href], button") ?? []);
    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) onClose();
    };

    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      returnTo?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-menu"
          className="fixed inset-0 z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { delay: 0.15 } }}
        >
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={onClose}
            className="absolute inset-0 bg-bg/60 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col border-l border-border bg-bg px-6 pt-24 pb-8"
          >
            <motion.ul
              className="flex flex-col gap-1"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } } }}
            >
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.id}
                  variants={{
                    hidden: { opacity: 0, x: 40 },
                    show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
                  }}
                >
                  <Link
                    href={`/#${link.id}`}
                    data-track={`menu:${link.id}`}
                    onClick={onClose}
                    className={cn(
                      "flex items-baseline gap-4 py-3 font-display text-4xl font-extrabold tracking-tight uppercase transition-colors",
                      active === link.id ? "text-fg" : "text-ghost hover:text-fg",
                    )}
                  >
                    <span className="font-mono text-xs font-normal text-muted">0{i + 1}</span>
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>

            <motion.div
              className="mt-auto flex flex-col gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.45, duration: 0.5, ease: EASE } }}
            >
              <ButtonAnchor href={site.cv.href} download={site.cv.fileName} size="lg" onClick={onClose}>
                <Download aria-hidden className="size-4" />
                Download CV
              </ButtonAnchor>
              <ul className="flex items-center justify-center gap-3">
                {activeSocials.map((s) => (
                  <li key={s.key}>
                    <a
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="grid size-11 place-items-center rounded-full border border-border text-muted transition-colors hover:border-fg hover:text-fg"
                    >
                      <SocialIcon name={s.key} className="size-4.5" />
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
