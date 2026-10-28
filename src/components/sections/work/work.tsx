import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getProject, stores } from "@/content/projects";
import type { Screenshot } from "@/content/types";
import { ProjectFeature } from "./project-feature";
import { SetupSteps } from "./setup-steps";
import { StoreCards } from "./store-cards";

/**
 * Height of the fixed header from md up (h-18 plus its 1px bottom border), measured in the browser.
 * Phones get 65px; the extra 8px there only adds a little air above the pinned strip.
 */
const NAV_HEIGHT = 73;

function pick(shots: Screenshot[], name: string) {
  const shot = shots.find((s) => s.name === name);
  if (!shot) throw new Error(`Missing screenshot "${name}"`);
  return shot;
}

export function Work() {
  const weblanda = getProject("weblanda")!;
  const formtified = getProject("formtified")!;

  return (
    <section id="work" aria-labelledby="work-title" className="py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="work-title" eyebrow="Selected work" lead="Recent" trail="Projects" />
          <Reveal className="max-w-sm lg:pb-3">
            <p className="text-muted">
              Products I designed, built and run myself, from the first product decision to the code, the
              payments and the brand.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 md:mt-20">
          <ProjectFeature
            project={weblanda}
            label="01 / Founder and builder"
            desktop={pick(weblanda.screenshots, "analytics-desktop")}
            phone={pick(weblanda.screenshots, "screen-overview")}
            url="weblanda.com/dashboard"
            demoNote="Shown with a demo shop"
          />
        </div>
      </div>

      {/* Outside the page column, and not in a card or a <Reveal>: the strip pins with
          position: sticky and slides out to the screen edge (see SetupSteps). */}
      <div className="mt-16 md:mt-24">
        <div className="container-page">
          <Reveal className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <h3 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              From your phone to a live shop, <span className="text-ghost">in five steps.</span>
            </h3>
            <p className="font-mono text-xs text-muted">Real Weblanda screens, shown with a demo shop</p>
          </Reveal>
        </div>
        <SetupSteps navHeight={NAV_HEIGHT} />
      </div>

      <div className="container-page mt-16 space-y-6 md:mt-24 md:space-y-8">
        <div className="rounded-card border border-border bg-surface/50 p-6 sm:p-10">
          <Reveal className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <h3 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              Stores running <span className="text-ghost">on Weblanda.</span>
            </h3>
            <p className="max-w-xs text-sm text-muted">
              Each store has its own address, checkout and dashboard. Tap one to visit it.
            </p>
          </Reveal>
          <StoreCards stores={stores} />
        </div>

        <ProjectFeature
          project={formtified}
          label="02 / Product"
          desktop={pick(formtified.screenshots, "generate-done")}
          phone={pick(formtified.screenshots, "mobile-client-form")}
          url="formtified.com"
          demoNote="Demo data"
          reverse
        />
      </div>
    </section>
  );
}
