import { ArrowDown, ArrowUpRight, Database } from "lucide-react";
import { Fragment } from "react";
import { SocialIcon } from "@/components/icons/social-icon";
import { Enter } from "@/components/motion/enter";
import { ButtonLink } from "@/components/ui/button";
import { site } from "@/content/site";
import { activeSocials } from "@/content/socials";
import { getSettings } from "@/server/settings";
import { HeroHeadline } from "./hero-headline";
import { HeroPortrait } from "./hero-portrait";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <HeroBackground />

      <div className="container-page grid items-center gap-14 pt-10 pb-20 sm:pt-14 lg:min-h-[calc(100dvh-4.5rem)] lg:grid-cols-[1.25fr_0.75fr] lg:gap-10 lg:py-16">
        <div className="@container">
          <AvailabilityBadge />

          <h1 id="hero-title" className="font-display text-hero font-extrabold text-fg">
            <span className="sr-only">{site.name}. </span>
            <HeroHeadline text={site.hero.headline} highlight={site.hero.highlight} />
          </h1>

          <Enter delay={0.5}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              {site.hero.supporting}
            </p>
          </Enter>

          <Enter delay={0.58}>
            <DataStrip />
          </Enter>

          <Enter delay={0.7}>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={`/#${site.hero.primaryCta.target}`} size="lg" data-track="hero:see-my-work">
                {site.hero.primaryCta.label}
                <ArrowDown
                  aria-hidden
                  className="size-4 transition-transform group-hover/btn:translate-y-0.5"
                />
              </ButtonLink>
              <ButtonLink
                href={`/#${site.hero.secondaryCta.target}`}
                size="lg"
                variant="secondary"
                data-track="hero:get-in-touch"
              >
                {site.hero.secondaryCta.label}
                <ArrowUpRight
                  aria-hidden
                  className="size-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5"
                />
              </ButtonLink>
            </div>

            <ul className="mt-9 flex items-center gap-2" aria-label="Find me online">
              {activeSocials.map((s) => (
                <li key={s.key}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${s.label} (opens in a new tab)`}
                    className="grid size-10 place-items-center rounded-full border border-border text-muted transition-colors hover:border-fg hover:text-fg"
                  >
                    <SocialIcon name={s.key} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </Enter>
        </div>

        <HeroPortrait name={site.name} />
      </div>
    </section>
  );
}

/**
 * The data side of the work, for data hiring managers: a label, one line, and a small pipeline
 * of the tools with dots flowing through it. The whole card links to the Data lab.
 */
function DataStrip() {
  const { data } = site.hero;
  return (
    <a
      href={`/#${data.target}`}
      data-track="hero:data-lab"
      className="group mt-6 flex max-w-xl flex-col gap-3 rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur transition-colors duration-300 hover:border-border-strong sm:p-5"
    >
      <span className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.16em] text-muted uppercase">
          <Database aria-hidden className="size-3.5 text-accent-ink" />
          {data.label}
        </span>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-ink">
          <span className="max-sm:sr-only">{data.cta}</span>
          <span className="grid size-7 place-items-center rounded-full border border-border transition-colors group-hover:border-accent-ink">
            <ArrowDown
              aria-hidden
              className="size-3.5 transition-transform duration-300 group-hover:translate-y-0.5"
            />
          </span>
        </span>
      </span>

      <span className="text-[0.95rem] text-fg">{data.line}</span>

      <span className="sr-only">Tools: {data.pipeline.join(", ")}.</span>
      <span aria-hidden className="flex items-center">
        {data.pipeline.map((tool, i) => (
          <Fragment key={tool}>
            {i > 0 && (
              <span className="relative h-2 min-w-4 flex-1 overflow-hidden">
                <span className="absolute inset-x-0 top-1/2 h-px bg-border-strong" />
                <span
                  className="animate-pipe-flow absolute inset-0 motion-reduce:hidden"
                  style={{ animationDelay: `${(i - 1) * 0.6}s` }}
                >
                  <span className="absolute top-1/2 right-0 size-1.5 -translate-y-1/2 rounded-full bg-accent-ink shadow-[0_0_8px_var(--accent)]" />
                </span>
              </span>
            )}
            <span className="shrink-0 rounded-md border border-border bg-surface-2 px-2 py-1 font-mono text-[0.68rem] leading-none text-fg">
              {tool}
            </span>
          </Fragment>
        ))}
      </span>
    </a>
  );
}

function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,black,transparent)]" />
    </div>
  );
}

/**
 * Set from /admin/settings; hidden when availability is switched off.
 * Cached with the page and refreshed when the setting is saved.
 */
async function AvailabilityBadge() {
  const { availableForWork, availabilityLabel } = await getSettings();
  if (!availableForWork) return null;
  return (
    <Enter y={12} className="mb-7">
      <p className="inline-flex items-center gap-2.5 rounded-pill border border-border bg-surface/70 py-1.5 pr-4 pl-3 text-sm text-muted backdrop-blur">
        <span aria-hidden className="size-2 animate-pulse-dot rounded-full bg-accent" />
        {availabilityLabel}
      </p>
    </Enter>
  );
}
