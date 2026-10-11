import { RevealItem } from "@/components/motion/reveal";
import { PhoneFrame } from "@/components/ui/device-frame";
import type { Screenshot } from "@/content/types";
import { ScrollLinkedRail } from "./scroll-linked-rail";

/**
 * Row of phone screens with captions. Swipes sideways (and follows page scrolling) on small
 * screens, becomes an even grid on large ones.
 */
export function ScreenRail({ shots, label }: { shots: Screenshot[]; label: string }) {
  return (
    <ScrollLinkedRail
      label={label}
      className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0"
    >
      {shots.map((shot) => (
        <RevealItem
          as="li"
          key={shot.name}
          className="w-[58vw] max-w-[15rem] shrink-0 snap-start lg:w-auto lg:max-w-none"
        >
          <figure className="group">
            <PhoneFrame
              shot={shot}
              sizes="(min-width: 1024px) 220px, 58vw"
              className="transition-transform duration-500 ease-out-expo group-hover:-translate-y-2"
            />
            <figcaption className="mt-4 px-1">
              <span className="block font-display text-base font-bold tracking-tight text-fg">
                {shot.title}
              </span>
              <span className="mt-1 block text-sm leading-snug text-muted">{shot.caption}</span>
            </figcaption>
          </figure>
        </RevealItem>
      ))}
    </ScrollLinkedRail>
  );
}
