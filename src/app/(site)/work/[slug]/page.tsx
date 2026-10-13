import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseCta, NextProject } from "@/components/case-study/case-footer";
import { CaseHero } from "@/components/case-study/case-hero";
import { CaseSection } from "@/components/case-study/case-section";
import { Gallery } from "@/components/case-study/gallery";
import { ReadingProgress } from "@/components/case-study/reading-progress";
import { PageTransition } from "@/components/motion/page-transition";
import { caseStudySchema, JsonLd } from "@/components/seo/json-ld";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { ArchitectureDiagram } from "@/components/sections/data/architecture-diagram";
import { ProjectLinks } from "@/components/sections/work/project-links";
import { site } from "@/content/site";
import { caseStudyEntries, getCaseStudy } from "@/content/work";

// Everything here is static content. Requiring a complete static render also means an unknown
// slug is rendered in full before responding, so it gets a real 404 status, not a streamed one.
export const ensureStatic = "navigation";

export function generateStaticParams() {
  return caseStudyEntries.map((e) => ({ slug: e.project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/work/[slug]">): Promise<Metadata> {
  const entry = getCaseStudy((await params).slug);
  if (!entry) return {};
  const { project } = entry;
  const title = `${project.name} case study`;
  const url = `/work/${project.slug}`;

  // The share image comes from opengraph-image.tsx next to this page; X falls back to it too.
  return {
    title,
    description: project.tagline,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      locale: "en_NG",
      siteName: site.name,
      url,
      title: `${title} | ${site.name}`,
      description: project.tagline,
    },
    twitter: {
      card: "summary_large_image",
      creator: "@JCK_ng",
      title: `${title} | ${site.name}`,
      description: project.tagline,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/work/[slug]">) {
  const entry = getCaseStudy((await params).slug);
  if (!entry) notFound();

  const { project, caseStudy: cs, next, index } = entry;
  // The hero already shows the diagram when there are no screenshots.
  const architecture =
    project.screenshots.length > 0
      ? (cs.architecture ?? ("architecture" in project ? project.architecture : undefined))
      : undefined;

  const chapters = [
    "problem",
    "built",
    "how",
    "stack",
    "challenges",
    ...(project.screenshots.length > 0 ? ["gallery"] : []),
    "links",
  ];
  const n = (id: string) => chapters.indexOf(id) + 1;

  return (
    <PageTransition>
      <article>
        <JsonLd data={caseStudySchema(entry)} />
        <ReadingProgress />
        <CaseHero entry={entry} position={index + 1} total={caseStudyEntries.length} />

        <div className="container-page">
          <CaseSection id="problem" number={n("problem")} title="The problem">
            <div className="max-w-2xl space-y-5">
              {cs.problem.map((p, i) => (
                <Reveal key={p} delay={i * 0.05}>
                  <p
                    className={
                      i === 0
                        ? "text-xl leading-relaxed text-fg sm:text-2xl"
                        : "text-lg leading-relaxed text-muted"
                    }
                  >
                    {p}
                  </p>
                </Reveal>
              ))}
            </div>
          </CaseSection>

          <CaseSection id="built" number={n("built")} title="What I built">
            <Reveal>
              <p className="max-w-2xl text-lg leading-relaxed text-muted">{cs.builtIntro}</p>
            </Reveal>
            <RevealGroup as="ul" className="mt-10 grid gap-4 sm:grid-cols-2">
              {cs.built.map((b, i) => (
                <RevealItem
                  as="li"
                  key={b.title}
                  className="rounded-2xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-border-strong"
                >
                  <p className="font-mono text-xs text-accent-ink">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-3 text-lg font-semibold tracking-tight text-fg">{b.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{b.body}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </CaseSection>

          <CaseSection id="how" number={n("how")} title="How it works">
            {architecture && (
              <Reveal className="mb-12 rounded-card border border-border bg-lab p-5 sm:p-8">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Architecture</p>
                  <p className="text-xs text-muted">Hover a component to trace its connections.</p>
                </div>
                <ArchitectureDiagram architecture={architecture} title={project.name} />
              </Reveal>
            )}
            <RevealGroup
              as="ol"
              className="relative space-y-8 before:absolute before:top-2 before:bottom-2 before:left-4.75 before:w-px before:bg-border"
            >
              {cs.howItWorks.map((step, i) => (
                <RevealItem as="li" key={step.title} className="relative flex gap-5">
                  <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full border border-border-strong bg-bg font-mono text-xs text-accent-ink">
                    {i + 1}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="font-semibold tracking-tight text-fg">{step.title}</h3>
                    <p className="mt-1.5 max-w-2xl leading-relaxed text-muted">{step.body}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </CaseSection>

          <CaseSection id="stack" number={n("stack")} title="Tech stack and why">
            <RevealGroup as="ul" className="divide-y divide-border border-y border-border">
              {cs.stackWhy.map((s) => (
                <RevealItem
                  as="li"
                  key={s.tech}
                  className="grid gap-1 py-5 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] sm:gap-8"
                >
                  <p className="font-medium text-fg">{s.tech}</p>
                  <p className="leading-relaxed text-muted">{s.why}</p>
                </RevealItem>
              ))}
            </RevealGroup>
          </CaseSection>

          <CaseSection id="challenges" number={n("challenges")} title="Challenges and what I learned">
            <RevealGroup as="ul" className="grid gap-4 md:grid-cols-2">
              {cs.challenges.map((c) => (
                <RevealItem as="li" key={c.title} className="rounded-2xl border border-border bg-surface p-6">
                  <h3 className="text-lg font-semibold tracking-tight text-fg">{c.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{c.body}</p>
                </RevealItem>
              ))}
            </RevealGroup>

            <Reveal className="mt-6 rounded-card bg-card-dark p-6 text-card-dark-fg sm:p-8">
              <h3 className="font-mono text-xs tracking-[0.18em] uppercase opacity-70">What I learned</h3>
              <ul className="mt-5 space-y-4">
                {cs.learned.map((l) => (
                  <li key={l} className="flex gap-3 text-lg leading-relaxed">
                    <span aria-hidden className="mt-3 size-1.5 shrink-0 rounded-full bg-accent" />
                    {l}
                  </li>
                ))}
              </ul>
            </Reveal>

            {cs.scope && (
              <Reveal className="mt-6 rounded-2xl border border-dashed border-border-strong p-6">
                <h3 className="font-mono text-xs tracking-[0.18em] text-muted uppercase">
                  What this is and isn&apos;t
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{cs.scope}</p>
              </Reveal>
            )}
          </CaseSection>

          {project.screenshots.length > 0 && (
            <CaseSection id="gallery" number={n("gallery")} title="Screens">
              {cs.galleryNote && (
                <Reveal>
                  <p className="mb-8 max-w-2xl text-sm text-muted">{cs.galleryNote}</p>
                </Reveal>
              )}
              <Gallery shots={project.screenshots} name={project.name} />
            </CaseSection>
          )}

          <CaseSection id="links" number={n("links")} title="Links">
            <Reveal>
              <p className="mb-6 max-w-2xl text-lg text-muted">See {project.name} for yourself.</p>
              <ProjectLinks links={project.links} name={project.name} />
            </Reveal>
          </CaseSection>

          <div className="border-t border-border pt-16 md:pt-24">
            <nav aria-label="Next case study">
              <NextProject next={next} />
            </nav>
            <CaseCta />
          </div>
        </div>
      </article>
    </PageTransition>
  );
}
