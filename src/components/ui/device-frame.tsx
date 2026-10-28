import type { ReactNode } from "react";
import type { Screenshot } from "@/content/types";
import { cn } from "@/lib/utils";
import { Picture } from "./picture";

/** A minimal browser window around a desktop screenshot. */
export function BrowserFrame({
  shot,
  sizes,
  url,
  eager,
  className,
}: {
  shot: Screenshot;
  sizes: string;
  /** Shown in the address bar, e.g. "weblanda.com". */
  url?: string;
  eager?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border-strong bg-surface shadow-[0_30px_80px_-30px_rgb(var(--shadow-color)/0.55)]",
        className,
      )}
    >
      <div className="flex h-8 items-center gap-1.5 border-b border-border bg-surface-2 px-3">
        <span aria-hidden className="size-2.5 rounded-full bg-border-strong" />
        <span aria-hidden className="size-2.5 rounded-full bg-border-strong" />
        <span aria-hidden className="size-2.5 rounded-full bg-border-strong" />
        {url && (
          <span className="mx-auto truncate rounded-md bg-surface px-3 py-0.5 font-mono text-[0.68rem] text-muted">
            {url}
          </span>
        )}
      </div>
      <Picture
        base={`${shot.dir}/${shot.name}`}
        widths={shot.widths}
        width={shot.width}
        height={shot.height}
        alt={shot.alt}
        sizes={sizes}
        eager={eager}
      />
    </div>
  );
}

/** A phone outline around a mobile screenshot. Crops tall screenshots to a phone's ratio from the top. */
export function PhoneFrame({
  shot,
  sizes,
  className,
  children,
}: {
  shot: Screenshot;
  sizes: string;
  className?: string;
  /** Drawn over the screen, e.g. highlight rings placed in % of the screen. */
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.9rem] border border-border-strong bg-card-dark p-1.5 shadow-[0_30px_70px_-25px_rgb(var(--shadow-color)/0.6)]",
        className,
      )}
    >
      <div className="relative aspect-[9/19.5] overflow-hidden rounded-[1.5rem] bg-surface">
        <Picture
          base={`${shot.dir}/${shot.name}`}
          widths={shot.widths}
          width={shot.width}
          height={shot.height}
          alt={shot.alt}
          sizes={sizes}
          className="absolute inset-0"
          imgClassName="h-full object-cover object-top"
        />
        {children}
      </div>
    </div>
  );
}
