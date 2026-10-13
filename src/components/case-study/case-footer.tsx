import { ArrowRight, ArrowUpRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { ButtonAnchor, ButtonLink } from "@/components/ui/button";
import { site } from "@/content/site";
import type { CaseStudyEntry } from "@/content/work";

/** Large link to the next case study. */
export function NextProject({ next }: { next: CaseStudyEntry }) {
  const { project } = next;
  return (
    <Reveal>
      <Link
        href={`/work/${project.slug}`}
        transitionTypes={["nav-forward"]}
        data-track={`case-study-next:${project.slug}`}
        className="group block rounded-card focus-visible:outline-offset-4"
      >
        <Spotlight className="flex flex-col gap-8 overflow-hidden rounded-card border border-border bg-surface p-6 transition-[border-color,transform] duration-500 ease-out-expo group-hover:-translate-y-1 group-hover:border-border-strong sm:p-10 md:flex-row md:items-end md:justify-between lg:p-12">
          <div className="min-w-0">
            <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Next project</p>
            <p className="mt-4 font-display text-section font-extrabold text-balance text-fg uppercase">
              {project.name}
            </p>
            <p className="mt-4 max-w-xl text-muted">{project.tagline}</p>
          </div>
          <span
            aria-hidden
            className="grid size-16 shrink-0 place-items-center rounded-full bg-accent text-accent-contrast transition-transform duration-500 ease-out-expo group-hover:translate-x-1 md:size-20"
          >
            <ArrowRight className="size-7" />
          </span>
        </Spotlight>
      </Link>
    </Reveal>
  );
}

/** Closing prompt: the case study has done its job, so make the next step easy. */
export function CaseCta() {
  return (
    <Reveal className="mt-6">
      <div className="flex flex-col gap-6 rounded-card border border-border bg-surface-2/50 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
            Have something like this in mind?
          </p>
          <p className="mt-2 text-muted">{site.contact.heading}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {site.calLink && (
            <ButtonAnchor href={site.calLink} external data-track="case-study:book-call">
              <CalendarDays aria-hidden className="size-4" />
              Book a call
            </ButtonAnchor>
          )}
          <ButtonLink
            href="/#contact"
            transitionTypes={["nav-back"]}
            variant={site.calLink ? "secondary" : "primary"}
            data-track="case-study:get-in-touch"
          >
            Get in touch
            <ArrowUpRight aria-hidden className="size-4" />
          </ButtonLink>
        </div>
      </div>
    </Reveal>
  );
}
