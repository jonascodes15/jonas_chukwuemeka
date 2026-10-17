import { ArrowUpRight, BookOpen } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/motion/reveal";
import { degree, publication, training } from "@/content/education";
import { site } from "@/content/site";
import { AboutPhoto } from "./about-photo";

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-border py-24 md:py-32">
      <div className="container-page">
        <h2
          id="about-title"
          className="flex items-center gap-2 font-mono text-xs tracking-[0.18em] text-muted uppercase"
        >
          <span aria-hidden className="inline-block size-1.5 rounded-full bg-accent" />
          About
        </h2>

        <div className="mt-8 grid gap-12 md:mt-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <Reveal className="mx-auto w-full max-w-sm lg:sticky lg:top-28 lg:max-w-none lg:self-start">
            <AboutPhoto alt={`${site.name}, full-length portrait`} />
          </Reveal>

          <div>
            <div className="space-y-5">
              {site.about.paragraphs.map((p) => (
                <Reveal key={p}>
                  <p className="text-lg leading-relaxed text-muted">{p}</p>
                </Reveal>
              ))}
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              <Reveal className="rounded-card border border-border bg-surface p-6">
                <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Education</p>
                <div className="mt-5 flex items-start gap-4">
                  <span className="relative size-12 shrink-0 overflow-hidden rounded-xl border border-border bg-white">
                    <Image src={degree.logo} alt="" fill sizes="48px" className="object-contain p-1" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-fg">
                      {degree.qualification}
                    </h3>
                    <p className="mt-1 text-sm text-muted">{degree.institution}</p>
                    <p className="mt-2 font-mono text-xs text-muted">
                      {degree.start} to {degree.end}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08} className="flex flex-col rounded-card border border-border bg-surface p-6">
                <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Research</p>
                <div className="mt-5 flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent-ink">
                    <BookOpen aria-hidden className="size-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight text-fg">
                      {publication.role}, peer-reviewed paper
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                      {publication.journal}, {publication.date}
                    </p>
                  </div>
                </div>
              </Reveal>

              <Reveal className="rounded-card border border-border bg-surface p-6 sm:col-span-2">
                <p className="text-[0.95rem] leading-relaxed text-fg italic">{publication.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted">{publication.contribution}</p>
                {publication.href && (
                  <a
                    href={publication.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-accent-ink underline-offset-4 hover:underline"
                  >
                    DOI {publication.doi}
                    <ArrowUpRight
                      aria-hidden
                      className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                )}
              </Reveal>

              <Reveal className="rounded-card border border-border bg-surface p-6 sm:col-span-2">
                <p className="font-mono text-xs tracking-[0.18em] text-muted uppercase">Training</p>
                <ul className="mt-4 divide-y divide-border">
                  {training.map((t) => (
                    <li
                      key={t.title}
                      className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
                    >
                      <span className="text-[0.95rem] text-fg">
                        {t.title}
                        {t.provider && <span className="text-muted">, {t.provider}</span>}
                        {t.note && (
                          <span className="ml-2 rounded-pill bg-accent px-2 py-0.5 align-middle font-mono text-[0.6rem] tracking-wide text-accent-contrast uppercase">
                            {t.note}
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-muted">{t.date}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
