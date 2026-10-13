"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { BrowserFrame, PhoneFrame } from "@/components/ui/device-frame";
import type { Screenshot } from "@/content/types";
import { cn } from "@/lib/utils";

/**
 * A desktop screenshot with a phone screenshot overlapping one corner.
 * The two layers drift at different speeds while scrolling, for a little depth.
 */
export function DeviceStack({
  desktop,
  phone,
  url,
  reverse = false,
  eager = false,
}: {
  desktop: Screenshot;
  phone: Screenshot;
  url: string;
  reverse?: boolean;
  /** Load the desktop shot straight away, for a cover above the fold. */
  eager?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const desktopY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [36, -36]);
  const phoneY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [110, -80]);

  return (
    // The browser window runs off the card's outer edge (the card clips it), so it fills the column.
    <div
      ref={ref}
      className={cn("relative pt-10 pb-20 sm:pt-14 sm:pb-24", reverse ? "pr-5 sm:pr-10" : "pl-5 sm:pl-10")}
    >
      <motion.div style={{ y: desktopY }} className={cn("w-[122%]", reverse && "ml-[-22%]")}>
        <BrowserFrame
          shot={desktop}
          url={url}
          eager={eager}
          sizes="(min-width: 1280px) 820px, (min-width: 1024px) 64vw, 120vw"
          className="transition-transform duration-700 ease-out-expo group-hover/spot:-translate-y-1"
        />
      </motion.div>
      <motion.div
        style={{ y: phoneY }}
        className={cn(
          "absolute bottom-4 w-[30%] max-w-50 sm:bottom-6",
          reverse ? "left-3 sm:left-7" : "right-3 sm:right-7",
        )}
      >
        <PhoneFrame
          shot={phone}
          sizes="(min-width: 1024px) 184px, 29vw"
          className="transition-transform duration-700 ease-out-expo group-hover/spot:-translate-y-2 group-hover/spot:rotate-[-1.5deg]"
        />
      </motion.div>
    </div>
  );
}
