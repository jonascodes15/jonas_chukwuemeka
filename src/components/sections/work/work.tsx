import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { getProject, stores } from "@/content/projects";
import type { Screenshot } from "@/content/types";
import { PinnedRail } from "./pinned-rail";
import { ProjectFeature } from "./project-feature";
import { ScreenRail } from "./screen-rail";
import { StoreCards } from "./store-cards";

function pick(shots: Screenshot[], name: string) {
  const shot = shots.find((s) => s.name === name);
  if (!shot) throw new Error(`Missing screenshot "${name}"`);
  return shot;
}

export function Work() {
  const weblanda = getProject("weblanda")!;
  const formtified = getProject("formtified")!;
  const sellerScreens = [
    "screen-start",
    "screen-add-product",
    "screen-orders",
    "screen-inventory",
    "screen-customers",
  ].map((n) => pick(weblanda.screenshots, n));

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

        <div className="mt-14 space-y-6 md:mt-20 md:space-y-8">
          <ProjectFeature
            project={weblanda}
            label="01 / Founder and builder"
            desktop={pick(weblanda.screenshots, "analytics-desktop")}
            phone={pick(weblanda.screenshots, "screen-overview")}
            url="weblanda.com/dashboard"
            demoNote="Shown with a demo shop"
          />

          <PinnedRail className="rounded-card border border-border bg-surface/50 p-6 sm:p-10">
            <Reveal className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <h3 className="font-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                Everything a seller needs, <span className="text-ghost">from a phone.</span>
              </h3>
              <p className="font-mono text-xs text-muted">
                Weblanda seller dashboard, shown with a demo shop
              </p>
            </Reveal>
            <ScreenRail shots={sellerScreens} label="Weblanda seller dashboard screens" />
          </PinnedRail>

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
      </div>
    </section>
  );
}
