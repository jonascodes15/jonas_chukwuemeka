import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/**
 * One chapter of a case study: a numbered heading that stays in view on large screens
 * while its content scrolls past.
 */
export function CaseSection({
  id,
  number,
  title,
  children,
  className,
}: {
  id: string;
  number: number;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn("border-t border-border py-16 md:py-24", className)}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-16">
        <Reveal y={16} className="lg:sticky lg:top-28 lg:self-start">
          <p className="font-mono text-xs tracking-[0.18em] text-accent-ink">
            {String(number).padStart(2, "0")}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance text-fg sm:text-4xl"
          >
            {title}
          </h2>
        </Reveal>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}
