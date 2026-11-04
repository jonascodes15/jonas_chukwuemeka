import { ArrowUpRight, BookOpen, GraduationCap, MapPin, Puzzle, Rocket, Trees, User } from "lucide-react";
import Image from "next/image";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/ui/section-heading";
import { degree, publication, training } from "@/content/education";
import { site } from "@/content/site";
import { AboutPhoto } from "./about-photo";

const FACT_ICONS = { "Goes by": User, "Based in": MapPin, Studied: GraduationCap, Building: Rocket };

export function About() {
  const { about } = site;

  return (
    <section id="about" aria-labelledby="about-title" className="border-t border-border py-24 md:py-32">
      <div className="container-page">
        <SectionHeading id="about-title" eyebrow={about.eyebrow} lead={about.lead} trail={about.trail} />

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <Reveal className="mx-auto w-full max-w-sm lg:sticky lg:top-28 lg:max-w-none lg:self-start">
            <AboutPhoto alt={`${site.name}, full-length portrait`} />
          </Reveal>

          <div>
            <div className="space-y-5">
              {about.paragraphs.map((p) => (
                <Reveal key={p}>
                  <p className="text-lg leading-relaxed text-muted">{p}</p>
                </Reveal>
              ))}
            </div>

            <RevealGroup as="ul" className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {about.facts.map((f) => {
                const Icon = FACT_ICONS[f.label as keyof typeof FACT_ICONS] ?? User;
                return (
                  <RevealItem
                    as="li"
                    key={f.label}
                    className="rounded-2xl border border-border bg-surface px-4 py-4"
                  >
                    <Icon aria-hidden className="size-4 text-accent-ink" />
                    <p className="mt-3 font-mono text-[0.68rem] tracking-[0.16em] text-muted uppercase">
                      {f.label}
                    </p>
                    <p className="mt-1 font-display text-base font-bold tracking-tight text-fg">{f.value}</p>
                  </RevealItem>
                );
              })}
            </RevealGroup>

            <div className="mt-12">
              <Reveal>
                <h3 className="font-display text-2xl font-extrabold tracking-tight text-fg sm:text-3xl">
                  {about.interestsTitle}
                </h3>
              </Reveal>
              <RevealGroup as="ul" className="mt-6 grid gap-4 sm:grid-cols-3">
                {about.interests.map((item) => (
                  <RevealItem
                    as="li"
                    key={item.key}
                    className="group flex flex-col rounded-card border border-border bg-surface p-6 transition-colors duration-300 hover:border-border-strong"
                  >
                    <InterestMark kind={item.key} />
                    <h4 className="mt-5 font-display text-lg font-bold tracking-tight text-fg">
                      {item.title}
                    </h4>
                    <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{item.body}</p>
                  </RevealItem>
                ))}
              </RevealGroup>
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
                      <span className="flex shrink-0 items-center gap-3">
                        {t.credentialUrl && (
                          <a
                            href={t.credentialUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-track="about:credential"
                            className="group inline-flex items-center gap-1 font-mono text-xs text-accent-ink underline-offset-4 hover:underline"
                          >
                            Verify
                            <ArrowUpRight
                              aria-hidden
                              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                            />
                            <span className="sr-only">{` the ${t.title} certificate (opens in a new tab)`}</span>
                          </a>
                        )}
                        <span className="font-mono text-xs text-muted">{t.date}</span>
                      </span>
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

/** Scrabble values for J, A and Y. */
const TILES = [
  { letter: "J", points: 8, tilt: "-rotate-6" },
  { letter: "A", points: 1, tilt: "rotate-3" },
  { letter: "Y", points: 4, tilt: "-rotate-2" },
];

/** The picture at the top of each interest card: an icon, or three Scrabble tiles spelling JAY. */
function InterestMark({ kind }: { kind: string }) {
  if (kind === "scrabble") {
    return (
      <span aria-hidden className="flex h-12 items-center gap-1.5">
        {TILES.map((t) => (
          <span
            key={t.letter}
            className={`relative grid size-10 place-items-center rounded-lg bg-accent font-display text-lg font-extrabold text-accent-contrast shadow-[inset_0_-3px_0_rgb(0_0_0/0.18)] transition-transform duration-500 ease-out-expo group-hover:rotate-0 ${t.tilt}`}
          >
            {t.letter}
            <span className="absolute right-1 bottom-0.5 font-mono text-[0.55rem] leading-none font-bold">
              {t.points}
            </span>
          </span>
        ))}
      </span>
    );
  }

  const Icon = kind === "nature" ? Trees : Puzzle;
  return (
    <span
      aria-hidden
      className="grid size-12 place-items-center rounded-xl bg-surface-2 text-accent-ink transition-transform duration-500 ease-out-expo group-hover:-rotate-6"
    >
      <Icon className="size-5" />
    </span>
  );
}
