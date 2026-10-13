import Link from "next/link";
import { LogoMark } from "@/components/brand/logo-mark";
import { site } from "@/content/site";
import { cn } from "@/lib/utils";

export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label={`${site.name}, home`}
      className={cn("group flex shrink-0 items-center gap-2 sm:gap-2.5", className)}
    >
      <LogoMark className="size-8 text-accent-ink transition-transform duration-500 ease-out-expo group-hover:scale-105 sm:size-9" />
      {/* Thin, spaced capitals to match the monoline JC in the mark. */}
      <span className="flex flex-col gap-0.75 text-[0.7rem] leading-none tracking-[0.16em] text-fg uppercase">
        <span className="font-medium">Jonas</span>
        <span>Chukwuemeka</span>
      </span>
    </Link>
  );
}
