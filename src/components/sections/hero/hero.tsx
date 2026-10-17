import { ArrowDown, ArrowUpRight } from "lucide-react";
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

          <Enter delay={0.65}>
            <div className="mt-9 flex flex-wrap gap-3">
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

function HeroBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,black,transparent)]" />
      <div className="absolute -top-48 left-[8%] size-[38rem] animate-drift rounded-full bg-accent-glow blur-3xl" />
      <div className="absolute right-[-10%] bottom-[-20%] size-[30rem] animate-drift rounded-full bg-accent-glow opacity-60 blur-3xl [animation-delay:-9s]" />
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
