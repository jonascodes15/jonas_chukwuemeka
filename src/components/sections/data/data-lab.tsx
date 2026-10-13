import { FlaskConical } from "lucide-react";
import { Counter } from "@/components/motion/counter";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { Spotlight } from "@/components/motion/spotlight";
import { ChipList } from "@/components/ui/chip";
import { BrowserFrame } from "@/components/ui/device-frame";
import { SectionHeading } from "@/components/ui/section-heading";
import { dataProjects } from "@/content/dataProjects";
import type { DataProject } from "@/content/types";
import { ProjectLinks } from "../work/project-links";
import { ArchitectureDiagram } from "./architecture-diagram";

export function DataLab() {
  const featured = dataProjects.filter((p) => p.featured);
  const rest = dataProjects.filter((p) => !p.featured);

  return (
    <section
      id="data"
      aria-labelledby="data-title"
      className="relative isolate overflow-hidden bg-lab py-24 md:py-32"
    >
      <div
        aria-hidden
        className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_70%)] opacity-70"
      />
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading id="data-title" eyebrow="Data and research" lead="From the" trail="Lab" />
          <Reveal className="max-w-md lg:pb-3">
            <p className="text-muted">
              Where my biology training meets data engineering: streaming pipelines, warehouses and retrieval
              systems, starting with one grounded in my own published research.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 space-y-6 md:mt-20 md:space-y-8">
          {featured.map((p) => (
            <FeaturedDataProject key={p.slug} project={p} />
          ))}

          <RevealGroup as="ul" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((p) => (
              <RevealItem as="li" key={p.slug} className="flex">
                <DataCard project={p} />
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </div>
    </section>
  );
}

function FeaturedDataProject({ project }: { project: DataProject }) {
  return (
    <Reveal as="article" aria-labelledby={`${project.slug}-name`} className="rounded-card">
      <Spotlight className="overflow-hidden rounded-card border border-border bg-surface">
        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <div className="flex flex-col p-6 sm:p-10 lg:p-12">
            <p className="inline-flex w-fit items-center gap-2 rounded-pill bg-accent px-3 py-1 font-mono text-[0.68rem] font-medium tracking-[0.14em] text-accent-contrast uppercase">
              <FlaskConical aria-hidden className="size-3.5" />
              Featured, research grounded
            </p>
            <h3
              id={`${project.slug}-name`}
              className="mt-6 font-display text-4xl font-extrabold tracking-tight text-fg sm:text-5xl"
            >
              {project.name}
            </h3>
            <p className="mt-3 text-lg font-medium text-fg sm:text-xl">{project.tagline}</p>
            <p className="mt-4 leading-relaxed text-muted">{project.summary}</p>

            <ol className="mt-6 space-y-3">
              {project.highlights.map((h, i) => (
                <li key={h} className="flex gap-3 text-[0.95rem] leading-relaxed text-fg">
                  <span className="mt-0.5 font-mono text-xs text-accent-ink">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {h}
                </li>
              ))}
            </ol>

            {project.metrics && (
              <dl className="mt-8 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
                {project.metrics.map((m) => (
                  <div key={m.label} className="flex flex-col-reverse justify-end gap-1 bg-surface p-4">
                    <dt className="text-xs leading-snug text-muted">{m.label}</dt>
                    <dd className="font-display text-2xl font-extrabold tracking-tight text-fg">
                      <Counter value={m.value} decimals={m.decimals} prefix={m.prefix} suffix={m.suffix} />
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <ChipList items={project.stack} className="mt-7" />
            <div className="mt-auto pt-9">
              <ProjectLinks
                links={project.links}
                caseStudyHref={project.caseStudy ? `/work/${project.slug}` : undefined}
                name={project.name}
              />
            </div>
          </div>

          {project.architecture && (
            <div className="flex flex-col justify-center border-t border-border bg-lab/60 p-5 sm:p-8 lg:border-t-0 lg:border-l lg:p-10">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Architecture</p>
                <p className="flex items-center gap-4 font-mono text-[0.65rem] text-muted">
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="h-px w-5 bg-border-strong" />
                    Data flow
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span aria-hidden className="w-5 border-t border-dashed border-border-strong" />
                    Orchestration
                  </span>
                </p>
              </div>
              <ArchitectureDiagram architecture={project.architecture} title={project.name} />
              <p className="mt-6 text-xs text-muted">Hover a component to trace its connections.</p>
            </div>
          )}
        </div>

        {project.screenshots.length > 0 && (
          <div className="grid gap-6 border-t border-border bg-surface-2/50 p-5 sm:p-8 md:grid-cols-2 lg:p-10">
            {project.screenshots.slice(0, 2).map((shot) => (
              <figure key={shot.name}>
                <BrowserFrame shot={shot} sizes="(min-width: 768px) 560px, 90vw" />
                <figcaption className="mt-3 text-sm text-muted">{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
        )}
      </Spotlight>
    </Reveal>
  );
}

function DataCard({ project }: { project: DataProject }) {
  const cover = project.screenshots[0];
  const liveLink = project.links.find((l) => l.kind === "live" && l.href);
  return (
    <Spotlight className="flex w-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-border-strong">
      <div className="relative overflow-hidden border-b border-border bg-lab/60 p-4 sm:p-5">
        {cover ? (
          <BrowserFrame
            shot={cover}
            url={liveLink?.href ? new URL(liveLink.href).host : undefined}
            sizes="(min-width: 1024px) 380px, (min-width: 768px) 45vw, 90vw"
            className="transition-transform duration-700 ease-out-expo group-hover/spot:scale-[1.02]"
          />
        ) : project.architecture ? (
          <ArchitectureDiagram
            architecture={project.architecture}
            title={project.name}
            compact
            className="py-2"
          />
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-2xl font-bold tracking-tight text-fg">{project.name}</h3>
        <p className="mt-2 text-[0.95rem] font-medium text-fg">{project.tagline}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">{project.summary}</p>
        <ChipList items={project.stack} className="mt-5" />
        <div className="mt-auto pt-6">
          <ProjectLinks
            links={project.links}
            caseStudyHref={project.caseStudy ? `/work/${project.slug}` : undefined}
            name={project.name}
            compact
          />
        </div>
      </div>
    </Spotlight>
  );
}
