import { ArrowRight, ArrowUpRight, FileText } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { SocialIcon } from "@/components/icons/social-icon";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import type { ProjectLink } from "@/content/types";
import { cn } from "@/lib/utils";

const SOCIAL_KINDS = ["x", "linkedin", "facebook"] as const;
type SocialKind = (typeof SOCIAL_KINDS)[number];
const isSocial = (k: ProjectLink["kind"]): k is SocialKind => (SOCIAL_KINDS as readonly string[]).includes(k);

/**
 * Call-to-action row for a project: case study first, then live/code links as buttons,
 * then the project's social profiles as small icon links. Links without a URL are skipped.
 */
export function ProjectLinks({
  links,
  caseStudyHref,
  name,
  compact = false,
}: {
  links: ProjectLink[];
  caseStudyHref?: string;
  name: string;
  /** Smaller buttons and a shorter label, for narrow cards. */
  compact?: boolean;
}) {
  const available = links.filter((l): l is ProjectLink & { href: string } => l.href !== null);
  const buttons = available.filter((l) => !isSocial(l.kind));
  const socials = available.filter((l) => isSocial(l.kind));
  const size = compact ? "sm" : undefined;

  return (
    <div className={cn("flex flex-wrap items-center", compact ? "gap-2" : "gap-3")}>
      {caseStudyHref && (
        <ButtonLink
          href={caseStudyHref}
          size={size}
          transitionTypes={["nav-forward"]}
          data-track={`case-study:${name.toLowerCase()}`}
          aria-label={compact ? `Read the ${name} case study` : undefined}
        >
          {compact ? "Case study" : "Read the case study"}
          <ArrowRight aria-hidden className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
        </ButtonLink>
      )}
      {buttons.map((l, i) => (
        <ButtonAnchor
          key={l.href}
          href={l.href}
          external
          size={size}
          variant={caseStudyHref || i > 0 ? "secondary" : "primary"}
          aria-label={`${l.label} (opens in a new tab)`}
        >
          {l.kind === "github" && <SiGithub aria-hidden className="size-4" />}
          {l.kind === "paper" && <FileText aria-hidden className="size-4" />}
          {l.label}
          {(l.kind === "live" || l.kind === "readme") && (
            <ArrowUpRight
              aria-hidden
              className="size-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
            />
          )}
        </ButtonAnchor>
      ))}
      {socials.length > 0 && (
        <ul className="flex items-center gap-1.5" aria-label={`${name} on social media`}>
          {socials.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${l.label} (opens in a new tab)`}
                className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-fg hover:text-fg"
              >
                <SocialIcon name={l.kind as SocialKind} className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
