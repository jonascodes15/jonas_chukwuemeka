import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Counter } from "@/components/motion/counter";
import { Reveal } from "@/components/motion/reveal";
import { ArchitectureDiagram } from "@/components/sections/data/architecture-diagram";
import { DeviceStack } from "@/components/sections/work/device-stack";
import { ProjectLinks } from "@/components/sections/work/project-links";
import { BrowserFrame } from "@/components/ui/device-frame";
import type { CaseStudyEntry } from "@/content/work";

/** Top of a case study: back link, title, summary, links, a cover visual and quick facts. */
export function CaseHero({
  entry,
  position,
  total,
}: {
  entry: CaseStudyEntry;
  position: number;
  total: number;
}) {
  const { project, caseStudy, section } = entry;
  const desktop = project.screenshots.find((s) => s.device === "desktop");
  const phone = project.screenshots.find((s) => s.device === "phone");
  const live = project.links.find((l) => l.kind === "live" && l.href)?.href;
  const host = live ? new URL(live).host.replace(/^www\./, "") : undefined;
  const architecture =
    caseStudy.architecture ?? ("architecture" in project ? project.architecture : undefined);
  const metrics = "metrics" in project ? project.metrics : undefined;

  return (
    <section className="relative isolate overflow-hidden pt-8 pb-14 md:pt-12 md:pb-20">
      <div
        aria-hidden
        className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_10%,transparent_70%)]"
      />
      <div
        aria-hidden
        className="absolute -top-40 left-1/2 -z-10 size-176 -translate-x-1/2 rounded-full bg-accent-glow blur-3xl"
      />

      <div className="container-page">
        <Reveal y={10}>
          <Link
            href={`/#${section}`}
            transitionTypes={["nav-back"]}
            className="group inline-flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-muted uppercase transition-colors hover:text-fg"
          >
            <ArrowLeft aria-hidden className="size-4 transition-transform group-hover:-translate-x-0.5" />
            {section === "work" ? "Back to work" : "Back to data work"}
          </Link>
        </Reveal>

        <div className="mt-10 grid items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
          <div>
            <Reveal y={16} delay={0.05}>
              <p className="flex items-center gap-3 font-mono text-xs tracking-[0.18em] text-muted uppercase">
                {project.logo && (
                  <span className="relative size-9 overflow-hidden rounded-xl border border-border">
                    <Image src={project.logo} alt="" fill sizes="36px" className="object-cover" priority />
                  </span>
                )}
                Case study {String(position).padStart(2, "0")} / {String(total).padStart(2, "0")}
              </p>
            </Reveal>
            <Reveal y={24} delay={0.1}>
              <h1 className="mt-6 font-display text-section font-extrabold text-balance text-fg uppercase">
                {project.name}
              </h1>
            </Reveal>
            <Reveal y={20} delay={0.18}>
              <p className="mt-6 text-xl font-medium text-balance text-fg sm:text-2xl">{project.tagline}</p>
              <p className="mt-4 max-w-xl leading-relaxed text-muted">{project.summary}</p>
            </Reveal>
            <Reveal y={16} delay={0.26} className="mt-8">
              <ProjectLinks links={project.links} name={project.name} />
            </Reveal>
          </div>

          <Reveal y={32} delay={0.15}>
            <div className="relative isolate overflow-hidden rounded-card border border-border bg-surface-2/60">
              <div
                aria-hidden
                className="bg-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]"
              />
              {desktop && phone ? (
                <DeviceStack desktop={desktop} phone={phone} url={host ?? project.name} eager />
              ) : desktop ? (
                <div className="p-5 sm:p-8">
                  <BrowserFrame shot={desktop} url={host} eager sizes="(min-width: 1024px) 600px, 92vw" />
                </div>
              ) : architecture ? (
                <div className="bg-lab/60 p-5 sm:p-8">
                  <ArchitectureDiagram architecture={architecture} title={project.name} />
                </div>
              ) : null}
            </div>
          </Reveal>
        </div>

        <Reveal y={16} delay={0.1} className="mt-14 md:mt-20">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-4">
            {caseStudy.facts.map((f) => (
              <div key={f.label} className="bg-surface p-4 sm:p-5">
                <dt className="font-mono text-[0.68rem] tracking-[0.14em] text-muted uppercase">{f.label}</dt>
                <dd className="mt-2 text-sm font-medium text-fg sm:text-base">{f.value}</dd>
              </div>
            ))}
          </dl>
          {metrics && metrics.length > 0 && (
            <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
              {metrics.map((m) => (
                <div key={m.label} className="flex flex-col-reverse justify-end gap-1 bg-surface p-4 sm:p-5">
                  <dt className="text-xs leading-snug text-muted">{m.label}</dt>
                  <dd className="font-display text-3xl font-extrabold tracking-tight text-fg">
                    <Counter value={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} />
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </Reveal>
      </div>
    </section>
  );
}
