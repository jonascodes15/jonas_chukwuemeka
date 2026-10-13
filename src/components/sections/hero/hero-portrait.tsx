"use client";

import { BookOpen, GraduationCap, MapPin } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { LocalTime } from "./local-time";

const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroPortrait({ name }: { name: string }) {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-[22rem] sm:max-w-[25rem] lg:mr-0"
      // No opacity fade here: the photo can be the LCP element, and invisible elements delay LCP.
      initial={{ scale: 0.94, rotate: -2 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ duration: 1.1, ease: EASE, delay: 0.35 }}
    >
      {/* Lime block offset behind the photo. */}
      <div
        aria-hidden
        className="absolute inset-0 translate-x-3 translate-y-3 rounded-card bg-accent sm:translate-x-4 sm:translate-y-4"
      />
      <div
        aria-hidden
        className="absolute -inset-3 rounded-[1.9rem] border border-dashed border-border-strong"
      />

      <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-border-strong bg-surface-2">
        <Image
          src="/images/me.jpg"
          alt={`Portrait of ${name}`}
          fill
          preload
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 400px, 352px"
          className="object-cover object-[46%_40%]"
        />
        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"
        />
        <p className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 font-mono text-xs text-white/90">
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden className="size-3.5" />
            Lagos, Nigeria
          </span>
          <LocalTime />
        </p>
      </div>

      <FloatingChip className="top-8 -left-3 sm:-left-10" delay={0.9} drift={-7}>
        <span className="relative size-6 overflow-hidden rounded-md">
          <Image src="/logos/weblanda-mark.jpg" alt="" fill sizes="24px" className="object-cover" />
        </span>
        Founder, Weblanda
      </FloatingChip>
      <FloatingChip className="top-[46%] -right-3 sm:-right-8" delay={1.05} drift={6}>
        <GraduationCap aria-hidden className="size-4 text-accent-ink" />
        BTech Biology, FUTO
      </FloatingChip>
      <FloatingChip className="bottom-16 -left-2 sm:-left-12" delay={1.2} drift={-5}>
        <BookOpen aria-hidden className="size-4 text-accent-ink" />
        Peer-reviewed co-author
      </FloatingChip>
    </motion.div>
  );
}

function FloatingChip({
  children,
  className,
  delay,
  drift,
}: {
  children: ReactNode;
  className?: string;
  delay: number;
  drift: number;
}) {
  return (
    <motion.div
      className={cn("absolute z-10", className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay }}
    >
      <motion.p
        className="flex items-center gap-2 rounded-pill border border-border bg-surface/90 py-1.5 pr-3.5 pl-2 text-[0.8rem] font-medium whitespace-nowrap text-fg shadow-[0_12px_30px_-12px_rgb(var(--shadow-color)/0.5)] backdrop-blur-md"
        animate={{ y: [0, drift, 0] }}
        transition={{
          duration: 6 + Math.abs(drift) / 3,
          ease: "easeInOut",
          repeat: Infinity,
          delay: delay + 0.7,
        }}
      >
        {children}
      </motion.p>
    </motion.div>
  );
}
