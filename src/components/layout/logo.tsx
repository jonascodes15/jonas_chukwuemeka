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
      className={cn("group flex items-center gap-2.5", className)}
    >
      <LogoMark className="size-9 text-accent-ink transition-transform duration-500 ease-out-expo group-hover:scale-105" />
      {/* Thin, spaced capitals to match the monoline JC in the mark. */}
      <span className="flex flex-col gap-1 text-[0.8rem] leading-none font-light tracking-[0.16em] uppercase">
        <span className="text-fg">Jonas</span>
        <span className="text-muted">Chukwuemeka</span>
      </span>
    </Link>
  );
}
